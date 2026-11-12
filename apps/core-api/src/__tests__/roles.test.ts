import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';
import { pluginToken } from './plugin';

describeWithDb('roles and permissions', () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let orgId = '';
  let owner = '';
  let adminId = '';
  let memberId = '';

  const call = async (token: string, method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  const token = (userId: string) => currentToken(userId, orgId);

  beforeAll(async () => {
    const { users, newId } = await import('@erxes/core-db');

    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn' },
    });

    orgId = acme.organization.id;
    adminId = newId();
    memberId = newId();
    await adminDb()
      .insert(users)
      .values([
        { id: adminId, orgId, email: 'admin@acme.mn', role: 'admin', status: 'active' },
        { id: memberId, orgId, email: 'member@acme.mn', role: 'member', status: 'active' },
      ]);
    owner = await token(acme.owner.id);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('starts every organisation with Owner, Admin and Member, and tells each member what they may do', async () => {
    const listed = await call(await token(memberId), 'GET', '/roles');

    expect(
      listed.body.data.map((role: { key: string; editable: boolean; members: number }) => [
        role.key,
        role.editable,
        role.members,
      ]),
    ).toEqual([
      ['owner', false, 1],
      ['admin', false, 1],
      ['member', true, 1],
    ]);

    const member = (await call(await token(memberId), 'GET', '/auth/me')).body
      .permissions as string[];

    const admin = (await call(await token(adminId), 'GET', '/auth/me')).body
      .permissions as string[];

    const ownerPermissions = (await call(owner, 'GET', '/auth/me')).body.permissions as string[];

    expect(member).toEqual(expect.arrayContaining(['contacts.view', 'contacts.edit']));
    expect(member).not.toContain('contacts.delete');
    expect(admin).toContain('contacts.delete');
    expect(admin).not.toContain('plugins.manage');
    expect(ownerPermissions).toContain('plugins.manage');
  });

  it('gives a custom role exactly its permissions', async () => {
    const created = await call(owner, 'POST', '/roles', {
      name: 'Support',
      permissions: ['contacts.view', 'contacts.edit', 'contacts.delete', 'team.view'],
    });

    expect(created.status).toBe(201);
    expect(created.body.key).toMatch(/^r_/);
    expect(
      (await call(owner, 'PATCH', `/users/${memberId}`, { role: created.body.key })).status,
    ).toBe(200);

    const support = await token(memberId);
    const customer = await call(support, 'POST', '/customers', { firstName: 'Can not' });

    // No contacts.create…
    expect(customer.status).toBe(403);
    expect(customer.body.data).toEqual({ permission: 'contacts.create' });

    // …but contacts.delete, which Member didn't have.
    const made = await call(owner, 'POST', '/customers', { firstName: 'Delete me' });

    expect((await call(support, 'POST', '/customers/remove', { ids: [made.body.id] })).status).toBe(
      200,
    );

    // Changing the role applies on the next request.
    await call(owner, 'PATCH', `/roles/${created.body.key}`, {
      permissions: ['contacts.view', 'team.view'],
    });
    expect((await call(support, 'POST', '/customers/remove', { ids: [made.body.id] })).status).toBe(
      403,
    );
  });

  it('refuses roles that would give more than the editor has, owner-only actions, or unknown ones', async () => {
    const admin = await token(adminId);

    expect(
      (await call(admin, 'POST', '/roles', { name: 'X', permissions: ['plugins.manage'] })).body
        .code,
    ).toBe('OWNER_ONLY_PERMISSION');
    expect(
      (await call(admin, 'POST', '/roles', { name: 'X', permissions: ['contacts.fly'] })).body.code,
    ).toBe('UNKNOWN_PERMISSION');

    // A role manager without `*` can't create a role wider than theirs, or hand out Admin.
    const managers = await call(owner, 'POST', '/roles', {
      name: 'Team lead',
      permissions: ['roles.manage', 'team.manage', 'team.view'],
    });

    await call(owner, 'PATCH', `/users/${memberId}`, { role: managers.body.key });

    const lead = await token(memberId);

    expect(
      (await call(lead, 'POST', '/roles', { name: 'Wide', permissions: ['contacts.delete'] })).body
        .code,
    ).toBe('BEYOND_OWN_PERMISSIONS');
    expect(
      (await call(lead, 'POST', '/roles', { name: 'Wide', permissions: ['*'] })).body.code,
    ).toBe('BEYOND_OWN_PERMISSIONS');
    expect((await call(lead, 'PATCH', `/users/${adminId}`, { role: 'member' })).body.code).toBe(
      'BEYOND_OWN_PERMISSIONS',
    );

    // Owner and Admin are fixed; built-in roles stay; a role in use can't go.
    expect((await call(owner, 'PATCH', '/roles/admin', { name: 'Boss' })).body.code).toBe(
      'FIXED_ROLE',
    );
    expect((await call(owner, 'DELETE', '/roles/member')).body.code).toBe('BUILTIN_ROLE');
    expect((await call(owner, 'DELETE', `/roles/${managers.body.key}`)).body.code).toBe(
      'ROLE_IN_USE',
    );

    await call(owner, 'PATCH', `/users/${memberId}`, { role: 'member' });
    expect((await call(owner, 'DELETE', `/roles/${managers.body.key}`)).status).toBe(200);
    expect(
      (await call(owner, 'PATCH', `/users/${memberId}`, { role: 'r_doesnotexist1' })).body.code,
    ).toBe('ROLE_NOT_FOUND');
  });

  it("puts plugin permissions in roles and in the member's plugin session", async () => {
    const service = await pluginToken(base);

    await call(service, 'PUT', '/plugins/manifest', {
      title: 'HR',
      version: '1.0.0',
      scopes: ['notifications:write'],
      permissions: [
        { action: 'hr.leave.approve', label: 'Approve leave' },
        { action: 'hr.salary.view', label: 'See salaries' },
      ],
    });

    const catalog = await call(owner, 'GET', '/permissions');

    expect(
      catalog.body.data
        .filter((item: { source: string }) => item.source === 'hr')
        .map((item: { action: string }) => item.action),
    ).toEqual(['hr.leave.approve', 'hr.salary.view']);

    const approver = await call(owner, 'POST', '/roles', {
      name: 'Approver',
      permissions: ['contacts.view', 'team.view', 'hr.leave.approve'],
    });

    await call(owner, 'PATCH', `/users/${memberId}`, { role: approver.body.key });

    const session = await call(await token(memberId), 'POST', '/plugins/hr/session');
    const { verifyPluginSession } = await import('@erxes/plugin-sdk');
    const member = await verifyPluginSession(session.body.token, { coreUrl: base, plugin: 'hr' });

    expect(member.permissions).toEqual(['hr.leave.approve']);
    expect(member.can('hr.leave.approve')).toBe(true);
    expect(member.can('hr.salary.view')).toBe(false);
  });

  it('audits role changes', async () => {
    const audit = await call(owner, 'GET', '/audit?action=role.');

    expect(audit.body.data.map((entry: { action: string }) => entry.action)).toEqual(
      expect.arrayContaining(['role.created', 'role.updated', 'role.deleted']),
    );
  });
});
