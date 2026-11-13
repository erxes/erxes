import { newId, users } from '@erxes/core-db';
import { verifyPluginSession } from '@erxes/plugin-sdk';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('roles and permissions', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const adminId = newId();
  const admin = () => t.client({ user: adminId, org: t.ids.org });
  const setRole = (id: string, role: string) => t.owner().users.update({ id, role });

  beforeAll(async () => {
    await adminDb().insert(users).values({
      id: adminId,
      orgId: t.ids.org,
      email: 'admin@acme.mn',
      role: 'admin',
      status: 'active',
    });
  });

  it('starts every organisation with Owner, Admin and Member, and tells each member what they may do', async () => {
    const listed = await t.member().roles.list({});

    expect(listed.data.map((role) => [role.key, role.editable, role.members])).toEqual([
      ['owner', false, 1],
      ['admin', false, 1],
      // The disabled member isn't counted.
      ['member', true, 1],
    ]);

    const member = (await t.member().auth.me({})).permissions;
    const managing = (await admin().auth.me({})).permissions;
    const owning = (await t.owner().auth.me({})).permissions;

    expect(member).toContain('contacts.view');
    expect(member).toContain('contacts.edit');
    expect(member).not.toContain('contacts.delete');
    expect(managing).toContain('contacts.delete');
    expect(managing).not.toContain('plugins.manage');
    expect(owning).toContain('plugins.manage');
  });

  it('gives a custom role exactly its permissions', async () => {
    const created = await t.owner().roles.create({
      name: 'Support',
      permissions: ['contacts.view', 'contacts.edit', 'contacts.delete', 'team.view'],
    });

    expect(created.key).toMatch(/^r_/);
    await setRole(t.ids.member, created.key);

    // No contacts.create…
    await expect(t.member().customers.create({ firstName: 'Can not' })).rejects.toMatchObject({
      status: 403,
      data: { permission: 'contacts.create' },
    });

    // …but contacts.delete, which Member didn't have.
    const made = await t.owner().customers.create({ firstName: 'Delete me' });

    expect(await t.member().customers.remove({ ids: [made.id] })).toEqual({ removed: 1 });

    // Changing the role applies on the next request.
    await t.owner().roles.update({ key: created.key, permissions: ['contacts.view', 'team.view'] });
    await expect(t.member().customers.remove({ ids: [made.id] })).rejects.toMatchObject({
      status: 403,
    });
  });

  it('refuses roles that would give more than the editor has, owner-only actions, or unknown ones', async () => {
    await expect(
      admin().roles.create({ name: 'X', permissions: ['plugins.manage'] }),
    ).rejects.toMatchObject({ code: 'OWNER_ONLY_PERMISSION' });
    await expect(
      admin().roles.create({ name: 'X', permissions: ['contacts.fly'] }),
    ).rejects.toMatchObject({ code: 'UNKNOWN_PERMISSION' });

    // A role manager without `*` can't create a role wider than theirs, or hand out Admin.
    const managers = await t.owner().roles.create({
      name: 'Team lead',
      permissions: ['roles.manage', 'team.manage', 'team.view'],
    });

    await setRole(t.ids.member, managers.key);

    const beyond = { code: 'BEYOND_OWN_PERMISSIONS' };

    await expect(
      t.member().roles.create({ name: 'Wide', permissions: ['contacts.delete'] }),
    ).rejects.toMatchObject(beyond);
    await expect(
      t.member().roles.create({ name: 'Wide', permissions: ['*'] }),
    ).rejects.toMatchObject(beyond);
    await expect(t.member().users.update({ id: adminId, role: 'member' })).rejects.toMatchObject(
      beyond,
    );

    // Owner and Admin are fixed; built-in roles stay; a role in use can't go.
    await expect(t.owner().roles.update({ key: 'admin', name: 'Boss' })).rejects.toMatchObject({
      code: 'FIXED_ROLE',
    });
    await expect(t.owner().roles.remove({ key: 'member' })).rejects.toMatchObject({
      code: 'BUILTIN_ROLE',
    });
    await expect(t.owner().roles.remove({ key: managers.key })).rejects.toMatchObject({
      code: 'ROLE_IN_USE',
    });

    await setRole(t.ids.member, 'member');
    await t.owner().roles.remove({ key: managers.key });
    await expect(setRole(t.ids.member, 'r_doesnotexist1')).rejects.toMatchObject({
      code: 'ROLE_NOT_FOUND',
    });
  });

  it("puts plugin permissions in roles and in the member's plugin session", async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '1.0.0',
      scopes: ['notifications:write'],
      permissions: [
        { action: 'hr.leave.approve', label: 'Approve leave' },
        { action: 'hr.salary.view', label: 'See salaries' },
      ],
    });

    const catalog = await t.owner().roles.permissions({});

    expect(catalog.data.filter((item) => item.source === 'hr').map((item) => item.action)).toEqual([
      'hr.leave.approve',
      'hr.salary.view',
    ]);

    const approver = await t.owner().roles.create({
      name: 'Approver',
      permissions: ['contacts.view', 'team.view', 'hr.leave.approve'],
    });

    await setRole(t.ids.member, approver.key);

    const session = await t.member().plugins.session({ name: 'hr' });
    const member = await verifyPluginSession(session.token, { coreUrl: t.url(''), plugin: 'hr' });

    expect(member.permissions).toEqual(['hr.leave.approve']);
    expect(member.can('hr.leave.approve')).toBe(true);
    expect(member.can('hr.salary.view')).toBe(false);
  });

  it('audits role changes', async () => {
    const actions = (await t.owner().audit.list({ action: 'role.' })).data.map(
      (entry) => entry.action,
    );

    expect(actions).toContain('role.created');
    expect(actions).toContain('role.updated');
    expect(actions).toContain('role.deleted');
  });
});
