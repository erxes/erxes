import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createApp } from '~/app';
import { hashPassword } from '~/modules/auth/password';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { describeWithDb, useTestDatabase } from './db';

/** Sessions end when they should: password change or reset, disable, sign out everywhere. */
describeWithDb('session security', () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let memberId = '';

  beforeAll(async () => {
    const { db, users, newId } = await import('@erxes/core-db');
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn', passwordHash: await hashPassword('Owner-pass-1') },
    });

    memberId = newId();
    await db()
      .insert(users)
      .values({ id: memberId, orgId: acme.organization.id, email: 'member@acme.mn', role: 'member', status: 'active', passwordHash: await hashPassword('Member-pass-1') });
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${base}/core/v1/auth/sign-in`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    return {
      status: response.status,
      body: (await response.json()) as { code?: string },
      cookie: (response.headers.getSetCookie().find((c) => c.startsWith('erxes_session=')) ?? '').split(';')[0] ?? '',
    };
  };

  const as = (cookie: string, path: string, init: { method?: string; body?: unknown } = {}) =>
    fetch(`${base}/core/v1${path}`, {
      method: init.method ?? 'GET',
      headers: { cookie, 'content-type': 'application/json', origin: base },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });

  it('ends other sessions when a member changes their password, keeping this one', async () => {
    const laptop = await signIn('member@acme.mn', 'Member-pass-1');
    const phone = await signIn('member@acme.mn', 'Member-pass-1');

    const changed = await as(laptop.cookie, '/auth/password', {
      method: 'POST',
      body: { currentPassword: 'Member-pass-1', newPassword: 'Member-pass-2' },
    });

    expect(changed.status).toBe(200);

    const renewed = (changed.headers.getSetCookie().find((c) => c.startsWith('erxes_session=')) ?? '').split(';')[0]!;

    expect((await as(phone.cookie, '/auth/me')).status).toBe(401);
    expect((await as(laptop.cookie, '/auth/me')).status).toBe(401);
    expect((await as(renewed, '/auth/me')).status).toBe(200);
  });

  it('ends sessions when an admin resets the password, and when the member is disabled — enabling does not revive them', async () => {
    const owner = await signIn('owner@acme.mn', 'Owner-pass-1');
    let member = await signIn('member@acme.mn', 'Member-pass-2');

    expect((await as(owner.cookie, `/users/${memberId}/password`, { method: 'POST', body: { password: 'Member-pass-3' } })).status).toBe(200);
    expect((await as(member.cookie, '/auth/me')).status).toBe(401);

    member = await signIn('member@acme.mn', 'Member-pass-3');
    expect((await as(owner.cookie, `/users/${memberId}/disable`, { method: 'POST' })).status).toBe(200);
    expect((await as(owner.cookie, `/users/${memberId}/enable`, { method: 'POST' })).status).toBe(200);
    expect((await as(member.cookie, '/auth/me')).status).toBe(401);
  });

  it('signs out everywhere', async () => {
    const first = await signIn('member@acme.mn', 'Member-pass-3');
    const second = await signIn('member@acme.mn', 'Member-pass-3');

    expect((await as(first.cookie, '/auth/sign-out-everywhere', { method: 'POST' })).status).toBe(200);
    expect((await as(second.cookie, '/auth/me')).status).toBe(401);
    expect((await as(first.cookie, '/auth/me')).status).toBe(401);
  });

  it('refuses dates that do not exist with 400, not a database error', async () => {
    const owner = await signIn('owner@acme.mn', 'Owner-pass-1');

    for (const birthDate of ['2026-99-99', '2026-02-30']) {
      const response = await as(owner.cookie, `/users/${memberId}`, { method: 'PATCH', body: { birthDate } });

      expect(response.status).toBe(400);
    }

    expect((await as(owner.cookie, `/users/${memberId}`, { method: 'PATCH', body: { birthDate: '2024-02-29' } })).status).toBe(200);
  });

  it('locks an account after 10 failed sign-ins in 15 minutes', async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      expect((await signIn('owner@acme.mn', `wrong-${attempt}`)).status).toBe(401);
    }

    const locked = await signIn('owner@acme.mn', 'Owner-pass-1');

    expect(locked.status).toBe(429);
    expect(locked.body.code).toBe('TOO_MANY_ATTEMPTS');
  });
});
