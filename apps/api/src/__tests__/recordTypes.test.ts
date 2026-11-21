import type { PluginManifest } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const EMPLOYEE = {
  type: 'hr.employee',
  label: 'Employees',
  singularLabel: 'Employee',
  icon: 'IconUserCheck',
  permission: 'hr.employee.view',
  updatePermission: 'hr.employee.edit',
} as const;

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

describe('record types members can extend', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const register = async (manifest: PluginManifest) =>
    t.client(await t.pluginToken()).plugins.registerManifest(manifest);

  it("lists core's record types, then each installed plugin's objects", async () => {
    await register(hrManifest());

    const { data } = await t.member().recordTypes.list({});

    expect(data.map((row) => row.type)).toEqual([
      'core.customer',
      'core.company',
      'core.product',
      'core.member',
      'hr.employee',
    ]);
    expect(data.at(-1)).toEqual({ ...EMPLOYEE, plugin: 'hr' });
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
