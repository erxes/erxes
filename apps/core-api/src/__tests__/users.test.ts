import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { describeWithDb, useTestDatabase } from './db';

describeWithDb('team members (/core/v1/users)', () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let ownerToken = '';
  let ownerId = '';
  let otherOrgToken = '';

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'Owner@Acme.mn', fullName: 'Owner' },
    });
    const globex = await createOrganization({
      subdomain: 'globex',
      name: 'Globex',
      owner: { email: 'owner@globex.mn' },
    });

    ownerId = acme.owner.id;
    ownerToken = signAccessToken(acme.owner.id, acme.organization.id);
    otherOrgToken = signAccessToken(globex.owner.id, globex.organization.id);

    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  /** Every field a test reads from a core response (success or error). */
  interface Body {
    id: string;
    email: string;
    status: string;
    role: string;
    fullName: string | null;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    employeeId: string | null;
    birthDate: string | null;
    links: Record<string, string>;
    subdomain: string;
    name: string;
    code: string;
    data: { id: string; email: string; status: string; role: string }[] & { emails?: string[] };
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
    totalCount: number;
  }

  const call = async (
    token: string,
    path: string,
    init: RequestInit = {},
  ): Promise<{ status: number; body: Body }> => {
    const response = await fetch(`${base}/core/v1${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });

    return { status: response.status, body: (await response.json()) as Body };
  };

  const invite = (token: string, body: Record<string, unknown>) =>
    call(token, '/users', { method: 'POST', body: JSON.stringify(body) });

  it('refuses requests without a valid token', async () => {
    expect((await call('', '/users')).status).toBe(401);
    expect((await call('not-a-token', '/users')).status).toBe(401);
  });

  it('returns the current organisation', async () => {
    const { status, body } = await call(ownerToken, '/organization');

    expect(status).toBe(200);
    expect(body).toMatchObject({ subdomain: 'acme', name: 'Acme' });
  });

  it('invites a member with a lowercased email and never returns credentials', async () => {
    const { status, body } = await invite(ownerToken, {
      email: ' Bat@Acme.MN ',
      fullName: 'Bat',
      role: 'admin',
    });

    expect(status).toBe(201);
    expect(body).toMatchObject({ email: 'bat@acme.mn', role: 'admin', status: 'invited' });
    expect(body).not.toHaveProperty('passwordHash');
    expect(body).not.toHaveProperty('orgId');
  });

  it('refuses a second member with the same email (any case)', async () => {
    const { status, body } = await invite(ownerToken, { email: 'BAT@acme.mn' });

    expect(status).toBe(409);
    expect(body.code).toBe('EMAIL_TAKEN');
  });

  it('validates input against the contract', async () => {
    const { status, body } = await invite(ownerToken, { email: 'not-an-email', role: 'owner' });

    expect(status).toBe(400);
    expect(body.code).toBe('INVALID_INPUT');
  });

  it('lists, searches and pages team members of the caller organisation only', async () => {
    await invite(ownerToken, { email: 'dorj@acme.mn', fullName: 'Dorj' });

    const first = await call(ownerToken, '/users?limit=2');
    const next = await call(ownerToken, `/users?limit=2&cursor=${first.body.pageInfo.endCursor}`);
    const back = await call(
      ownerToken,
      `/users?limit=2&direction=backward&cursor=${next.body.pageInfo.startCursor}`,
    );
    const search = await call(ownerToken, '/users?search=dorj');
    const other = await call(otherOrgToken, '/users');

    expect(first.body.totalCount).toBe(3);
    expect(first.body.data.map((user) => user.email)).toEqual(['dorj@acme.mn', 'bat@acme.mn']);
    expect(first.body.pageInfo).toMatchObject({ hasNextPage: true, hasPreviousPage: false });
    expect(next.body.data.map((user) => user.email)).toEqual(['owner@acme.mn']);
    expect(next.body.pageInfo).toMatchObject({ hasNextPage: false, hasPreviousPage: true });
    expect(back.body.data).toEqual(first.body.data);
    expect(back.body.pageInfo).toMatchObject({ hasNextPage: true, hasPreviousPage: false });
    expect(search.body.data.map((user) => user.email)).toEqual(['dorj@acme.mn']);
    expect(other.body.data.map((user) => user.email)).toEqual(['owner@globex.mn']);
  });

  it('hides team members of other organisations', async () => {
    const { status } = await call(otherOrgToken, `/users/${ownerId}`);

    expect(status).toBe(404);
  });

  it('lets members edit their own profile but not others or roles', async () => {
    const created = await invite(ownerToken, { email: 'member@acme.mn' });
    const other = await invite(ownerToken, { email: 'other@acme.mn' });

    // Activate the member so their token is accepted (sign-in comes in the next slice)
    await call(ownerToken, `/users/${created.body.id}/disable`, { method: 'POST', body: '{}' });
    const { db, users } = await import('@erxes/core-db');
    const { eq } = await import('drizzle-orm');
    await db()
      .update(users)
      .set({ status: 'active', passwordHash: 'set' })
      .where(eq(users.id, created.body.id));

    const orgId = (await call(ownerToken, '/organization')).body.id;
    const memberToken = signAccessToken(created.body.id, orgId);

    const self = await call(memberToken, `/users/${created.body.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ fullName: 'Member One' }),
    });
    const someoneElse = await call(memberToken, `/users/${other.body.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ fullName: 'Hacked' }),
    });
    const ownRole = await call(memberToken, `/users/${created.body.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role: 'admin' }),
    });
    const inviteAsMember = await invite(memberToken, { email: 'x@acme.mn' });

    expect(self).toMatchObject({ status: 200, body: { fullName: 'Member One' } });
    expect(someoneElse.status).toBe(403);
    expect(ownRole.body.code).toBe('OWN_ROLE');
    expect(inviteAsMember.status).toBe(403);
  });

  it('never leaves an organisation without an active owner', async () => {
    const disableSelf = await call(ownerToken, `/users/${ownerId}/disable`, {
      method: 'POST',
      body: '{}',
    });
    const demoteSelf = await call(ownerToken, `/users/${ownerId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role: 'member' }),
    });

    expect(disableSelf.body.code).toBe('OWN_ACCOUNT');
    expect(demoteSelf.body.code).toBe('OWN_ROLE');
  });

  it('only owners change owner rights', async () => {
    const admin = await call(ownerToken, '/users?search=bat');
    const adminId = admin.body.data[0]!.id;
    const { db, users } = await import('@erxes/core-db');
    const { eq } = await import('drizzle-orm');
    await db().update(users).set({ status: 'active' }).where(eq(users.id, adminId));

    const orgId = (await call(ownerToken, '/organization')).body.id;
    const adminToken = signAccessToken(adminId, orgId);

    const promote = await invite(adminToken, { email: 'new-admin@acme.mn', role: 'admin' });
    const disableOwner = await call(adminToken, `/users/${ownerId}/disable`, {
      method: 'POST',
      body: '{}',
    });
    const makeOwner = await call(adminToken, `/users/${promote.body.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role: 'owner' }),
    });

    expect(promote.status).toBe(201);
    expect(disableOwner.body.code).toBe('OWNER_ONLY');
    expect(makeOwner.body.code).toBe('OWNER_ONLY');
  });

  it('disables and re-enables a member; a disabled member is signed out', async () => {
    const created = await invite(ownerToken, { email: 'temp@acme.mn' });
    const { db, users } = await import('@erxes/core-db');
    const { eq } = await import('drizzle-orm');
    await db()
      .update(users)
      .set({ status: 'active', passwordHash: 'set' })
      .where(eq(users.id, created.body.id));

    const orgId = (await call(ownerToken, '/organization')).body.id;
    const tempToken = signAccessToken(created.body.id, orgId);

    expect((await call(tempToken, '/users')).status).toBe(200);

    const disabled = await call(ownerToken, `/users/${created.body.id}/disable`, {
      method: 'POST',
      body: '{}',
    });
    expect(disabled.body.status).toBe('disabled');
    expect((await call(tempToken, '/users')).status).toBe(401);

    const enabled = await call(ownerToken, `/users/${created.body.id}/enable`, {
      method: 'POST',
      body: '{}',
    });
    expect(enabled.body.status).toBe('active');
    expect((await call(tempToken, '/users')).status).toBe(200);
  });

  it('keeps an invited member invited when re-enabled', async () => {
    const created = await invite(ownerToken, { email: 'pending@acme.mn' });

    await call(ownerToken, `/users/${created.body.id}/disable`, { method: 'POST', body: '{}' });
    const enabled = await call(ownerToken, `/users/${created.body.id}/enable`, {
      method: 'POST',
      body: '{}',
    });

    expect(enabled.body.status).toBe('invited');
  });
  const patch = (token: string, id: string, body: Record<string, unknown>) =>
    call(token, `/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

  const signInAs = (email: string, password: string) =>
    call('', '/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ email, password, subdomain: 'acme' }),
    });

  const tokenOf = async (email: string) => {
    const found = await call(ownerToken, `/users?search=${encodeURIComponent(email)}`);
    const orgId = (await call(ownerToken, '/organization')).body.id;

    return signAccessToken(found.body.data[0]!.id, orgId);
  };

  it('keeps profile details, and the full name in step with the name parts', async () => {
    const details = await patch(ownerToken, ownerId, {
      firstName: 'Bold',
      lastName: 'Baatar',
      employeeId: 'E-001',
      birthDate: '1990-01-02',
      workStartedDate: '2024-05-01',
      phone: '+976 9911 2233',
      links: { website: 'erxes.io', github: 'erxes' },
    });

    expect(details.status).toBe(200);
    expect(details.body).toMatchObject({
      fullName: 'Bold Baatar',
      firstName: 'Bold',
      lastName: 'Baatar',
      employeeId: 'E-001',
      birthDate: '1990-01-02',
      links: { website: 'erxes.io', github: 'erxes' },
    });

    const links = await patch(ownerToken, ownerId, { links: { website: null }, employeeId: '' });
    expect(links.body.links).toEqual({ github: 'erxes' });
    expect(links.body.employeeId).toBeNull();

    // A full name alone (older clients, the user menu) splits into first and last name.
    const full = await patch(ownerToken, ownerId, { fullName: 'Owner Of Acme' });
    expect(full.body).toMatchObject({ firstName: 'Owner', middleName: null, lastName: 'Of Acme' });

    const invited = await call(ownerToken, '/users?search=dorj');
    const dorj = await call(ownerToken, `/users/${invited.body.data[0]!.id}`);
    expect(dorj.body).toMatchObject({ fullName: 'Dorj', firstName: 'Dorj', lastName: null });

    await patch(ownerToken, dorj.body.id, { employeeId: 'E-777' });
    const byEmployeeId = await call(ownerToken, '/users?search=E-777');
    expect(byEmployeeId.body.data.map((user) => user.email)).toEqual(['dorj@acme.mn']);

    const badDate = await patch(ownerToken, ownerId, { birthDate: '02/01/1990' });
    expect(badDate.body.code).toBe('INVALID_INPUT');
  });

  it('invites several members at once, all or none', async () => {
    const invitations = (entries: Record<string, unknown>[]) =>
      call(ownerToken, '/users/invitations', { method: 'POST', body: JSON.stringify({ entries }) });

    const created = await invitations([
      { email: 'Many1@acme.mn' },
      { email: 'many2@acme.mn', role: 'admin', password: 'Secret-pass-1' },
    ]);

    expect(created.status).toBe(201);
    expect(created.body.data.map(({ email, status, role }) => ({ email, status, role }))).toEqual([
      { email: 'many1@acme.mn', status: 'invited', role: 'member' },
      { email: 'many2@acme.mn', status: 'active', role: 'admin' },
    ]);
    expect(created.body.data[1]).not.toHaveProperty('passwordHash');
    // Invited with a password: they can sign in at once.
    expect((await signInAs('many2@acme.mn', 'Secret-pass-1')).status).toBe(200);
    expect((await signInAs('many1@acme.mn', 'Secret-pass-1')).status).toBe(401);

    const taken = await invitations([{ email: 'MANY1@acme.mn' }, { email: 'many3@acme.mn' }]);
    expect(taken.status).toBe(409);
    expect(taken.body).toMatchObject({ code: 'EMAIL_TAKEN', data: { emails: ['many1@acme.mn'] } });
    expect((await call(ownerToken, '/users?search=many3')).body.totalCount).toBe(0);

    const twice = await invitations([{ email: 'many4@acme.mn' }, { email: 'Many4@acme.mn' }]);
    expect(twice.body.code).toBe('EMAIL_TAKEN');

    const weak = await invitations([{ email: 'many5@acme.mn', password: 'short' }]);
    expect(weak.body.code).toBe('INVALID_INPUT');

    const asMember = await call(await tokenOf('member@acme.mn'), '/users/invitations', {
      method: 'POST',
      body: JSON.stringify({ entries: [{ email: 'many6@acme.mn' }] }),
    });
    expect(asMember.status).toBe(403);
  });

  it('lists active or disabled members', async () => {
    const created = await invite(ownerToken, { email: 'gone@acme.mn' });
    await call(ownerToken, `/users/${created.body.id}/disable`, { method: 'POST', body: '{}' });

    const active = await call(ownerToken, '/users?isActive=true&limit=100');
    const disabled = await call(ownerToken, '/users?isActive=false&limit=100');

    expect(active.body.data.every((user) => user.status !== 'disabled')).toBe(true);
    expect(active.body.data.map((user) => user.email)).not.toContain('gone@acme.mn');
    expect(disabled.body.data.map((user) => user.email)).toEqual(['gone@acme.mn']);
  });

  it('sets a member password (owners and admins; owners only for owners; never their own)', async () => {
    const created = await invite(ownerToken, { email: 'reset@acme.mn' });
    const setPassword = (token: string, id: string, password: string) =>
      call(token, `/users/${id}/password`, { method: 'POST', body: JSON.stringify({ password }) });

    const reset = await setPassword(ownerToken, created.body.id, 'Reset-pass-1');
    expect(reset).toMatchObject({ status: 200, body: { status: 'active' } });
    expect(reset.body).not.toHaveProperty('passwordHash');
    expect((await signInAs('reset@acme.mn', 'Reset-pass-1')).status).toBe(200);

    expect((await setPassword(ownerToken, ownerId, 'Reset-pass-1')).body.code).toBe('OWN_ACCOUNT');
    expect((await setPassword(ownerToken, created.body.id, 'weak')).body.code).toBe(
      'INVALID_INPUT',
    );

    const adminToken = await tokenOf('bat@acme.mn');
    expect((await setPassword(adminToken, ownerId, 'Reset-pass-1')).body.code).toBe('OWNER_ONLY');
    expect((await setPassword(adminToken, created.body.id, 'Reset-pass-2')).status).toBe(200);

    const memberToken = await tokenOf('member@acme.mn');
    expect((await setPassword(memberToken, created.body.id, 'Reset-pass-3')).status).toBe(403);
  });

  it('changes emails: unique in the organisation, owners only for an owner', async () => {
    const created = await invite(ownerToken, { email: 'rename@acme.mn' });

    const renamed = await patch(ownerToken, created.body.id, { email: ' Renamed@Acme.mn ' });
    expect(renamed.body.email).toBe('renamed@acme.mn');

    const taken = await patch(ownerToken, created.body.id, { email: 'bat@acme.mn' });
    expect(taken).toMatchObject({ status: 409, body: { code: 'EMAIL_TAKEN' } });

    const adminToken = await tokenOf('bat@acme.mn');
    expect((await patch(adminToken, ownerId, { email: 'mine@acme.mn' })).body.code).toBe(
      'OWNER_ONLY',
    );
    expect((await patch(adminToken, created.body.id, { email: 'renamed2@acme.mn' })).status).toBe(
      200,
    );
  });
});
