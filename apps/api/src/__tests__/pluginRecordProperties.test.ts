import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** Custom fields on a plugin's own record type: core keeps the fields, the plugin the values. */
describe('plugin record properties', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const employee = 'hr.employee';

  beforeAll(async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '1',
      scopes: [],
    });
  });

  it("defines fields on an installed plugin's record type, refusing other types", async () => {
    const group = await t.owner().fieldGroups.create({ contentType: employee, name: 'Work' });

    const level = await t.owner().fields.create({
      contentType: employee,
      groupId: group.id,
      label: 'Level',
      type: 'select',
      options: ['junior', 'senior'],
    });

    expect(level).toMatchObject({ contentType: employee, groupId: group.id, plugin: null });

    // Members and the plugin itself read them; the other organisation has none.
    for (const client of [t.owner(), t.member(), t.hr()]) {
      expect(
        (await client.fields.list({ contentType: employee })).data.map((field) => field.id),
      ).toEqual([level.id]);
    }

    expect((await t.other().fields.list({ contentType: employee })).data).toEqual([]);
    expect(
      (await t.owner().fieldGroups.list({ contentType: employee })).data.map((row) => row.id),
    ).toEqual([group.id]);

    // No installed plugin keeps `ecom` records.
    await expect(
      t.owner().fields.create({ contentType: 'ecom.order', label: 'Gift', type: 'boolean' }),
    ).rejects.toMatchObject({ status: 400, code: 'PLUGIN_NOT_INSTALLED' });
    await expect(
      t.owner().fieldGroups.create({ contentType: 'ecom.order', name: 'Gifts' }),
    ).rejects.toMatchObject({ status: 400, code: 'PLUGIN_NOT_INSTALLED' });
    await expect(
      t.owner().fields.create({ contentType: 'HR.Employee', label: 'X', type: 'text' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    // A plugin reads its own record types' fields only.
    await expect(t.hr().fields.list({ contentType: 'ecom.order' })).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });
    await expect(t.hr().fields.list({ contentType: 'customer' })).rejects.toMatchObject({
      status: 403,
    });
  });

  it('checks a patch against the fields for the plugin, which keeps the values', async () => {
    const email = await t.owner().fields.create({
      contentType: employee,
      label: 'Work email',
      type: 'text',
      validation: 'email',
    });

    const skills = await t.owner().fields.create({
      contentType: employee,
      label: 'Skills',
      type: 'multiselect',
      options: ['go', 'sql'],
    });

    const vip = await t
      .owner()
      .fields.create({ contentType: 'customer', label: 'VIP', type: 'boolean' });

    const checked = await t.hr().fields.check({
      contentType: employee,
      current: { kept: 'as is' },
      patch: { [email.id]: '  ann@acme.mn ', [skills.id]: ['sql', 'sql', 'go'] },
    });

    expect(checked.values).toEqual({
      kept: 'as is',
      [email.id]: 'ann@acme.mn',
      [skills.id]: ['sql', 'go'],
    });

    // null and empty values clear.
    expect(
      (
        await t.hr().fields.check({
          contentType: employee,
          current: checked.values,
          patch: { [email.id]: null, [skills.id]: [] },
        })
      ).values,
    ).toEqual({ kept: 'as is' });

    await expect(
      t.hr().fields.check({ contentType: employee, current: {}, patch: { [email.id]: 'nope' } }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD_VALUE' });
    await expect(
      t.hr().fields.check({ contentType: employee, current: {}, patch: { [skills.id]: ['rust'] } }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD_VALUE' });
    // A field of another record type is no field of this one.
    await expect(
      t.hr().fields.check({ contentType: employee, current: {}, patch: { [vip.id]: true } }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD' });

    // Another plugin's record type, and members, are refused.
    await expect(
      t.hr().fields.check({ contentType: 'ecom.order', current: {}, patch: {} }),
    ).rejects.toMatchObject({ status: 403, code: 'NOT_ALLOWED' });
    await expect(
      t.owner().fields.check({ contentType: employee, current: {}, patch: {} }),
    ).rejects.toMatchObject({ status: 403 });

    // Archived fields only clear.
    await t.owner().fields.archive({ ids: [email.id] });
    await expect(
      t.hr().fields.check({ contentType: employee, current: {}, patch: { [email.id]: 'a@b.mn' } }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD' });
  });

  it('limits a group to some records, as old sales limited them to pipelines', async () => {
    const group = await t.owner().fieldGroups.create({
      contentType: employee,
      name: 'Engineering',
      appliesTo: { team: ['eng', 'ops'], office: [] },
    });

    expect(group.appliesTo).toEqual({ team: ['eng', 'ops'], office: [] });

    const stack = await t.owner().fields.create({
      contentType: employee,
      groupId: group.id,
      label: 'Stack',
      type: 'text',
    });

    const patch = { [stack.id]: 'rust' };

    // A record in one of the group's teams takes it; any other, or one the plugin says nothing
    // about, takes only clearing.
    expect(
      (
        await t.hr().fields.check({
          contentType: employee,
          current: {},
          patch,
          appliesTo: { team: ['ops'], office: ['ub'] },
        })
      ).values,
    ).toEqual(patch);

    for (const appliesTo of [{ team: ['sales'] }, undefined]) {
      await expect(
        t.hr().fields.check({ contentType: employee, current: {}, patch, appliesTo }),
      ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD' });
    }

    expect(
      (
        await t.hr().fields.check({
          contentType: employee,
          current: patch,
          patch: { [stack.id]: null },
        })
      ).values,
    ).toEqual({});

    // Once it applies to every record, any record takes it.
    const open = await t.owner().fieldGroups.update({ id: group.id, appliesTo: {} });

    expect(open.appliesTo).toEqual({});
    expect(
      (await t.hr().fields.check({ contentType: employee, current: {}, patch })).values,
    ).toEqual(patch);

    // Core's own records have no limits.
    await expect(
      t.owner().fieldGroups.create({
        contentType: 'customer',
        name: 'Engineering',
        appliesTo: { team: ['eng'] },
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD_GROUP' });
  });

  it('counts no values and deletes only definitions, as the plugin keeps the values', async () => {
    const group = await t.owner().fieldGroups.create({ contentType: employee, name: 'Extra' });

    const [shirt, shoe, badge] = await Promise.all(
      ['Shirt size', 'Shoe size', 'Badge'].map((label) =>
        t.owner().fields.create({ contentType: employee, groupId: group.id, label, type: 'text' }),
      ),
    );

    if (!shirt || !shoe || !badge) throw new Error('fields not made');

    expect(await t.owner().fields.usage({ groupId: group.id })).toEqual({
      records: 0,
      options: {},
      removable: true,
    });

    // With no stored values to keep readable, the type changes freely.
    expect((await t.owner().fields.update({ id: shoe.id, type: 'number' })).type).toBe('number');

    await t.owner().fields.remove({ id: shirt.id });
    await t.owner().fields.removeUnused({ ids: [shoe.id] });
    await t.owner().fieldGroups.remove({ id: group.id });

    const left = (await t.owner().fields.list({ contentType: employee, archived: true })).data;
    const all = [...left, ...(await t.owner().fields.list({ contentType: employee })).data];

    expect(all.some((field) => [shirt.id, shoe.id, badge.id].includes(field.id))).toBe(false);
  });

  it('asks required fields on create while their logic shows them, and lets the plugin read its groups', async () => {
    const leave = 'hr.leave';
    const group = await t.owner().fieldGroups.create({ contentType: leave, name: 'Leave' });
    const made = { contentType: leave, groupId: group.id, isRequired: true } as const;

    const kind = await t.owner().fields.create({
      ...made,
      label: 'Kind',
      type: 'select',
      options: ['Sick', 'Holiday'],
      isRequired: false,
    });

    const note = await t.owner().fields.create({
      ...made,
      label: 'Doctor note',
      type: 'text',
      logic: { action: 'show', rules: [{ fieldId: kind.id, operator: 'is', value: 'Sick' }] },
    });

    const approver = await t.owner().fields.create({
      ...made,
      label: 'Approved by',
      type: 'text',
      isVisibleToCreate: false,
    });

    const check = async (current: Record<string, string>, patch: Record<string, string | null>) =>
      (await t.hr().fields.check({ contentType: leave, current, patch, create: !current[kind.id] }))
        .values;

    // A holiday needs no note; a sick day does when it is made, and keeps it after.
    await expect(check({}, { [kind.id]: 'Holiday' })).resolves.toEqual({ [kind.id]: 'Holiday' });
    await expect(check({}, { [kind.id]: 'Sick' })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_FIELD_VALUE',
    });

    const sick = { [kind.id]: 'Sick', [note.id]: 'Flu' };

    await expect(check({}, sick)).resolves.toEqual(sick);
    await expect(check(sick, { [note.id]: null })).rejects.toMatchObject({
      code: 'INVALID_FIELD_VALUE',
    });
    // The approver isn't asked on create, so it is filled in later.
    await expect(check(sick, { [approver.id]: 'Ann' })).resolves.toEqual({
      ...sick,
      [approver.id]: 'Ann',
    });

    // A rule names another field of the same type.
    await expect(
      t.owner().fields.update({
        id: kind.id,
        logic: { action: 'hide', rules: [{ fieldId: kind.id, operator: 'hasValue', value: null }] },
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    // The plugin reads its own record types' groups, not core's records'.
    expect(
      (await t.hr().fieldGroups.list({ contentType: leave })).data.map(({ id }) => id),
    ).toEqual([group.id]);
    await expect(t.hr().fieldGroups.list({ contentType: 'customer' })).rejects.toMatchObject({
      code: 'NOT_ALLOWED',
    });
  });
});
