import type { PluginManifest } from '@erxes/core-contract';
import { pluginInstallations, roles } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, useTestDatabase } from './db';
import { type CoreClient, useTwoOrgs } from './support';

/** The Member role's permissions the plugin declares, as `client`'s organisation has them. */
const membersHr = async (client: CoreClient) =>
  (await client.roles.list()).data
    .find((role) => role.key === 'member')
    ?.permissions.filter((action) => action.startsWith('hr.'));

const MEMBER_SET = { key: 'member', label: 'HR member', defaultRoles: ['member' as const] };

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
    ).rejects.toMatchObject({
      status: 400,
      code: 'UNKNOWN_PERMISSION',
      data: { permissions: ['hr.payroll.run'] },
    });
    await expect(
      register([
        { key: 'viewer', label: 'A', permissions: ['hr.leave.view'] },
        { key: 'viewer', label: 'B', permissions: ['hr.leave.view'] },
      ]),
    ).rejects.toMatchObject({ status: 400, code: 'DUPLICATE_PERMISSION_SET' });
  });

  it('gives a set marked for members to the Member role where the plugin is installed, and keeps what an owner took out', async () => {
    await register([
      { ...MEMBER_SET, permissions: ['hr.leave.view'] },
      { key: 'manager', label: 'HR manager', permissions: ['hr.leave.approve'] },
    ]);

    expect(await membersHr(t.owner())).toEqual(['hr.leave.view']);
    expect(await membersHr(t.other())).toEqual(['hr.leave.view']);

    const member = (await t.owner().roles.list()).data.find((role) => role.key === 'member');

    await t.owner().roles.update({
      key: 'member',
      permissions: (member?.permissions ?? []).filter((action) => action !== 'hr.leave.view'),
    });

    // The plugin starts again, then adds a permission to the set: only the new one is given.
    await register([{ ...MEMBER_SET, permissions: ['hr.leave.view'] }]);
    await register([{ ...MEMBER_SET, permissions: ['hr.leave.view', 'hr.employee.edit'] }]);

    expect(await membersHr(t.owner())).toEqual(['hr.employee.edit']);
    expect(await membersHr(t.other())).toEqual(['hr.employee.edit', 'hr.leave.view']);
  });

  it('gives the set to an organisation that installs the plugin later, or is new', async () => {
    await adminDb()
      .delete(pluginInstallations)
      .where(
        and(eq(pluginInstallations.orgId, t.ids.otherOrg), eq(pluginInstallations.plugin, 'hr')),
      );
    await adminDb()
      .update(roles)
      .set({ permissions: ['contacts.view'] })
      .where(and(eq(roles.orgId, t.ids.otherOrg), eq(roles.key, 'member')));

    expect(await membersHr(t.other())).toEqual([]);

    await t.other().plugins.install({ name: 'hr' });

    expect(await membersHr(t.other())).toEqual(['hr.employee.edit', 'hr.leave.view']);

    const fresh = await createOrganization({
      subdomain: 'initech',
      name: 'Initech',
      owner: { email: 'owner@initech.mn' },
    });

    expect(await membersHr(t.client({ user: fresh.owner.id, org: fresh.organization.id }))).toEqual(
      ['hr.employee.edit', 'hr.leave.view'],
    );
  });
});
