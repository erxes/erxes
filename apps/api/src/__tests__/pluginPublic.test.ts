import { pluginInstallations } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { gzipSync } from 'node:zlib';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { pluginApi } from './pluginApi';
import { useTwoOrgs } from './support';

/** Calls from outside erxes that core forwards to the `hr` plugin's `/public` routes. */
describe('plugin public routes', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let api: Awaited<ReturnType<typeof pluginApi>>;

  const register = async (url: string) =>
    t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '1',
      api: { url },
      publicPaths: ['/github/webhook', '/github/setup'],
    });

  const publicUrl = (path: string, org = t.ids.org) =>
    t.url(`/core/v1/plugins/hr/public/${org}${path}`);

  beforeAll(async () => {
    api = await pluginApi(t.url(''));
    await register(api.url);
  });

  afterAll(() => api.close());

  it('forwards a webhook to the plugin, naming the organisation, with its body, query and headers', async () => {
    const body = JSON.stringify({ action: 'opened', issue: { number: 7 } });

    const response = await fetch(publicUrl('/github/webhook?source=github'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-github-event': 'issues',
        authorization: 'Bearer from-the-sender',
        cookie: 'erxes_session=member',
        'x-real-ip': '203.0.113.9',
      },
      body,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ orgId: t.ids.org });
    // Served from core's address beside the member's session: no script, sniffing or caching.
    expect(response.headers.get('content-security-policy')).toBe("default-src 'none'; sandbox");
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('cache-control')).toBe('no-store');

    const call = api.publicCalls.at(-1);

    expect(call).toMatchObject({
      orgId: t.ids.org,
      method: 'POST',
      path: '/public/github/webhook?source=github',
      raw: body,
    });
    expect(call?.headers['x-github-event']).toBe('issues');
    // Core's token replaces the sender's, and a member's cookie never reaches the plugin.
    expect(call?.headers.authorization).not.toContain('from-the-sender');
    expect(call?.headers.cookie).toBeUndefined();
    // A client address the caller made up doesn't reach it; core says where the call came from.
    expect(call?.headers['x-real-ip']).toBeUndefined();
    expect(call?.headers['x-forwarded-for']).toBeTruthy();
  });

  it('passes a body that isn’t text on byte for byte', async () => {
    const bytes = new Uint8Array([0xff, 0xfe, 0x00, 0x80]);

    const response = await fetch(publicUrl('/github/webhook'), {
      method: 'POST',
      headers: { 'content-type': 'application/octet-stream' },
      body: bytes,
    });

    expect(response.status).toBe(200);
    expect(api.publicCalls.at(-1)?.headers['content-length']).toBe('4');
  });

  it('passes a compressed body on as the text it holds', async () => {
    const body = JSON.stringify({ zen: 'Keep it logically awesome.' });

    const response = await fetch(publicUrl('/github/webhook'), {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'content-encoding': 'gzip' },
      body: gzipSync(body),
    });

    expect(response.status).toBe(200);
    expect(api.publicCalls.at(-1)?.raw).toBe(body);
    expect(api.publicCalls.at(-1)?.headers['content-encoding']).toBeUndefined();
    expect(api.publicCalls.at(-1)?.headers['accept-encoding']).toBeUndefined();
  });

  it('passes a redirect back, without the plugin’s cookies', async () => {
    const response = await fetch(publicUrl('/github/setup?installation_id=42'), {
      redirect: 'manual',
    });

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/hr/settings/github');
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(api.publicCalls.at(-1)).toMatchObject({ method: 'GET', raw: '' });
  });

  it.each([
    ['a path the manifest doesn’t list', '/github/other'],
    ['a path that climbs out of a listed one', '/github/webhook/%2E%2E/%2E%2E/events'],
    ['a segment that hides a slash', '/github/webhook/..%2F..%2Fevents'],
  ])('answers 404 for %s', async (_case, path) => {
    const calls = api.publicCalls.length;
    const response = await fetch(publicUrl(path), { method: 'POST', body: '{}' });

    expect(response.status).toBe(404);
    expect(api.publicCalls).toHaveLength(calls);
  });

  it('answers 404 for an organisation without the plugin, or none', async () => {
    await adminDb()
      .update(pluginInstallations)
      .set({ status: 'disabled' })
      .where(
        and(eq(pluginInstallations.orgId, t.ids.otherOrg), eq(pluginInstallations.plugin, 'hr')),
      );

    for (const org of [t.ids.otherOrg, 'no-such-organisation']) {
      const response = await fetch(publicUrl('/github/webhook', org), { method: 'POST' });

      expect(response.status).toBe(404);
    }
  });

  it('refuses a call that didn’t come through core', async () => {
    const response = await fetch(`${api.url}/public/github/webhook`, {
      method: 'POST',
      body: '{}',
    });

    expect(response.status).toBe(401);
    expect(api.rejected.at(-1)).toContain('no core token');
  });

  it('answers 502 when the plugin doesn’t answer', async () => {
    await register('http://127.0.0.1:9');

    const response = await fetch(publicUrl('/github/webhook'), { method: 'POST', body: '{}' });

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ code: 'PLUGIN_UNREACHABLE' });

    await register(api.url);
  });
});
