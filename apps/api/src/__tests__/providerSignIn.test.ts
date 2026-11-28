import type { PluginSignInIdentity } from '@erxes/core-contract';
import { type CoreSignIn, verifyCoreSignIn } from '@erxes/plugin-sdk';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/**
 * A company directory behind the `hr` plugin's `/auth/sign-in`, answering as a sign-in provider:
 * who the account is when the password is right, 401 when it isn't. `accounts` holds its
 * accounts by login; an account's `answer` is sent as it is, right or not.
 */
const directory = async (coreUrl: string) => {
  const accounts = new Map<string, { password: string; answer: Partial<PluginSignInIdentity> }>();
  const asked: CoreSignIn[] = [];
  const rejected: string[] = [];

  const server = createServer((req, res) => {
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();

      void verifyCoreSignIn(req.headers.authorization, raw, { coreUrl, plugin: 'hr' }).then(
        (attempt) => {
          asked.push(attempt);

          const account = accounts.get(attempt.login);

          if (account?.password !== attempt.password) return res.writeHead(401).end();

          return res
            .writeHead(200, { 'content-type': 'application/json' })
            .end(JSON.stringify(account.answer));
        },
        (error: unknown) => {
          rejected.push(String(error));
          res.writeHead(403).end();
        },
      );
    });
  }).listen(0);

  await once(server, 'listening');

  const address = server.address();

  if (!address || typeof address === 'string') throw new Error('not listening on a port');

  return {
    url: `http://127.0.0.1:${address.port}`,
    accounts,
    asked,
    rejected,
    close: () => {
      server.closeAllConnections();

      return new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
};

describe('signing members in through a plugin (a sign-in provider)', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let ldap: Awaited<ReturnType<typeof directory>>;

  beforeAll(async () => {
    ldap = await directory(t.url(''));
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '1',
      api: { url: ldap.url },
      signIn: { label: 'Company directory' },
      scopes: ['users:sign_in'],
    });
    // Globex doesn't have it.
    await t.other().plugins.uninstall({ name: 'hr' });
  });

  afterAll(() => ldap.close());

  const signIn = (login: string, password = 'pw', subdomain = 'acme') =>
    t.browser().api.auth.signInWithProvider({ plugin: 'hr', login, password, subdomain });

  it('is offered on the sign-in screen where the plugin is installed', async () => {
    expect(await t.client().auth.signInProviders({ subdomain: 'acme' })).toEqual({
      providers: [{ plugin: 'hr', label: 'Company directory' }],
    });
    expect(await t.client().auth.signInProviders({ subdomain: 'globex' })).toEqual({
      providers: [],
    });
    // Two organisations here, and the address names neither.
    expect(await t.client().auth.signInProviders({})).toEqual({ providers: [] });
  });

  it('adds a member the first time and signs the same one in after, by their id there', async () => {
    ldap.accounts.set('bold', {
      password: 'pw',
      answer: { subject: 'uuid-bold', email: 'Bold@acme.mn', firstName: 'Bold', lastName: 'Bat' },
    });

    const browser = t.browser();

    const first = await browser.api.auth.signInWithProvider({
      plugin: 'hr',
      login: 'bold',
      password: 'pw',
      subdomain: 'acme',
    });

    expect(first).toMatchObject({
      user: { email: 'bold@acme.mn', fullName: 'Bold Bat', role: 'member', status: 'active' },
      organization: { id: t.ids.org },
      hasPassword: false,
    });
    expect(ldap.asked.at(-1)).toEqual({ orgId: t.ids.org, login: 'bold', password: 'pw' });

    // The session cookie is set.
    const { user } = await browser.api.auth.me({});

    expect(user.email).toBe('bold@acme.mn');

    // Their email changes there: they are still the same member here.
    ldap.accounts.set('bold', {
      password: 'pw',
      answer: { subject: 'uuid-bold', email: 'bold.bat@acme.mn' },
    });

    expect(await signIn('bold')).toMatchObject({ user: { id: user.id } });
  });

  it('signs in the member who has the email only when the provider vouches for it, never an owner', async () => {
    ldap.accounts.set('member', {
      password: 'pw',
      answer: { subject: 'uuid-member', email: 'member@acme.mn', linkByEmail: true },
    });
    ldap.accounts.set('boss', {
      password: 'pw',
      answer: { subject: 'uuid-boss', email: 'owner@acme.mn', linkByEmail: true },
    });
    ldap.accounts.set('copy', {
      password: 'pw',
      answer: { subject: 'uuid-copy', email: 'member@acme.mn' },
    });

    expect(await signIn('member')).toMatchObject({ user: { id: t.ids.member } });
    await expect(signIn('boss')).rejects.toMatchObject({ status: 409, code: 'TAKEN' });
    await expect(signIn('copy')).rejects.toMatchObject({ status: 409, code: 'TAKEN' });
  });

  it('refuses a wrong password, a disabled member and an account with no email', async () => {
    ldap.accounts.set('gone', {
      password: 'pw',
      answer: { subject: 'uuid-gone', email: 'gone@acme.mn', linkByEmail: true },
    });
    ldap.accounts.set('nomail', { password: 'pw', answer: { subject: 'uuid-nomail' } });

    await expect(signIn('bold', 'wrong')).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    });
    await expect(signIn('gone')).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    });
    await expect(signIn('nomail')).rejects.toMatchObject({ status: 400, code: 'EMAIL_REQUIRED' });
  });

  it('refuses a plugin that does not sign members in there, and a provider that answers wrong', async () => {
    ldap.accounts.set('broken', { password: 'pw', answer: { email: 'broken@acme.mn' } });

    await expect(signIn('bold', 'pw', 'globex')).rejects.toMatchObject({
      status: 400,
      code: 'SIGN_IN_UNAVAILABLE',
    });
    await expect(
      t.browser().api.auth.signInWithProvider({
        plugin: 'sales',
        login: 'bold',
        password: 'pw',
        subdomain: 'acme',
      }),
    ).rejects.toMatchObject({ status: 400, code: 'SIGN_IN_UNAVAILABLE' });
    await expect(signIn('broken')).rejects.toMatchObject({
      status: 502,
      code: 'PLUGIN_UNREACHABLE',
    });
    expect(ldap.rejected).toEqual([]);
  });
});
