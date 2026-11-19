import type { PluginManifest } from '@erxes/core-contract';
import { sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { pluginRoleSql } from '~/modules/plugins/pluginRole';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const EMPLOYEE = {
  type: 'hr.employee',
  label: 'Employees',
  singularLabel: 'Employee',
  icon: 'IconUserCheck',
  permission: 'hr.employee.view',
  updatePermission: 'hr.employee.edit',
} as const;

type ManifestObject = NonNullable<PluginManifest['objects']>[number];

/** Employees with their own fields, read from HR's view. */
const EMPLOYEE_WITH_FIELDS: ManifestObject = {
  ...EMPLOYEE,
  view: 'hr_employee_fields',
  fields: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'salary', label: 'Salary', type: 'number' },
    { key: 'hired_on', label: 'Hired', type: 'date' },
  ],
};

/** Positions name a view HR never made. */
const POSITION: ManifestObject = {
  type: 'hr.position',
  label: 'Positions',
  singularLabel: 'Position',
  view: 'hr_position_fields',
  fields: [{ key: 'title', label: 'Title', type: 'text' }],
};

/** HR with employees, which members may see but not change. */
const hrManifest = (objects: PluginManifest['objects'] = [EMPLOYEE]) =>
  ({
    title: 'HR',
    version: '1',
    api: { url: 'https://hr.example.com/api' },
    scopes: [],
    permissions: [
      { action: 'hr.employee.view', group: 'HR', label: 'See employees' },
      { action: 'hr.employee.edit', group: 'HR', label: 'Change employees' },
    ],
    permissionSets: [
      {
        key: 'viewer',
        label: 'Viewer',
        permissions: ['hr.employee.view'],
        defaultRoles: ['member'],
      },
    ],
    objects,
  }) satisfies PluginManifest;

/** HR's employees table and the view core reads, made as its database role. */
const PLUGIN_SQL = `
  GRANT erxes_plugin_hr TO current_user;
  SET ROLE erxes_plugin_hr;
  CREATE TABLE hr_employees (id text PRIMARY KEY, org_id text NOT NULL, name text, salary numeric, hired_on date);
  SELECT core_enable_tenant_rls('hr_employees');
  CREATE VIEW hr_employee_fields AS SELECT id, org_id, name, salary, hired_on FROM hr_employees;
  GRANT SELECT ON hr_employee_fields TO erxes_core_reader;
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
    await adminDb().execute(sql.raw(pluginRoleSql('hr')));
    await adminDb().execute(sql.raw(PLUGIN_SQL));
    await t
      .client(await t.pluginToken())
      .plugins.registerManifest(hrManifest([EMPLOYEE_WITH_FIELDS, POSITION]));

    for (const [id, org, name, salary, days] of [
      ['e1', t.ids.org, 'Bat', 2000, 10],
      ['e2', t.ids.otherOrg, 'Saraa', 9000, 1],
    ] as const) {
      await adminDb().execute(
        sql`insert into hr_employees values (${id}, ${org}, ${name}, ${salary}, current_date - ${days}::int)`,
      );
    }
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
        ],
      },
    ]);
  });

  it('works out a formula from the plugin’s fields and the stored ones', async () => {
    const owner = t.owner();

    await owner.dataPlugins.connect({ plugin: 'hr' });
    await owner.dataFields.create({
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
    await owner.dataValues.update({
      recordType: 'hr.employee',
      recordId: 'e1',
      values: { bonus: 500 },
    });

    const { data } = await t.member().dataValues.lookup({
      recordType: 'hr.employee',
      recordIds: ['e1', 'e2'],
    });

    expect(data.map((row) => [row.recordId, row.values])).toEqual([
      ['e1', { bonus: 500, yearly: 24_500, badge: 'BAT · 10' }],
      // Another organisation's employee: core can't see it, so its fields read as blank.
      ['e2', { bonus: null, yearly: null, badge: ' · ' }],
    ]);
    await expect(
      owner.dataValues.update({ recordType: 'hr.employee', recordId: 'e1', values: { yearly: 1 } }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('previews a formula before it is saved, and points at a mistake', async () => {
    const owner = t.owner();

    await expect(
      owner.dataFields.preview({
        recordType: 'hr.employee',
        formula: { expression: 'ROUND({salary} / 3, 2)' },
        recordId: 'e1',
      }),
    ).resolves.toEqual({ result: 'number', value: 666.67 });
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

  it('keeps a plugin connected while its records have fields', async () => {
    const owner = t.owner();

    await expect(owner.dataPlugins.disconnect({ plugin: 'hr' })).rejects.toMatchObject({
      code: 'ARCHIVE_FIRST',
    });
    expect((await owner.dataPlugins.list({})).data[0]).toMatchObject({ fieldCount: 3 });
  });
});
