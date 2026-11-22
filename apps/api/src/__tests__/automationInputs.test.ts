import { describe, expect, it } from 'vite-plus/test';
import { action, forCustomer, useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { settle } from './settle';

/** How a step reads its filled-in input: as text, as a list, leaving empty values out. */
describe('automation step input', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useAutomations();
  const { onlyRun, outputsOf } = t;

  it('writes numbers, yes or no and objects out as text, and an empty placeholder as nothing', async () => {
    const id = await t.active(
      'Notes',
      forCustomer('Noted', [
        action('number', 'core.note.add', { body: 7 }),
        action('yes', 'core.note.add', { body: true }),
        action('object', 'core.note.add', { body: { a: 1 } }),
        action('empty', 'core.note.add', { body: '{{subject.lastName}}' }),
      ]),
    );

    const customer = await t.owner().customers.create({ firstName: 'Noted' });

    await settle();

    expect((await onlyRun(id)).run.status).toBe('succeeded');

    const notes = await t
      .owner()
      .activities.list({ targetType: 'customer', targetId: customer.id, kind: 'notes' });

    const bodies = notes.data.map((entry) => entry.note?.body ?? 'none');

    expect(bodies.toSorted()).toEqual(['', '7', 'true', '{"a":1}']);
  });

  it('takes one tag or a list of them, skipping empty ones', async () => {
    const vip = await t
      .owner()
      .tags.create({ type: 'customer', name: 'vip', colorCode: '#ff0000' });

    const old = await t
      .owner()
      .tags.create({ type: 'customer', name: 'old', colorCode: '#00ff00' });

    const id = await t.active(
      'Tags',
      forCustomer('Tagged', [
        action('one', 'core.customer.tag', { add: vip.id }),
        action('list', 'core.customer.tag', { add: [old.id, null], remove: [vip.id] }),
        action('none', 'core.customer.tag', {}),
      ]),
    );

    const customer = await t.owner().customers.create({ firstName: 'Tagged' });

    await settle();

    expect(await outputsOf(id)).toEqual({
      one: { added: [vip.id], removed: [] },
      list: { added: [old.id], removed: [vip.id] },
      none: { added: [], removed: [] },
    });
    expect((await t.owner().customers.get({ id: customer.id })).tagIds).toEqual([old.id]);
  });

  it('leaves empty fields as they are, and reads a members pick as its first member', async () => {
    const id = await t.active(
      'Update',
      forCustomer('Kept', [
        action('update', 'core.customer.update', {
          firstName: '',
          lastName: null,
          description: '{{subject.primaryPhone}}',
          state: 'customer',
          ownerId: [t.ids.member, t.ids.owner],
        }),
      ]),
    );

    const customer = await t
      .owner()
      .customers.create({ firstName: 'Kept', lastName: 'Same', state: 'lead' });

    await settle();

    expect(await outputsOf(id)).toEqual({
      update: { id: customer.id, changed: ['state', 'ownerId'] },
    });
    expect(await t.owner().customers.get({ id: customer.id })).toMatchObject({
      firstName: 'Kept',
      lastName: 'Same',
      state: 'customer',
      ownerId: t.ids.member,
    });
  });

  it('fails the run at once, saying which field, when a step’s input is wrong', async () => {
    const id = await t.active(
      'Bad state',
      forCustomer('Wrong', [
        action('update', 'core.customer.update', { state: '{{subject.firstName}}' }),
      ]),
    );

    const customer = await t.owner().customers.create({ firstName: 'Wrong', state: 'lead' });

    await settle();

    const [run] = await t.runsOf(id);

    expect(run?.status).toBe('failed');
    expect(run?.error).toMatch(/^state: /);
    expect((await t.owner().customers.get({ id: customer.id })).state).toBe('lead');
  });
});
