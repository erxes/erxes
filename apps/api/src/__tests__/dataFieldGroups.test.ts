import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { setUpHr } from './hrPlugin';
import { useTwoOrgs } from './support';

/** Field groups: the sections of a record type's fields, as old properties' groups were. */
describe('Data Extensions field groups', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const groups = (archived = false) =>
    t.owner().dataFieldGroups.list({ recordType: 'core.customer', archived });

  const keys = async (recordType = 'core.customer') =>
    (await t.owner().dataFields.list({ recordType })).data.map((field) => field.key);

  beforeAll(() => setUpHr(t));

  it('adds, renames and orders a record type’s groups', async () => {
    const owner = t.owner();

    const contact = await owner.dataFieldGroups.create({
      recordType: 'core.customer',
      label: 'Contact',
      code: 'contact',
    });

    const billing = await owner.dataFieldGroups.create({
      recordType: 'core.customer',
      label: 'Billing',
      code: 'billing',
      description: 'Where invoices go',
    });

    expect(contact).toMatchObject({ position: 0, appliesTo: {}, archivedAt: null });
    expect(billing).toMatchObject({ position: 1, description: 'Where invoices go' });

    await expect(
      owner.dataFieldGroups.create({
        recordType: 'core.customer',
        label: 'Again',
        code: 'CONTACT',
      }),
    ).rejects.toMatchObject({ status: 409, code: 'TAKEN', data: { field: 'code' } });

    await expect(
      owner.dataFieldGroups.update({ id: billing.id, label: 'Invoices' }),
    ).resolves.toMatchObject({ label: 'Invoices', code: 'billing' });

    const reordered = await owner.dataFieldGroups.reorder({
      recordType: 'core.customer',
      ids: [billing.id, contact.id],
    });

    expect(reordered.data.map((group) => group.code)).toEqual(['billing', 'contact']);
    // Another organisation's groups are its own.
    expect((await t.other().dataFieldGroups.list({ recordType: 'core.customer' })).data).toEqual(
      [],
    );
  });

  it('needs properties.manage to change groups, and limits records only on a plugin’s type', async () => {
    await expect(
      t.member().dataFieldGroups.create({ recordType: 'core.customer', label: 'X', code: 'x' }),
    ).rejects.toMatchObject({ status: 403 });
    // Every member reads them.
    expect(
      (await t.member().dataFieldGroups.list({ recordType: 'core.customer' })).data.map(
        (group) => group.code,
      ),
    ).toEqual(['billing', 'contact']);
    await expect(
      t.owner().dataFieldGroups.create({
        recordType: 'core.customer',
        label: 'Team only',
        code: 'team',
        appliesTo: { team: ['t1'] },
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD_GROUP' });
  });

  it('puts fields in a group, and archiving the group hides its fields', async () => {
    const owner = t.owner();
    const [first] = (await groups()).data;

    if (!first) throw new Error('no group');

    const phone = await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'homePhone',
      label: 'Home phone',
      type: 'phone',
      groupId: first.id,
    });

    expect(phone.groupId).toBe(first.id);

    const other = await t.other().dataFieldGroups.create({
      recordType: 'core.customer',
      label: 'Theirs',
      code: 'theirs',
    });

    // A group of another organisation, or another record type, is no group here.
    await expect(
      owner.dataFields.update({ id: phone.id, groupId: other.id }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE', data: { field: 'groupId' } });

    await owner.dataFieldGroups.archive({ id: first.id });
    expect(await keys()).not.toContain('homePhone');
    expect(
      (await owner.dataFields.list({ recordType: 'core.customer', archived: true })).data.map(
        (field) => field.key,
      ),
    ).toContain('homePhone');
    expect((await groups(true)).data.map((group) => group.id)).toEqual([first.id]);

    await owner.dataFieldGroups.restore({ id: first.id });
    expect(await keys()).toContain('homePhone');

    // Only an empty group goes; a field moved out of it frees it.
    await expect(owner.dataFieldGroups.remove({ id: first.id })).rejects.toMatchObject({
      status: 409,
      code: 'GROUP_IN_USE',
      data: { count: 1 },
    });
    await owner.dataFields.update({ id: phone.id, groupId: null });
    await expect(owner.dataFieldGroups.remove({ id: first.id })).resolves.toEqual({
      id: first.id,
    });
  });

  it('skips the fields of a group that doesn’t apply to a plugin’s record', async () => {
    const owner = t.owner();

    await owner.dataPlugins.connect({ plugin: 'hr' });

    const team = await owner.dataFieldGroups.create({
      recordType: 'hr.employee',
      label: 'Sales team',
      code: 'sales',
      appliesTo: { team: ['sales'] },
    });

    const quota = await owner.dataFields.create({
      recordType: 'hr.employee',
      key: 'quota',
      label: 'Quota',
      type: 'number',
      groupId: team.id,
      settings: { required: true },
    });

    const check = (appliesTo: Record<string, string[]>, patch: Record<string, number> = {}) =>
      t.hr().dataValues.check({
        recordType: 'hr.employee',
        patch,
        create: true,
        appliesTo,
      });

    // In sales, the quota is asked for; elsewhere it isn't, and can't be set.
    await expect(check({ team: ['sales'] })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      data: { issues: [{ path: ['patch', quota.id] }] },
    });
    await expect(check({ team: ['sales'] }, { [quota.id]: 5 })).resolves.toEqual({
      values: { [quota.id]: 5 },
    });
    await expect(check({ team: ['support'] })).resolves.toEqual({ values: {} });
    await expect(check({}, { [quota.id]: 5 })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      data: { issues: [{ path: ['patch', quota.id] }] },
    });
  });
});
