import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, expect, it } from 'vitest';
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
    subdomain: string;
    name: string;
    code: string;
    data: { id: string; email: string }[];
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
    await db().update(users).set({ status: 'active', passwordHash: 'set' }).where(eq(users.id, created.body.id));

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
    const disableSelf = await call(ownerToken, `/users/${ownerId}/disable`, { method: 'POST', body: '{}' });
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
    const disableOwner = await call(adminToken, `/users/${ownerId}/disable`, { method: 'POST', body: '{}' });
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
    await db().update(users).set({ status: 'active', passwordHash: 'set' }).where(eq(users.id, created.body.id));

    const orgId = (await call(ownerToken, '/organization')).body.id;
    const tempToken = signAccessToken(created.body.id, orgId);

    expect((await call(tempToken, '/users')).status).toBe(200);

    const disabled = await call(ownerToken, `/users/${created.body.id}/disable`, { method: 'POST', body: '{}' });
    expect(disabled.body.status).toBe('disabled');
    expect((await call(tempToken, '/users')).status).toBe(401);

    const enabled = await call(ownerToken, `/users/${created.body.id}/enable`, { method: 'POST', body: '{}' });
    expect(enabled.body.status).toBe('active');
    expect((await call(tempToken, '/users')).status).toBe(200);
  });

  it('keeps an invited member invited when re-enabled', async () => {
    const created = await invite(ownerToken, { email: 'pending@acme.mn' });

    await call(ownerToken, `/users/${created.body.id}/disable`, { method: 'POST', body: '{}' });
    const enabled = await call(ownerToken, `/users/${created.body.id}/enable`, { method: 'POST', body: '{}' });

    expect(enabled.body.status).toBe('invited');
  });
});
