import type { PluginManifest, PluginScope } from '@erxes/core-contract';
import { plugins } from '@erxes/core-db';
import { createCoreClient, verifyPluginSession } from '@erxes/plugin-sdk';
import { eq, sql } from 'drizzle-orm';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { describe, expect, it } from 'vite-plus/test';
import type { z } from 'zod';
import { rotatePluginSecret } from '~/modules/plugins/plugins.service';
import { adminDb, useTestDatabase } from './db';
import { HR_SECRET } from './plugin';
import { useTwoOrgs } from './support';

describe('plugin connection (registry, installations, tokens)', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** The token endpoint, as a plugin calls it. */
  const tokenFor = (options: { secret?: string; org?: string; clientId?: string } = {}) =>
    t.client().plugins.token({
      grant_type: 'client_credentials',
      client_id: options.clientId ?? 'hr',
      client_secret: options.secret ?? HR_SECRET,
      org: options.org ?? t.ids.org,
    });

  const scopesNow = async () => (await tokenFor()).scope?.split(' ') ?? [];

  const hrListing = async () =>
    (await t.member().plugins.list({})).data.find((plugin) => plugin.name === 'hr');

  const service = async () => t.client(await t.pluginToken());
  const leave = () => ({ userIds: [t.ids.owner], kind: 'hr.leave.requested', title: 'Leave' });

  it('issues short-lived tokens for organisations that installed the plugin, and refuses everything else', async () => {
    const token = await tokenFor();

    expect(token).toMatchObject({ token_type: 'Bearer', expires_in: 900 });
    expect(token.scope).toContain('notifications:write');

    const invalid = { code: 'INVALID_CLIENT' };

    await expect(
      tokenFor({ secret: 'wrong-secret-0123456789abcdefghijklmnopqrstu' }),
    ).rejects.toMatchObject(invalid);
    await expect(tokenFor({ clientId: 'ecom' })).rejects.toMatchObject(invalid);
    await expect(tokenFor({ org: 'some-other-org' })).rejects.toMatchObject({
      code: 'NOT_INSTALLED',
    });

    // Members' tokens and plugin tokens never stand in for each other.
    await expect(
      t.owner().notifications.create({ userIds: [t.ids.owner], kind: 'hr.x.y', title: 'x' }),
    ).rejects.toMatchObject({ code: 'PLUGIN_ONLY' });
    await expect(t.client(token.access_token).customers.list({})).rejects.toMatchObject({
      code: 'MEMBERS_ONLY',
    });
  });

  it('cuts a plugin off the moment it is uninstalled, and only the owner decides', async () => {
    const hr = t.client((await tokenFor()).access_token);

    expect((await hr.notifications.create(leave())).created).toBe(1);
    await expect(t.member().plugins.uninstall({ name: 'hr' })).rejects.toMatchObject({
      status: 403,
    });
    expect(await t.owner().plugins.uninstall({ name: 'hr' })).toMatchObject({
      name: 'hr',
      installed: false,
    });
    // The token it already holds stops working at once.
    await expect(hr.notifications.create(leave())).rejects.toMatchObject({ status: 401 });
    await expect(tokenFor()).rejects.toMatchObject({ code: 'NOT_INSTALLED' });

    expect(await t.owner().plugins.install({ name: 'hr' })).toMatchObject({ installed: true });
    expect((await t.hr().notifications.create(leave())).created).toBe(1);

    const audit = await t.owner().audit.list({ action: 'plugin.' });

    expect(audit.data.map((entry) => entry.action)).toEqual([
      'plugin.installed',
      'plugin.uninstalled',
    ]);
  });

  it('takes a manifest from the plugin, limits tokens to the scopes it asks for, and asks the owner for new ones', async () => {
    // The organisation token can't change the manifest; the service token can't act in an organisation.
    await expect(
      t.hr().plugins.registerManifest({ title: 'HR', version: '1' }),
    ).rejects.toMatchObject({ code: 'SERVICE_TOKEN_REQUIRED' });
    await expect(
      (await service()).plugins.registerManifest({
        title: 'HR',
        version: '1',
        permissions: [{ action: 'ecom.order.view', label: 'x' }],
      }),
    ).rejects.toMatchObject({ code: 'NAMESPACE_REQUIRED' });

    const manifest: z.input<typeof PluginManifest> = {
      title: 'HR',
      version: '2.0.0',
      ui: { remote: 'hr_ui', entry: 'https://hr.example.com/remoteEntry.js' },
      api: { url: 'https://hr.example.com/api' },
      scopes: ['notifications:write'],
      permissions: [{ action: 'hr.leave.approve', label: 'Approve leave' }],
      events: [
        { type: 'hr.leave.approved', label: 'Leave approved' },
        { type: 'hr.employee.hired', label: 'Employee hired', subject: 'customer' as const },
      ],
    };

    await (await service()).plugins.registerManifest(manifest);

    // A plugin event that says what it is about starts automations about that record.
    const { triggers } = await t.owner().automations.catalog({});

    expect(triggers.find((item) => item.type === 'hr.employee.hired')?.subject).toBe('customer');
    expect(triggers.find((item) => item.type === 'hr.leave.approved')?.subject).toBeNull();

    // Granted before (everything), now asked for less: tokens carry only notifications:write.
    const narrow = await tokenFor();

    expect(narrow.scope).toBe('notifications:write');
    await expect(
      t.client(narrow.access_token).events.publish({ events: [{ type: 'hr.leave.approved' }] }),
    ).rejects.toMatchObject({ code: 'SCOPE_REQUIRED' });

    // A version that asks for more needs the owner's approval first.
    const asking = (version: string, scopes: PluginScope[]) =>
      service().then((client) => client.plugins.registerManifest({ ...manifest, version, scopes }));

    await asking('2.1.0', ['notifications:write', 'events:write', 'live:write']);
    expect(await hrListing()).toMatchObject({
      title: 'HR',
      version: '2.1.0',
      installed: true,
      api: { url: 'https://hr.example.com/api' },
      // Granted at install: everything, so nothing new needs approval here.
      needsApproval: false,
    });
    expect((await scopesNow()).toSorted((a, b) => a.localeCompare(b))).toEqual([
      'events:write',
      'live:write',
      'notifications:write',
    ]);

    await t.owner().plugins.uninstall({ name: 'hr' });
    await t.owner().plugins.install({ name: 'hr' });
    await asking('2.2.0', ['notifications:write', 'events:write', 'live:write', 'audit:write']);
    expect((await hrListing())?.needsApproval).toBe(true);
    expect(await scopesNow()).not.toContain('audit:write');

    await t.owner().plugins.install({ name: 'hr' });
    expect(await scopesNow()).toContain('audit:write');
  });

  it("gives a member a short token for one plugin's API, verifiable with the public keys alone", async () => {
    const session = await t.member().plugins.session({ name: 'hr' });

    expect(session.apiUrl).toBe('https://hr.example.com/api');

    const jwks = createRemoteJWKSet(new URL(t.url('/core/v1/.well-known/jwks.json')));

    const { payload, protectedHeader } = await jwtVerify(session.token, jwks, {
      issuer: 'erxes-core',
      audience: 'hr',
      typ: 'erxes-plugin-session+jwt',
    });

    expect(payload).toMatchObject({ org: t.ids.org, role: 'member' });
    expect(protectedHeader.alg).toBe('ES256');
    expect((payload.exp ?? 0) - (payload.iat ?? 0)).toBe(300);

    // Not usable on core, nor for another plugin.
    await expect(t.client(session.token).customers.list({})).rejects.toMatchObject({ status: 401 });
    await expect(
      jwtVerify(session.token, jwks, { issuer: 'erxes-core', audience: 'ecom' }),
    ).rejects.toThrow('unexpected "aud" claim value');
    await expect(t.member().plugins.session({ name: 'ecom' })).rejects.toMatchObject({
      code: 'NOT_INSTALLED',
    });
  });

  it('rotates the client secret with a day of overlap', async () => {
    const fresh = await rotatePluginSecret('hr');

    expect(fresh).toMatch(/^erxp_/);
    expect((await tokenFor({ secret: fresh })).access_token).toEqual(expect.any(String));
    // The old one still works until the plugin is redeployed with the new one.
    expect((await tokenFor({ secret: HR_SECRET })).access_token).toEqual(expect.any(String));

    await adminDb()
      .update(plugins)
      .set({ previousSecretExpiresAt: sql`now() - interval '1 second'` })
      .where(eq(plugins.name, 'hr'));
    await expect(tokenFor({ secret: HR_SECRET })).rejects.toMatchObject({ code: 'INVALID_CLIENT' });
  });

  it('works end to end through @erxes/plugin-sdk', async () => {
    const coreUrl = t.url('');
    const secret = await rotatePluginSecret('hr');
    const core = createCoreClient({ coreUrl, plugin: 'hr', clientSecret: secret });

    await core.registerManifest({
      title: 'HR',
      version: '3.0.0',
      scopes: ['notifications:write', 'events:write', 'live:write', 'audit:write'],
    });

    const sent = await core.forOrg(t.ids.org).notifications.create({
      userIds: [t.ids.owner],
      kind: 'hr.leave.requested',
      title: 'From the SDK',
    });

    expect(sent.created).toBe(1);
    expect(await core.signal(t.ids.org, ['leaves'])).toEqual({ ok: true });

    const { token } = await t.member().plugins.session({ name: 'hr' });

    expect(await verifyPluginSession(token, { coreUrl, plugin: 'hr' })).toMatchObject({
      orgId: t.ids.org,
      role: 'member',
    });
    await expect(verifyPluginSession(token, { coreUrl, plugin: 'ecom' })).rejects.toThrow(
      'unexpected "aud" claim value',
    );
  });
});
