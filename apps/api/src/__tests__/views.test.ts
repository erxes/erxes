import { describe, expect, it } from 'vite-plus/test';
import { rule, useContacts } from './contacts.fixture';
import { useTestDatabase } from './db';

describe('saved views', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useContacts();

  it('saves views: private to their creator, shared with the team, changed only by who may', async () => {
    const leads = {
      name: 'Golf leads',
      recordType: 'customer' as const,
      filter: rule('subject.primaryEmail', 'contains', 'golf'),
      columns: ['firstName', 'primaryEmail'],
    };

    const mine = await t.member().views.create(leads);

    expect(mine).toMatchObject({
      name: 'Golf leads',
      shared: false,
      editable: true,
      columns: ['firstName', 'primaryEmail'],
    });
    // Private: the owner doesn't see it.
    expect((await t.owner().views.list({ recordType: 'customer' })).data).toEqual([]);

    // A filter that doesn't fit isn't saved.
    await expect(
      t.member().views.create({ ...leads, filter: rule('subject.nope', 'eq', 1) }),
    ).rejects.toMatchObject({ code: 'INVALID_FILTER' });

    // Sharing needs contacts.edit.
    await expect(t.viewer().views.create({ ...leads, shared: true })).rejects.toMatchObject({
      code: 'NOT_ALLOWED',
    });

    const shared = await t.owner().views.create({
      name: 'VIPs',
      recordType: 'customer',
      filter: rule('subject.tagIds', 'contains', t.vip()),
      shared: true,
    });

    expect((await t.viewer().views.list({ recordType: 'customer' })).data).toEqual([
      expect.objectContaining({ name: 'VIPs', shared: true, editable: false }),
    ]);
    await expect(
      t.viewer().views.update({ id: shared.id, name: 'Mine now' }),
    ).rejects.toMatchObject({ code: 'NOT_ALLOWED' });
    // Members who edit contacts may change shared views.
    expect(await t.member().views.update({ id: shared.id, name: 'Top VIPs' })).toMatchObject({
      name: 'Top VIPs',
    });
    // Someone else's private view doesn't exist for them.
    await expect(t.owner().views.remove({ id: mine.id })).rejects.toMatchObject({ status: 404 });

    // A view is just its filter, run live.
    const [view] = (await t.owner().views.list({ recordType: 'customer' })).data;

    if (!view?.filter) throw new Error('the shared view or its filter is gone');

    expect(await t.customersWhere(view.filter)).toEqual(['Bat']);
    expect(await t.member().views.remove({ id: mine.id })).toEqual({ ok: true });
  });

  it('lists what each list can be filtered by', async () => {
    const fields = (await t.owner().views.fields({ recordType: 'customer' })).data;

    expect(fields).toContainEqual(
      expect.objectContaining({ path: 'subject.state', type: 'select', group: 'fields' }),
    );
    expect(fields).toContainEqual(
      expect.objectContaining({
        path: `subject.customFields.${t.fields.spend}`,
        label: 'Spend',
        type: 'number',
        group: 'custom',
      }),
    );
    expect(fields).toContainEqual(
      expect.objectContaining({ path: 'subject.company.industry', group: 'company' }),
    );
    expect(fields).toContainEqual(
      expect.objectContaining({ path: 'subject.lastActivityAt', type: 'date', group: 'activity' }),
    );

    const leadFields = (await t.owner().views.fields({ recordType: 'lead' })).data;

    expect(leadFields.map((field) => field.path)).not.toContain('subject.state');
  });
});
