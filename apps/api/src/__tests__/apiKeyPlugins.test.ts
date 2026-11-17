import { auditLogs, roles, users } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { decodeJwt } from 'jose';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { READ_CONTACTS } from './apiKeySupport';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const ONLY_HR = { ...READ_CONTACTS, areas: {}, lifetimeDays: 30 } as const;

describe('API keys and plugins', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let leaveViewer = '';

  /** HR declares two actions; the member's role sees leave and makes keys, nothing more. */
  beforeAll(async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '1',
      permissions: [
        { action: 'hr.leave.view', label: 'See leave requests' },
        { action: 'hr.leave.approve', label: 'Approve leave' },
      ],
    });

    const role = await t.owner().roles.create({
      name: 'Leave viewer',
      permissions: ['hr.leave.view', 'api_keys.create'],
    });

    leaveViewer = role.key;
    await adminDb().update(users).set({ role: role.key }).where(eq(users.id, t.ids.member));
  });

  const session = async (key: string, name = 'hr') =>
    decodeJwt((await t.client(key).plugins.session({ name })).token);

  it("gives a key a token for the plugins it opens: read only for a read key, the maker's actions", async () => {
    const reader = await t.owner().apiKeys.create({
      ...ONLY_HR,
      name: 'HR reader',
      pluginAccess: { hr: 'read' },
    });

    expect(await session(reader.key)).toMatchObject({
      sub: t.ids.owner,
      role: 'api_key',
      access: 'read_only',
      permissions: ['hr.leave.view', 'hr.leave.approve'],
    });

    const writer = await t.owner().apiKeys.create({
      ...ONLY_HR,
      name: 'HR writer',
      pluginAccess: { hr: 'write' },
    });

    expect(await session(writer.key)).toMatchObject({ access: 'full' });
  });

  it('gives a plugin token only the actions the key was given there', async () => {
    const { apiKey, key } = await t.owner().apiKeys.create({
      ...ONLY_HR,
      name: 'Leave reader',
      actions: { hr: ['hr.leave.view'] },
    });

    expect(apiKey).toMatchObject({
      pluginAccess: { hr: 'write' },
      actions: { hr: ['hr.leave.view'] },
    });
    expect(await session(key)).toMatchObject({ access: 'full', permissions: ['hr.leave.view'] });

    await expect(
      t.owner().apiKeys.create({ ...ONLY_HR, name: 'Odd', actions: { hr: ['hr.payroll.run'] } }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('refuses a plugin the key does not open, and records the rule', async () => {
    const contacts = await t.owner().apiKeys.create({
      ...READ_CONTACTS,
      name: 'Contacts',
      lifetimeDays: 30,
    });

    await expect(session(contacts.key)).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
      data: { rule: 'plugins' },
    });

    const hr = await t.owner().apiKeys.create({
      ...ONLY_HR,
      name: 'HR only',
      pluginAccess: { hr: 'read' },
    });

    await expect(session(hr.key, 'ecom')).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
      data: { rule: 'plugin:ecom' },
    });

    const denied = await adminDb()
      .select({ metadata: auditLogs.metadata })
      .from(auditLogs)
      .where(and(eq(auditLogs.action, 'api_key.denied'), eq(auditLogs.targetId, hr.apiKey.id)));

    expect(denied.map((row) => row.metadata)).toEqual([
      expect.objectContaining({ procedure: 'plugins.session', rule: 'plugin:ecom' }),
    ]);
  });

  it("carries only the maker's plugin actions, and loses those the maker's role loses", async () => {
    const { key } = await t.member().apiKeys.create({
      ...ONLY_HR,
      name: 'Leave sync',
      pluginAccess: { hr: 'write' },
    });

    expect(await session(key)).toMatchObject({ permissions: ['hr.leave.view'], access: 'full' });

    await adminDb()
      .update(roles)
      .set({ permissions: ['api_keys.create'] })
      .where(and(eq(roles.orgId, t.ids.org), eq(roles.key, leaveViewer)));

    expect(await session(key)).toMatchObject({ permissions: [] });
  });

  it('refuses plugin access a key can’t have', async () => {
    const owner = t.owner();

    await expect(
      owner.apiKeys.create({ ...ONLY_HR, name: 'Missing', pluginAccess: { ecom: 'read' } }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });

    await expect(
      owner.apiKeys.create({
        ...ONLY_HR,
        name: 'Limited',
        areas: { contacts: 'read' },
        ownRecords: true,
        pluginAccess: { hr: 'read' },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });

    await expect(
      owner.apiKeys.create({
        ...ONLY_HR,
        kind: 'management',
        name: 'Setup',
        areas: { settings: 'read' },
        pluginAccess: { hr: 'read' },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });

    await adminDb()
      .update(roles)
      .set({ permissions: ['api_keys.create'] })
      .where(and(eq(roles.orgId, t.ids.org), eq(roles.key, leaveViewer)));

    await expect(
      t.member().apiKeys.create({ ...ONLY_HR, name: 'No HR', pluginAccess: { hr: 'read' } }),
    ).rejects.toMatchObject({ code: 'BEYOND_OWN_PERMISSIONS' });
  });
});
