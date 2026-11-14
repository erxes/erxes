import type { PluginManifest } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('plugin permission sets', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const permissions = [
    { action: 'hr.leave.view', label: 'See leave requests' },
    { action: 'hr.leave.approve', label: 'Approve leave' },
    { action: 'hr.employee.edit', label: 'Edit employees' },
  ];

  const register = async (permissionSets: PluginManifest['permissionSets']) =>
    t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '1',
      permissions,
      permissionSets,
    });

  it('offers a plugin’s sets to every member, and a role takes them as plain permissions', async () => {
    await register([
      {
        key: 'manager',
        label: 'HR manager',
        permissions: ['hr.leave.view', 'hr.leave.approve'],
      },
      { key: 'viewer', label: 'HR viewer', permissions: ['hr.leave.view'] },
    ]);

    const sets = await t.member().roles.permissionSets();

    expect(sets.data).toEqual([
      {
        source: 'hr',
        key: 'manager',
        label: 'HR manager',
        description: null,
        permissions: ['hr.leave.view', 'hr.leave.approve'],
      },
      {
        source: 'hr',
        key: 'viewer',
        label: 'HR viewer',
        description: null,
        permissions: ['hr.leave.view'],
      },
    ]);

    const role = await t.owner().roles.create({
      name: 'Team lead',
      permissions: ['contacts.view', ...(sets.data[0]?.permissions ?? [])],
    });

    expect(role.permissions).toEqual(['contacts.view', 'hr.leave.approve', 'hr.leave.view']);
  });

  it('refuses a set naming a permission the plugin does not declare, or a key twice', async () => {
    await expect(
      register([{ key: 'admin', label: 'HR admin', permissions: ['hr.payroll.run'] }]),
    ).rejects.toMatchObject({ status: 400, code: 'UNKNOWN_PERMISSION' });
    await expect(
      register([
        { key: 'viewer', label: 'A', permissions: ['hr.leave.view'] },
        { key: 'viewer', label: 'B', permissions: ['hr.leave.view'] },
      ]),
    ).rejects.toMatchObject({ status: 400, code: 'DUPLICATE_PERMISSION_SET' });
  });
});
