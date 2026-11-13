import { PLUGIN_ORG_HEADER } from '@erxes/core-contract';
import { verifyPluginOrg, verifyPluginSession } from '@erxes/plugin-sdk';
import { request } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { useTestDatabase } from './db';
import { pluginApi } from './pluginApi';
import { useTwoOrgs } from './support';

/** What the test plugin's API saw of a forwarded request. */
const Echo = z.object({
  method: z.string(),
  url: z.string(),
  headers: z.record(z.string(), z.string()),
  body: z.string(),
});

describe('plugin APIs at /pl:<plugin> (core forwards with the identity it vouches for)', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let api: Awaited<ReturnType<typeof pluginApi>> | undefined;

  beforeAll(async () => {
    api = await pluginApi(t.url(''));
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '1',
      api: { url: `${api.url}/hr` },
    });
  });

  afterAll(() => api?.close());

  const opts = () => ({ coreUrl: t.url(''), plugin: 'hr' });

  /** A raw request, so the test chooses the Host header like a browser on a subdomain. */
  const send = (
    path: string,
    options: { host?: string; headers?: Record<string, string>; method?: string; body?: string },
  ) =>
    new Promise<{ status: number; setCookie: string[]; body: string }>((resolve, reject) => {
      const url = new URL(t.url(path));

      const req = request(
        {
          host: url.hostname,
          port: url.port,
          path: `${url.pathname}${url.search}`,
          method: options.method ?? 'GET',
          headers: { host: options.host ?? url.host, ...options.headers },
        },
        (res) => {
          let raw = '';

          res.on('data', (chunk: Buffer) => {
            raw += chunk.toString();
          });
          res.on('end', () =>
            resolve({
              status: res.statusCode ?? 0,
              setCookie: res.headers['set-cookie'] ?? [],
              body: raw,
            }),
          );
        },
      );

      req.on('error', reject);
      req.end(options.body);
    });

  const cookieOf = async (user: string, org: string) => `erxes_session=${await t.token(user, org)}`;

  const forwarded = async (path: string, options: Parameters<typeof send>[1] = {}) => {
    const response = await send(path, options);

    expect({ status: response.status, body: response.body }).toMatchObject({ status: 200 });

    return { ...response, echo: Echo.parse(JSON.parse(response.body)) };
  };

  it("hands the plugin the member's session and organisation, never core's cookie", async () => {
    const { echo, setCookie } = await forwarded('/pl:hr/api/v1/me?view=all', {
      headers: { cookie: await cookieOf(t.ids.member, t.ids.org) },
    });

    expect(echo).toMatchObject({ method: 'GET', url: '/hr/api/v1/me?view=all' });
    expect(echo.headers.cookie).toBeUndefined();
    expect(setCookie).toEqual([]);

    const member = await verifyPluginSession(
      (echo.headers.authorization ?? '').replace('Bearer ', ''),
      opts(),
    );

    expect(member).toMatchObject({
      orgId: t.ids.org,
      userId: t.ids.member,
      email: 'member@acme.mn',
      role: 'member',
    });
    expect(await verifyPluginOrg(echo.headers[PLUGIN_ORG_HEADER] ?? '', opts())).toBe(t.ids.org);
  });

  it("streams the body through and refuses another site's cookie-signed change", async () => {
    const cookie = await cookieOf(t.ids.owner, t.ids.org);
    const body = JSON.stringify({ reason: 'Trip', days: [1, 2] });

    const { echo } = await forwarded('/pl:hr/api/v1/leave-requests', {
      method: 'POST',
      body,
      headers: { cookie, 'content-type': 'application/json' },
    });

    expect(echo).toMatchObject({ method: 'POST', body });

    const crossSite = await send('/pl:hr/api/v1/leave-requests', {
      method: 'POST',
      body,
      headers: { cookie, 'sec-fetch-site': 'cross-site' },
    });

    expect(crossSite.status).toBe(403);
  });

  it("never lets one organisation's member pass as another's", async () => {
    // Globex's owner holds Acme's tokens (a member's session, an org statement) and sends them along.
    const acme = await forwarded('/pl:hr/api/v1/me', {
      headers: { cookie: await cookieOf(t.ids.member, t.ids.org) },
    });

    const { echo } = await forwarded('/pl:hr/api/v1/employees', {
      headers: {
        cookie: await cookieOf(t.ids.otherOwner, t.ids.otherOrg),
        authorization: acme.echo.headers.authorization ?? '',
        [PLUGIN_ORG_HEADER]: acme.echo.headers[PLUGIN_ORG_HEADER] ?? '',
      },
    });

    const session = (echo.headers.authorization ?? '').replace('Bearer ', '');

    expect(await verifyPluginSession(session, opts())).toMatchObject({
      orgId: t.ids.otherOrg,
      userId: t.ids.otherOwner,
    });
    expect(await verifyPluginOrg(echo.headers[PLUGIN_ORG_HEADER] ?? '', opts())).toBe(
      t.ids.otherOrg,
    );

    // A visitor can't name an organisation either: only the address does.
    const visitor = await forwarded('/pl:hr/public/v1/jobs', {
      host: 'globex.erxes.test',
      headers: { [PLUGIN_ORG_HEADER]: acme.echo.headers[PLUGIN_ORG_HEADER] ?? '' },
    });

    expect(await verifyPluginOrg(visitor.echo.headers[PLUGIN_ORG_HEADER] ?? '', opts())).toBe(
      t.ids.otherOrg,
    );

    // Tokens core signed for HR are no good for another plugin.
    await expect(
      verifyPluginOrg(visitor.echo.headers[PLUGIN_ORG_HEADER] ?? '', { ...opts(), plugin: 'ecom' }),
    ).rejects.toThrow('unexpected "aud" claim value');
  });

  it("gives visitors the address's organisation and keeps their own Authorization", async () => {
    const { echo } = await forwarded('/pl:hr/mobile/v1/me', {
      host: 'acme.erxes.test',
      headers: { authorization: 'Bearer hr-mobile-token' },
    });

    expect(echo.headers.authorization).toBe('Bearer hr-mobile-token');
    expect(await verifyPluginOrg(echo.headers[PLUGIN_ORG_HEADER] ?? '', opts())).toBe(t.ids.org);

    // An address that names no organisation that installed the plugin: no organisation.
    const unknown = await forwarded('/pl:hr/public/v1/jobs', { host: 'nobody.erxes.test' });

    expect(unknown.echo.headers[PLUGIN_ORG_HEADER]).toBeUndefined();
  });

  it('answers 404 for a plugin without an API and 403 where it is not installed', async () => {
    expect((await send('/pl:ecom/api', {})).status).toBe(404);

    await t.other().plugins.uninstall({ name: 'hr' });

    const response = await send('/pl:hr/api/v1/me', {
      headers: { cookie: await cookieOf(t.ids.otherOwner, t.ids.otherOrg) },
    });

    expect(response.status).toBe(403);
    expect(JSON.parse(response.body)).toMatchObject({ code: 'NOT_INSTALLED' });
  });
});
