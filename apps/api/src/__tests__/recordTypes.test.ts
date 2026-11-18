import type { PluginManifest, PluginScope } from '@erxes/core-contract';
import { canRecord, verifyPluginSession } from '@erxes/plugin-sdk';
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
const hrManifest = (scopes: PluginScope[], objects: PluginManifest['objects'] = [EMPLOYEE]) =>
  ({
    title: 'HR',
    version: '1',
    api: { url: 'https://hr.example.com/api' },
    scopes,
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

describe('record types Data Extensions extends', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const register = async (manifest: PluginManifest) =>
    t.client(await t.pluginToken()).plugins.registerManifest(manifest);

  it("lists core's record types, then each installed plugin's objects", async () => {
    await register(hrManifest(['records:extend']));

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
    await expect(
      register(hrManifest(['records:extend'], [{ ...EMPLOYEE, type: 'sales.deal' }])),
    ).rejects.toMatchObject({ code: 'NAMESPACE_REQUIRED' });
    await expect(
      register(hrManifest(['records:extend'], [{ ...EMPLOYEE, updatePermission: 'hr.x.y' }])),
    ).rejects.toMatchObject({ code: 'UNKNOWN_PERMISSION', data: { permissions: ['hr.x.y'] } });
    await expect(
      register(hrManifest(['records:extend'], [EMPLOYEE, { ...EMPLOYEE, label: 'Staff' }])),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('gives the record types only to a plugin granted records:extend', async () => {
    await register(hrManifest(['records:extend']));
    expect((await t.hr().recordTypes.list({})).data).toHaveLength(5);

    await register(hrManifest([]));
    await expect(t.hr().recordTypes.list({})).rejects.toMatchObject({ code: 'SCOPE_REQUIRED' });
  });

  it("tells the plugin, in a member's session, what the member may do with each type", async () => {
    const coreUrl = t.url('');

    const session = async (as: typeof t.member) =>
      verifyPluginSession((await as().plugins.session({ name: 'hr' })).token, {
        coreUrl,
        plugin: 'hr',
      });

    await register(hrManifest(['records:extend']));

    const member = await session(t.member);

    // Members change contacts; they only see products, the team and (through HR's set) employees.
    expect(member.records).toEqual({
      'core.customer': 'update',
      'core.company': 'update',
      'core.product': 'read',
      'core.member': 'read',
      'hr.employee': 'read',
    });
    expect(canRecord(member, 'hr.employee', 'read')).toBe(true);
    expect(canRecord(member, 'hr.employee', 'update')).toBe(false);
    expect(canRecord(member, 'sales.deal', 'read')).toBe(false);
    expect(Object.values((await session(t.owner)).records ?? {})).toEqual(
      Array.from({ length: 5 }, () => 'update'),
    );

    // Without the scope, the session says nothing about records.
    await register(hrManifest([]));
    expect((await session(t.member)).records).toBeUndefined();
  });
});
