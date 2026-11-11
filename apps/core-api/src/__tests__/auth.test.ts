import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { hashPassword } from '~/modules/auth/password';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { sessionToken, useTestDatabase, useTestServer } from './support';

describe('sign-in (/core/v1/auth)', () => {
  useTestDatabase();

  const server = useTestServer();
  const api = server.client();

  beforeAll(async () => {
    await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn', passwordHash: await hashPassword('correct horse') },
    });
    // The same email in a second organisation
    await createOrganization({
      subdomain: 'globex',
      name: 'Globex',
      owner: { email: 'shared@x.mn', passwordHash: await hashPassword('pw-globex') },
    });
    await createOrganization({
      subdomain: 'initech',
      name: 'Initech',
      owner: { email: 'shared@x.mn', passwordHash: await hashPassword('pw-initech') },
    });
  });

  // Raw HTTP: these tests check the session cookie and the whole error body
  const signIn = (body: { email: string; password: string }) =>
    fetch(server.url('/core/v1/auth/sign-in'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

  it('signs in, sets an HttpOnly session cookie and answers /me with it', async () => {
    const response = await signIn({ email: 'OWNER@acme.mn', password: 'correct horse' });
    const body: unknown = await response.json();
    const setCookie = response.headers.getSetCookie().join(';');

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      user: { email: 'owner@acme.mn', role: 'owner' },
      organization: { subdomain: 'acme' },
    });
    expect(setCookie).toMatch(/erxes_session=.*HttpOnly.*SameSite=Lax/i);

    const me = await fetch(server.url('/core/v1/auth/me'), {
      headers: { cookie: `erxes_session=${sessionToken(response)}` },
    });

    expect(me.status).toBe(200);
  });

  it('answers wrong password and unknown email the same way', async () => {
    const wrong = await signIn({ email: 'owner@acme.mn', password: 'nope' });
    const unknown = await signIn({ email: 'nobody@acme.mn', password: 'nope' });

    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(await wrong.json()).toEqual(await unknown.json());
  });

  it('asks for the organisation when the email exists in several', async () => {
    await expect(
      api.auth.signIn({ email: 'shared@x.mn', password: 'pw-globex' }),
    ).rejects.toMatchObject({ status: 400, code: 'ORGANIZATION_REQUIRED' });

    const chosen = await api.auth.signIn({
      email: 'shared@x.mn',
      password: 'pw-initech',
      subdomain: 'initech',
    });

    expect(server.status()).toBe(200);
    expect(chosen.organization.subdomain).toBe('initech');
  });

  it('blocks cookie-signed changes from other sites, not reads', async () => {
    const signedIn = await signIn({ email: 'owner@acme.mn', password: 'correct horse' });
    const cookie = `erxes_session=${sessionToken(signedIn)}`;

    const crossSite = await fetch(server.url('/core/v1/users'), {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' },
      body: JSON.stringify({ email: 'evil@acme.mn' }),
    });

    const sameSite = await fetch(server.url('/core/v1/users'), {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' },
      body: JSON.stringify({ email: 'good@acme.mn' }),
    });

    const read = await fetch(server.url('/core/v1/users'), {
      headers: { cookie, 'sec-fetch-site': 'cross-site' },
    });

    expect(crossSite.status).toBe(403);
    expect(sameSite.status).toBe(201);
    expect(read.status).toBe(200);
  });

  it('refuses invited members (no password yet) and signs out', async () => {
    await expect(
      api.auth.signIn({ email: 'good@acme.mn', password: 'anything' }),
    ).rejects.toMatchObject({ status: 401 });

    const out = await fetch(server.url('/core/v1/auth/sign-out'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });

    expect(out.headers.getSetCookie().join(';')).toMatch(/erxes_session=;/);
  });
});
