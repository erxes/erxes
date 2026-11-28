import type { PluginManifest } from '@erxes/core-contract';
import { sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { EMPLOYEE, EMPLOYEE_WITH_FIELDS, hrManifest, saveCustomFields, setUpHr } from './hrPlugin';
import { useTwoOrgs } from './support';

type ManifestObject = NonNullable<PluginManifest['objects']>[number];

/** Positions name a view HR never made. */
const POSITION: ManifestObject = {
  type: 'hr.position',
  label: 'Positions',
  singularLabel: 'Position',
  view: 'hr_position_fields',
  fields: [{ key: 'title', label: 'Title', type: 'text' }],
};

/** Teams' view has no `custom_fields`, so the values of fields added to them can't be read. */
const TEAM: ManifestObject = {
  type: 'hr.team',
  label: 'Teams',
  singularLabel: 'Team',
  view: 'hr_team_fields',
  fields: [{ key: 'title', label: 'Title', type: 'text' }],
};

const TEAM_SQL = `
  SET ROLE erxes_plugin_hr;
  CREATE TABLE hr_teams (id text PRIMARY KEY, org_id text NOT NULL, title text);
  SELECT core_enable_tenant_rls('hr_teams');
  CREATE VIEW hr_team_fields AS SELECT id, org_id, title FROM hr_teams;
  GRANT SELECT ON hr_team_fields TO erxes_core_reader;
  RESET ROLE;
`;

describe('record types members can extend', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const register = async (manifest: PluginManifest) =>
    t.client(await t.pluginToken()).plugins.registerManifest(manifest);

  const types = async () => (await t.member().recordTypes.list({})).data.map((row) => row.type);

  it("lists core's record types, then each connected plugin's objects", async () => {
    await register(hrManifest());

    expect(await types()).toEqual(['core.customer', 'core.company', 'core.product', 'core.member']);
    await expect(t.member().dataPlugins.connect({ plugin: 'hr' })).rejects.toMatchObject({
      status: 403,
    });
    await expect(t.owner().dataPlugins.connect({ plugin: 'nope' })).rejects.toMatchObject({
      code: 'PLUGIN_NOT_INSTALLED',
    });
    await expect(t.owner().dataPlugins.connect({ plugin: 'hr' })).resolves.toMatchObject({
      plugin: 'hr',
      connected: true,
      connectedBy: t.ids.owner,
      fieldCount: 0,
    });

    const { data } = await t.member().recordTypes.list({});

    expect(data.map((row) => row.type)).toEqual([
      'core.customer',
      'core.company',
      'core.product',
      'core.member',
      'hr.employee',
    ]);
    expect(data.at(-1)).toEqual({ ...EMPLOYEE, plugin: 'hr', nativeFields: [] });
    expect(data[0]?.nativeFields.map((field) => field.key)).toContain('firstName');
    // Another organisation hasn't connected HR.
    expect(
      (await t.other().recordTypes.list({})).data.some((row) => row.type === 'hr.employee'),
    ).toBe(false);
  });

  it('refuses objects that are not the plugin’s, or need permissions it doesn’t declare', async () => {
    await expect(register(hrManifest([{ ...EMPLOYEE, type: 'sales.deal' }]))).rejects.toMatchObject(
      { code: 'NAMESPACE_REQUIRED' },
    );
    await expect(
      register(hrManifest([{ ...EMPLOYEE, updatePermission: 'hr.x.y' }])),
    ).rejects.toMatchObject({ code: 'UNKNOWN_PERMISSION', data: { permissions: ['hr.x.y'] } });
    await expect(
      register(hrManifest([EMPLOYEE, { ...EMPLOYEE, label: 'Staff' }])),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });
});

describe('formulas over a connected plugin’s records', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  beforeAll(async () => {
    await setUpHr(t, [EMPLOYEE_WITH_FIELDS, POSITION, TEAM]);
    await adminDb().execute(sql.raw(TEAM_SQL));
    await adminDb().execute(sql`insert into hr_teams values ('t1', ${t.ids.org}, 'Sales')`);
  });

  it('shows each object’s own fields, and why one can’t be read', async () => {
    const { data } = await t.owner().dataPlugins.list({});

    expect(data).toMatchObject([
      {
        plugin: 'hr',
        title: 'HR',
        connected: false,
        objects: [
          {
            type: 'hr.employee',
            nativeFields: [
              { key: 'name', type: 'text' },
              { key: 'salary', type: 'number' },
              { key: 'hired_on', type: 'date' },
            ],
            problem: null,
          },
          {
            type: 'hr.position',
            problem: "The plugin's view hr_position_fields isn't ready for core to read",
          },
          { type: 'hr.team', problem: null },
        ],
      },
    ]);
  });

  it('works out a formula from the plugin’s fields and the values it keeps', async () => {
    const owner = t.owner();

    await owner.dataPlugins.connect({ plugin: 'hr' });

    const bonus = await owner.dataFields.create({
      recordType: 'hr.employee',
      key: 'bonus',
      label: 'Bonus',
      type: 'number',
    });

    await expect(
      owner.dataFields.create({
        recordType: 'hr.employee',
        key: 'salary',
        label: 'Salary',
        type: 'number',
      }),
    ).rejects.toMatchObject({ code: 'TAKEN' });

    const yearly = await owner.dataFields.create({
      recordType: 'hr.employee',
      key: 'yearly',
      label: 'Yearly pay',
      type: 'formula',
      settings: { formula: { expression: '{salary} * 12 + COALESCE({bonus}, 0)' } },
    });

    expect(yearly.settings.formula).toEqual({
      expression: '{salary} * 12 + COALESCE({bonus}, 0)',
      result: 'number',
    });
    await owner.dataFields.create({
      recordType: 'hr.employee',
      key: 'badge',
      label: 'Badge',
      type: 'formula',
      settings: {
        formula: { expression: 'CONCAT(UPPER({name}), " · ", TEXT(DAYS({hired_on}, TODAY())))' },
      },
    });
    // HR keeps the bonus in the employee's `custom_fields`, by field id.
    await saveCustomFields('e1', { [bonus.id]: 500 });

    const { data } = await t.member().dataValues.lookup({
      recordType: 'hr.employee',
      recordIds: ['e1'],
    });

    expect(data.map((row) => [row.recordId, row.values])).toEqual([
      ['e1', { bonus: 500, yearly: 24_500, badge: 'BAT · 10' }],
    ]);
    // Another organisation's employee isn't in the plugin's view core reads.
    await expect(
      t.member().dataValues.lookup({ recordType: 'hr.employee', recordIds: ['e2'] }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE' });
    // HR writes its records' values, not core.
    await expect(
      owner.dataValues.update({ recordType: 'hr.employee', recordId: 'e1', values: { bonus: 1 } }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE', data: { field: 'recordType' } });
  });

  it('previews a formula before it is saved, and points at a mistake', async () => {
    const owner = t.owner();

    await expect(
      owner.dataFields.preview({
        recordType: 'hr.employee',
        formula: { expression: 'ROUND({salary} / 3 + {bonus}, 2)' },
        recordId: 'e1',
      }),
    ).resolves.toEqual({ result: 'number', value: 1166.67 });
    await expect(
      owner.dataFields.preview({
        recordType: 'hr.employee',
        formula: { expression: '{salary} + {nope}' },
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      data: { issues: [{ path: ['settings', 'formula', 'expression', 11] }] },
    });
  });

  it('tells when a plugin’s view has no custom_fields for the fields added', async () => {
    const owner = t.owner();

    await owner.dataFields.create({
      recordType: 'hr.team',
      key: 'goal',
      label: 'Goal',
      type: 'text',
    });

    const { data } = await owner.dataPlugins.list({});

    expect(data[0]?.objects.map((object) => object.problem)).toEqual([
      null,
      "The plugin's view hr_position_fields isn't ready for core to read",
      'hr_team_fields has no jsonb column custom_fields for the fields added here',
    ]);
    // Its own fields still read, and the added one has no value.
    await expect(
      owner.dataValues.get({ recordType: 'hr.team', recordId: 't1' }),
    ).resolves.toMatchObject({ values: { goal: null } });
  });

  it('keeps a plugin connected while its records have fields', async () => {
    const owner = t.owner();

    await expect(owner.dataPlugins.disconnect({ plugin: 'hr' })).rejects.toMatchObject({
      code: 'ARCHIVE_FIRST',
    });
    expect((await owner.dataPlugins.list({})).data[0]).toMatchObject({ fieldCount: 4 });
  });
});
