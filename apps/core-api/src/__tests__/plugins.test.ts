import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createLocalJWKSet, jwtVerify } from 'jose';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createApp } from '~/app';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { describeWithDb, useTestDatabase } from './db';
import { HR_SECRET, pluginToken, requestPluginToken } from './plugin';

describeWithDb('plugin connection (registry, installations, tokens)', () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let orgId = '';
  let ownerId = '';
  let ownerToken = '';
  let memberToken = '';

  beforeAll(async () => {
    const { db, users, newId } = await import('@erxes/core-db');
    const acme = await createOrganization({ subdomain: 'acme', name: 'Acme', owner: { email: 'owner@acme.mn' } });
    const memberId = newId();

    orgId = acme.organization.id;
    ownerId = acme.owner.id;
    await db().insert(users).values({ id: memberId, orgId, email: 'member@acme.mn', role: 'member', status: 'active' });
    ownerToken = signAccessToken(ownerId, orgId);
    memberToken = signAccessToken(memberId, orgId);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const call = async (token: string, path: string, init: { method?: string; body?: unknown } = {}) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method: init.method ?? 'GET',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  it('issues short-lived tokens for organisations that installed the plugin, and refuses everything else', async () => {
    const token = await requestPluginToken(base, orgId);

    expect(token.status).toBe(200);
    expect(token.body).toMatchObject({ token_type: 'Bearer', expires_in: 900 });
    expect(token.body.scope).toContain('notifications:write');

    expect((await requestPluginToken(base, orgId, 'wrong-secret-0123456789abcdefghijklmnopqrstu')).body.code).toBe('INVALID_CLIENT');
    expect((await requestPluginToken(base, orgId, HR_SECRET, 'ecom')).body.code).toBe('INVALID_CLIENT');
    expect((await requestPluginToken(base, 'some-other-org')).body.code).toBe('NOT_INSTALLED');

    // Members' tokens and plugin tokens never stand in for each other.
    expect((await call(ownerToken, '/notifications', { method: 'POST', body: { userIds: [ownerId], kind: 'hr.x.y', title: 'x' } })).body.code).toBe(
      'PLUGIN_ONLY',
    );
    expect((await call(token.body.access_token!, '/customers')).body.code).toBe('MEMBERS_ONLY');
  });

  it('cuts a plugin off the moment it is uninstalled, and only the owner decides', async () => {
    const token = await pluginToken(base, orgId);
    const notify = () =>
      call(token, '/notifications', { method: 'POST', body: { userIds: [ownerId], kind: 'hr.leave.requested', title: 'Leave' } });

    expect((await notify()).status).toBe(201);
    expect((await call(memberToken, '/plugins/hr/uninstall', { method: 'POST' })).status).toBe(403);

    const uninstalled = await call(ownerToken, '/plugins/hr/uninstall', { method: 'POST' });

    expect(uninstalled.body).toMatchObject({ name: 'hr', installed: false });
    // The token it already holds stops working at once.
    expect((await notify()).status).toBe(401);
    expect((await requestPluginToken(base, orgId)).body.code).toBe('NOT_INSTALLED');

    expect((await call(ownerToken, '/plugins/hr/install', { method: 'POST' })).body).toMatchObject({ installed: true });
    expect((await call(await pluginToken(base, orgId), '/notifications', {
      method: 'POST',
      body: { userIds: [ownerId], kind: 'hr.leave.requested', title: 'Leave' },
    })).status).toBe(201);

    const audit = await call(ownerToken, '/audit?action=plugin.');

    expect(audit.body.data.map((entry: { action: string }) => entry.action)).toEqual(['plugin.installed', 'plugin.uninstalled']);
  });

  it('takes a manifest from the plugin, limits tokens to the scopes it asks for, and asks the owner for new ones', async () => {
    const service = await pluginToken(base);

    // The organisation token can't change the manifest; the service token can't act in an organisation.
    expect((await call(await pluginToken(base, orgId), '/plugins/manifest', { method: 'PUT', body: { title: 'HR', version: '1' } })).body.code).toBe(
      'SERVICE_TOKEN_REQUIRED',
    );
    expect((await call(service, '/plugins/manifest', {
      method: 'PUT',
      body: { title: 'HR', version: '1', permissions: [{ action: 'ecom.order.view', label: 'x' }] },
    })).body.code).toBe('NAMESPACE_REQUIRED');

    const manifest = {
      title: 'HR',
      version: '2.0.0',
      ui: { remote: 'hr_ui', entry: 'https://hr.example.com/remoteEntry.js' },
      api: { url: 'https://hr.example.com/api' },
      scopes: ['notifications:write'],
      permissions: [{ action: 'hr.leave.approve', label: 'Approve leave' }],
      events: [{ type: 'hr.leave.approved', label: 'Leave approved' }],
    };

    expect((await call(service, '/plugins/manifest', { method: 'PUT', body: manifest })).status).toBe(200);

    // Granted before (everything), now asked for less: tokens carry only notifications:write.
    const narrow = await requestPluginToken(base, orgId);

    expect(narrow.body.scope).toBe('notifications:write');
    expect((await call(narrow.body.access_token!, '/events', {
      method: 'POST',
      body: { events: [{ type: 'hr.leave.approved' }] },
    })).body.code).toBe('SCOPE_REQUIRED');

    // A version that asks for more needs the owner's approval first.
    await call(service, '/plugins/manifest', { method: 'PUT', body: { ...manifest, version: '2.1.0', scopes: ['notifications:write', 'events:write', 'live:write'] } });

    let listed = (await call(memberToken, '/plugins')).body.data.find((plugin: { name: string }) => plugin.name === 'hr');

    expect(listed).toMatchObject({ title: 'HR', version: '2.1.0', installed: true, api: { url: 'https://hr.example.com/api' } });
    expect((await requestPluginToken(base, orgId)).body.scope!.split(' ').sort()).toEqual(['events:write', 'live:write', 'notifications:write']);

    // (Granted at install: everything, so nothing new needs approval here.)
    expect(listed.needsApproval).toBe(false);

    await call(ownerToken, '/plugins/hr/uninstall', { method: 'POST' });
    await call(ownerToken, '/plugins/hr/install', { method: 'POST' });
    await call(service, '/plugins/manifest', { method: 'PUT', body: { ...manifest, version: '2.2.0', scopes: ['notifications:write', 'events:write', 'live:write', 'audit:write'] } });

    listed = (await call(memberToken, '/plugins')).body.data.find((plugin: { name: string }) => plugin.name === 'hr');
    expect(listed.needsApproval).toBe(true);
    expect((await requestPluginToken(base, orgId)).body.scope).not.toContain('audit:write');

    await call(ownerToken, '/plugins/hr/install', { method: 'POST' });
    expect((await requestPluginToken(base, orgId)).body.scope).toContain('audit:write');
  });

  it("gives a member a short token for one plugin's API, verifiable with the public keys alone", async () => {
    const session = await call(memberToken, '/plugins/hr/session', { method: 'POST' });

    expect(session.status).toBe(200);
    expect(session.body.apiUrl).toBe('https://hr.example.com/api');

    const jwks = (await fetch(`${base}/core/v1/.well-known/jwks.json`).then((response) => response.json())) as Parameters<
      typeof createLocalJWKSet
    >[0];
    const { payload, protectedHeader } = await jwtVerify(session.body.token, createLocalJWKSet(jwks), {
      issuer: 'erxes-core',
      audience: 'hr',
      typ: 'erxes-plugin-session+jwt',
    });

    expect(payload).toMatchObject({ org: orgId, role: 'member' });
    expect(protectedHeader.alg).toBe('ES256');
    expect(payload.exp! - payload.iat!).toBe(300);

    // Not usable on core, nor for another plugin.
    expect((await call(session.body.token, '/customers')).status).toBe(401);
    await expect(
      jwtVerify(session.body.token, createLocalJWKSet(jwks), { issuer: 'erxes-core', audience: 'ecom' }),
    ).rejects.toThrow();
    expect((await call(memberToken, '/plugins/ecom/session', { method: 'POST' })).body.code).toBe('NOT_INSTALLED');
  });

  it('rotates the client secret with a day of overlap', async () => {
    const { rotatePluginSecret } = await import('~/modules/plugins/plugins.service');
    const fresh = await rotatePluginSecret('hr');

    expect(fresh).toMatch(/^erxp_/);
    expect((await requestPluginToken(base, orgId, fresh)).status).toBe(200);
    // The old one still works until the plugin is redeployed with the new one.
    expect((await requestPluginToken(base, orgId, HR_SECRET)).status).toBe(200);

    const { db, plugins } = await import('@erxes/core-db');
    const { eq, sql } = await import('drizzle-orm');

    await db().update(plugins).set({ previousSecretExpiresAt: sql`now() - interval '1 second'` }).where(eq(plugins.name, 'hr'));
    expect((await requestPluginToken(base, orgId, HR_SECRET)).body.code).toBe('INVALID_CLIENT');
  });

  it('works end to end through @erxes/plugin-sdk', async () => {
    const { createCoreClient, verifyPluginSession } = await import('@erxes/plugin-sdk');
    const { rotatePluginSecret } = await import('~/modules/plugins/plugins.service');
    const secret = await rotatePluginSecret('hr');
    const core = createCoreClient({ coreUrl: base, plugin: 'hr', clientSecret: secret });

    await core.registerManifest({ title: 'HR', version: '3.0.0', scopes: ['notifications:write', 'events:write', 'live:write', 'audit:write'] });

    const sent = await core.forOrg(orgId).notifications.create({ userIds: [ownerId], kind: 'hr.leave.requested', title: 'From the SDK' });

    expect(sent.created).toBe(1);
    expect(await core.signal(orgId, ['leaves'])).toEqual({ ok: true });

    const session = await call(memberToken, '/plugins/hr/session', { method: 'POST' });

    expect(await verifyPluginSession(session.body.token, { coreUrl: base, plugin: 'hr' })).toMatchObject({ orgId, role: 'member' });
    await expect(verifyPluginSession(session.body.token, { coreUrl: base, plugin: 'ecom' })).rejects.toThrow();
  });
});
