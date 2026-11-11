import { db, newId, plugins, users } from '@erxes/core-db';
import { createCoreClient, verifyPluginSession } from '@erxes/plugin-sdk';
import { eq, sql } from 'drizzle-orm';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { beforeAll, expect, it } from 'vite-plus/test';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';
import { describeWithDb, HR_SECRET, useTestDatabase, useTestServer } from './support';

describeWithDb('plugin connection (registry, installations, tokens)', () => {
  useTestDatabase();

  const server = useTestServer();
  let orgId = '';
  let ownerId = '';
  let ownerToken = '';
  let memberToken = '';

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn' },
    });

    const memberId = newId();

    orgId = acme.organization.id;
    ownerId = acme.owner.id;
    await db()
      .insert(users)
      .values({ id: memberId, orgId, email: 'member@acme.mn', role: 'member', status: 'active' });
    ownerToken = signAccessToken(ownerId, orgId);
    memberToken = signAccessToken(memberId, orgId);
  });

  /** `POST /plugins/token` for `org` (or the manifest-only token without one). */
  const issue = (org?: string, secret = HR_SECRET, clientId = 'hr') =>
    server.client().plugins.token({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: secret,
      org,
    });

  const listedHr = async () => {
    const { data } = await server.client(memberToken).plugins.list();

    return data.find((plugin) => plugin.name === 'hr');
  };

  it('issues short-lived tokens for organisations that installed the plugin, and refuses everything else', async () => {
    const token = await issue(orgId);

    expect(token).toMatchObject({ token_type: 'Bearer', expires_in: 900 });
    expect(token.scope).toContain('notifications:write');

    await expect(
      issue(orgId, 'wrong-secret-0123456789abcdefghijklmnopqrstu'),
    ).rejects.toMatchObject({ code: 'INVALID_CLIENT' });
    await expect(issue(orgId, HR_SECRET, 'ecom')).rejects.toMatchObject({
      code: 'INVALID_CLIENT',
    });
    await expect(issue('some-other-org')).rejects.toMatchObject({ code: 'NOT_INSTALLED' });

    // Members' tokens and plugin tokens never stand in for each other.
    await expect(
      server
        .client(ownerToken)
        .notifications.create({ userIds: [ownerId], kind: 'hr.x.y', title: 'x' }),
    ).rejects.toMatchObject({ code: 'PLUGIN_ONLY' });
    await expect(server.client(token.access_token).customers.list({})).rejects.toMatchObject({
      code: 'MEMBERS_ONLY',
    });
  });

  it('cuts a plugin off the moment it is uninstalled, and only the owner decides', async () => {
    const leave = { userIds: [ownerId], kind: 'hr.leave.requested', title: 'Leave' };
    const hr = server.client((await issue(orgId)).access_token);

    await hr.notifications.create(leave);
    expect(server.status()).toBe(201);
    await expect(
      server.client(memberToken).plugins.uninstall({ name: 'hr' }),
    ).rejects.toMatchObject({ status: 403 });

    const uninstalled = await server.client(ownerToken).plugins.uninstall({ name: 'hr' });

    expect(uninstalled).toMatchObject({ name: 'hr', installed: false });
    // The token it already holds stops working at once.
    await expect(hr.notifications.create(leave)).rejects.toMatchObject({ status: 401 });
    await expect(issue(orgId)).rejects.toMatchObject({ code: 'NOT_INSTALLED' });

    expect(await server.client(ownerToken).plugins.install({ name: 'hr' })).toMatchObject({
      installed: true,
    });
    await server.client({ plugin: HR_SECRET, org: orgId }).notifications.create(leave);
    expect(server.status()).toBe(201);

    const audit = await server.client(ownerToken).audit.list({ action: 'plugin.' });

    expect(audit.data.map((entry) => entry.action)).toEqual([
      'plugin.installed',
      'plugin.uninstalled',
    ]);
  });

  it('takes a manifest from the plugin, limits tokens to the scopes it asks for, and asks the owner for new ones', async () => {
    const service = server.client({ plugin: HR_SECRET });

    // The organisation token can't change the manifest; the service token can't act in an organisation.
    await expect(
      server
        .client({ plugin: HR_SECRET, org: orgId })
        .plugins.registerManifest({ title: 'HR', version: '1' }),
    ).rejects.toMatchObject({ code: 'SERVICE_TOKEN_REQUIRED' });
    await expect(
      service.plugins.registerManifest({
        title: 'HR',
        version: '1',
        permissions: [{ action: 'ecom.order.view', label: 'x' }],
      }),
    ).rejects.toMatchObject({ code: 'NAMESPACE_REQUIRED' });

    const manifest = {
      title: 'HR',
      version: '2.0.0',
      ui: { remote: 'hr_ui', entry: 'https://hr.example.com/remoteEntry.js' },
      api: { url: 'https://hr.example.com/api' },
      scopes: ['notifications:write' as const],
      permissions: [{ action: 'hr.leave.approve', label: 'Approve leave' }],
      events: [{ type: 'hr.leave.approved', label: 'Leave approved' }],
    };

    await service.plugins.registerManifest(manifest);
    expect(server.status()).toBe(200);

    // Granted before (everything), now asked for less: tokens carry only notifications:write.
    const narrow = await issue(orgId);

    expect(narrow.scope).toBe('notifications:write');
    await expect(
      server
        .client(narrow.access_token)
        .events.publish({ events: [{ type: 'hr.leave.approved' }] }),
    ).rejects.toMatchObject({ code: 'SCOPE_REQUIRED' });

    // A version that asks for more needs the owner's approval first.
    await service.plugins.registerManifest({
      ...manifest,
      version: '2.1.0',
      scopes: ['notifications:write', 'events:write', 'live:write'],
    });

    let listed = await listedHr();

    expect(listed).toMatchObject({
      title: 'HR',
      version: '2.1.0',
      installed: true,
      api: { url: 'https://hr.example.com/api' },
    });
    expect((await issue(orgId)).scope.split(' ').toSorted()).toEqual([
      'events:write',
      'live:write',
      'notifications:write',
    ]);

    // (Granted at install: everything, so nothing new needs approval here.)
    expect(listed?.needsApproval).toBe(false);

    await server.client(ownerToken).plugins.uninstall({ name: 'hr' });
    await server.client(ownerToken).plugins.install({ name: 'hr' });
    await service.plugins.registerManifest({
      ...manifest,
      version: '2.2.0',
      scopes: ['notifications:write', 'events:write', 'live:write', 'audit:write'],
    });

    listed = await listedHr();
    expect(listed?.needsApproval).toBe(true);
    expect((await issue(orgId)).scope).not.toContain('audit:write');

    await server.client(ownerToken).plugins.install({ name: 'hr' });
    expect((await issue(orgId)).scope).toContain('audit:write');
  });

  it("gives a member a short token for one plugin's API, verifiable with the public keys alone", async () => {
    const session = await server.client(memberToken).plugins.session({ name: 'hr' });

    expect(server.status()).toBe(200);
    expect(session.apiUrl).toBe('https://hr.example.com/api');

    const jwks = createRemoteJWKSet(new URL(server.url('/core/v1/.well-known/jwks.json')));

    const { payload, protectedHeader } = await jwtVerify(session.token, jwks, {
      issuer: 'erxes-core',
      audience: 'hr',
      typ: 'erxes-plugin-session+jwt',
    });

    expect(payload).toMatchObject({ org: orgId, role: 'member' });
    expect(protectedHeader.alg).toBe('ES256');
    expect((payload.exp ?? 0) - (payload.iat ?? 0)).toBe(300);

    // Not usable on core, nor for another plugin.
    await expect(server.client(session.token).customers.list({})).rejects.toMatchObject({
      status: 401,
    });
    await expect(
      jwtVerify(session.token, jwks, { issuer: 'erxes-core', audience: 'ecom' }),
    ).rejects.toThrow('unexpected "aud" claim value');
    await expect(
      server.client(memberToken).plugins.session({ name: 'ecom' }),
    ).rejects.toMatchObject({ code: 'NOT_INSTALLED' });
  });

  it('rotates the client secret with a day of overlap', async () => {
    const fresh = await rotatePluginSecret('hr');

    expect(fresh).toMatch(/^erxp_/);
    await issue(orgId, fresh);
    // The old one still works until the plugin is redeployed with the new one.
    await issue(orgId, HR_SECRET);

    await db()
      .update(plugins)
      .set({ previousSecretExpiresAt: sql`now() - interval '1 second'` })
      .where(eq(plugins.name, 'hr'));
    await expect(issue(orgId, HR_SECRET)).rejects.toMatchObject({ code: 'INVALID_CLIENT' });
  });

  it('works end to end through @erxes/plugin-sdk', async () => {
    const secret = await rotatePluginSecret('hr');
    const core = createCoreClient({ coreUrl: server.url(''), plugin: 'hr', clientSecret: secret });

    await core.registerManifest({
      title: 'HR',
      version: '3.0.0',
      scopes: ['notifications:write', 'events:write', 'live:write', 'audit:write'],
    });

    const sent = await core.forOrg(orgId).notifications.create({
      userIds: [ownerId],
      kind: 'hr.leave.requested',
      title: 'From the SDK',
    });

    expect(sent.created).toBe(1);
    expect(await core.signal(orgId, ['leaves'])).toEqual({ ok: true });

    const session = await server.client(memberToken).plugins.session({ name: 'hr' });

    expect(
      await verifyPluginSession(session.token, { coreUrl: server.url(''), plugin: 'hr' }),
    ).toMatchObject({ orgId, role: 'member' });
    await expect(
      verifyPluginSession(session.token, { coreUrl: server.url(''), plugin: 'ecom' }),
    ).rejects.toThrow('unexpected "aud" claim value');
  });
});
