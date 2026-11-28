import type { PluginManifest } from '@erxes/core-contract';
import { sql } from 'drizzle-orm';
import { pluginRoleSql } from '~/modules/plugins/pluginRole';
import { adminDb } from './db';
import type { useTwoOrgs } from './support';

/** The HR test plugin's employees, as Data Extensions tests extend them. */

export const EMPLOYEE = {
  type: 'hr.employee',
  label: 'Employees',
  singularLabel: 'Employee',
  icon: 'IconUserCheck',
  permission: 'hr.employee.view',
  updatePermission: 'hr.employee.edit',
} as const;

type ManifestObject = NonNullable<PluginManifest['objects']>[number];

/** Employees with their own fields, read from HR's view. */
export const EMPLOYEE_WITH_FIELDS: ManifestObject = {
  ...EMPLOYEE,
  view: 'hr_employee_fields',
  fields: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'salary', label: 'Salary', type: 'number' },
    { key: 'hired_on', label: 'Hired', type: 'date' },
  ],
};

/** HR with employees, which members may see but not change. */
export const hrManifest = (objects: PluginManifest['objects'] = [EMPLOYEE]) =>
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

/**
 * HR's employees table, which keeps the values of the fields members add in `custom_fields`,
 * and the view core reads, made as its database role.
 */
const PLUGIN_SQL = `
  GRANT erxes_plugin_hr TO current_user;
  SET ROLE erxes_plugin_hr;
  CREATE TABLE hr_employees (id text PRIMARY KEY, org_id text NOT NULL, name text, salary numeric, hired_on date, custom_fields jsonb NOT NULL DEFAULT '{}');
  SELECT core_enable_tenant_rls('hr_employees');
  CREATE VIEW hr_employee_fields AS SELECT id, org_id, name, salary, hired_on, custom_fields FROM hr_employees;
  GRANT SELECT ON hr_employee_fields TO erxes_core_reader;
  RESET ROLE;
`;

/**
 * Makes HR's tables, registers it with `objects` and adds employees: `e1` (Bat, 2000, hired 10
 * days ago) in the first organisation, `e2` in the other.
 */
export const setUpHr = async (
  t: ReturnType<typeof useTwoOrgs>,
  objects: PluginManifest['objects'] = [EMPLOYEE_WITH_FIELDS],
) => {
  await adminDb().execute(sql.raw(pluginRoleSql('hr')));
  await adminDb().execute(sql.raw(PLUGIN_SQL));
  await t.client(await t.pluginToken()).plugins.registerManifest(hrManifest(objects));

  for (const [id, org, name, salary, days] of [
    ['e1', t.ids.org, 'Bat', 2000, 10],
    ['e2', t.ids.otherOrg, 'Saraa', 9000, 1],
  ] as const) {
    await adminDb().execute(
      sql`insert into hr_employees values (${id}, ${org}, ${name}, ${salary}, current_date - ${days}::int)`,
    );
  }
};

/** What HR saves in an employee's `custom_fields`, as the plugin would after `dataValues.check`. */
export const saveCustomFields = (id: string, values: Record<string, unknown>) =>
  adminDb().execute(
    sql`update hr_employees set custom_fields = ${JSON.stringify(values)}::jsonb where id = ${id}`,
  );
