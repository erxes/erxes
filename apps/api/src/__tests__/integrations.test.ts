import { newId, users } from '@erxes/core-db';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { fakeGateway } from './fakeGateway';
import { QPAY_KEYS, qpayAnswers, qpayTokens } from './qpaySandbox';
import { useTwoOrgs } from './support';

describe('integrations', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const ids = { both: newId(), payments: newId(), integrations: newId() };
  const both = () => t.client({ user: ids.both, org: t.ids.org });
  const paymentsOnly = () => t.client({ user: ids.payments, org: t.ids.org });
  const integrationsOnly = () => t.client({ user: ids.integrations, org: t.ids.org });

  const qpay = qpayTokens();

  const keysOf = async (client: ReturnType<typeof both>) =>
    (await client.integrations.list()).data.map((integration) => integration.key);

  const statusOf = async (client: ReturnType<typeof both>, key: string) =>
    (await client.integrations.list()).data.find((integration) => integration.key === key)?.status;

  beforeAll(async () => {
    qpayAnswers(qpay.fetch);

    const role = async (name: string, permissions: string[]) =>
      (await t.owner().roles.create({ name, permissions })).key;

    const [bothRole, paymentsRole, integrationsRole] = await Promise.all([
      role('Finance and setup', ['payments.manage', 'integrations.manage']),
      role('Finance', ['payments.manage']),
      role('Setup', ['integrations.manage']),
    ]);

    await adminDb()
      .insert(users)
      .values([
        { id: ids.both, orgId: t.ids.org, email: 'both@acme.mn', role: bothRole, status: 'active' },
        {
          id: ids.payments,
          orgId: t.ids.org,
          email: 'finance@acme.mn',
          role: paymentsRole,
          status: 'active',
        },
        {
          id: ids.integrations,
          orgId: t.ids.org,
          email: 'setup@acme.mn',
          role: integrationsRole,
          status: 'active',
        },
      ]);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('lists eBarimt and the gateways with their form fields, and a gateway goes from not set up to connected to off', async () => {
    const listed = (await both().integrations.list()).data;

    expect(listed.map((integration) => integration.key)).toEqual(
      expect.arrayContaining(['ebarimt', 'qpay', 'test']),
    );
    const listing = listed.find((integration) => integration.key === 'qpay');

    expect(listing?.permission).toBe('payments.manage');
    expect(listing?.status).toEqual({ state: 'not-set-up', count: null });
    expect(listing?.fields.map((field) => [field.key, field.type, field.optional])).toEqual([
      ['clientId', 'text', false],
      ['clientSecret', 'secret', false],
      ['invoiceCode', 'text', false],
      ['sandbox', 'switch', true],
    ]);

    const connection = await both().integrations.connect({
      key: 'qpay',
      name: 'QPay',
      keys: QPAY_KEYS,
    });

    expect(await statusOf(both(), 'qpay')).toEqual({ state: 'connected', count: 1 });

    await both().integrations.update({ key: 'qpay', id: connection.id, status: 'disabled' });

    expect(await statusOf(both(), 'qpay')).toEqual({ state: 'off', count: null });
  });

  it('lists only the integrations the member’s role manages', async () => {
    const setup = await keysOf(integrationsOnly());
    const finance = await keysOf(paymentsOnly());

    expect(setup).toContain('ebarimt');
    expect(setup).not.toContain('qpay');
    expect(setup).not.toContain('test');
    expect(finance).toEqual(expect.arrayContaining(['qpay', 'test']));
    expect(finance).not.toContain('ebarimt');
  });

  it('refuses a gateway’s connections to a member who may not manage payments', async () => {
    const gateway = await paymentsOnly().integrations.connect({
      key: 'test',
      name: 'Till',
      keys: {},
    });

    const refused = { status: 403, code: 'NOT_ALLOWED', data: { permission: 'payments.manage' } };
    const setup = integrationsOnly().integrations;

    await expect(setup.connections({ key: 'test' })).rejects.toMatchObject(refused);
    await expect(setup.connect({ key: 'test', name: 'Mine', keys: {} })).rejects.toMatchObject(
      refused,
    );
    await expect(
      setup.update({ key: 'test', id: gateway.id, name: 'Renamed', status: 'disabled' }),
    ).rejects.toMatchObject(refused);
    await expect(setup.remove({ key: 'test', id: gateway.id })).rejects.toMatchObject(refused);

    const kept = (await paymentsOnly().integrations.connections({ key: 'test' })).data;

    expect(kept.map((row) => [row.name, row.status])).toEqual([['Till', 'active']]);
  });

  it('never sends a secret key back, but sends the other settings', async () => {
    const connected = await both().integrations.connect({
      key: 'qpay',
      name: 'QPay main',
      keys: QPAY_KEYS,
    });

    const settings = { clientId: 'acme-client', invoiceCode: 'ACME_INVOICE', sandbox: true };

    expect(connected.settings).toEqual(settings);

    const renamed = await both().integrations.update({
      key: 'qpay',
      id: connected.id,
      name: 'QPay shop',
    });

    const listed = await both().integrations.connections({ key: 'qpay' });
    const gateways = await both().payments.gateways();

    expect(renamed.settings).toEqual(settings);
    expect(listed.data.find((row) => row.id === connected.id)?.settings).toEqual(settings);
    expect(gateways.data.find((row) => row.id === connected.id)?.settings).toEqual(settings);

    for (const answer of [connected, renamed, listed, gateways])
      expect(JSON.stringify(answer)).not.toContain('qpay-top-secret');
  });

  it('hides a connection from another organisation, which can neither change nor remove it', async () => {
    const gateway = await t
      .owner()
      .integrations.connect({ key: 'test', name: 'Acme only', keys: {} });

    const notFound = { status: 404, code: 'NOT_FOUND' };
    const globex = t.other().integrations;

    expect((await globex.connections({ key: 'test' })).data).toEqual([]);
    expect(await statusOf(t.other(), 'test')).toEqual({ state: 'not-set-up', count: null });
    await expect(
      globex.update({ key: 'test', id: gateway.id, name: 'Taken', status: 'disabled' }),
    ).rejects.toMatchObject(notFound);
    await expect(globex.remove({ key: 'test', id: gateway.id })).rejects.toMatchObject(notFound);

    const kept = (await t.owner().integrations.connections({ key: 'test' })).data;

    expect(kept.find((row) => row.id === gateway.id)).toMatchObject({
      name: 'Acme only',
      status: 'active',
    });
  });

  it('refuses a connection under another integration’s key, and an integration that does not exist', async () => {
    const gateway = await t.owner().integrations.connect({ key: 'test', name: 'Spare', keys: {} });
    const owner = t.owner().integrations;
    const changed = { status: 400, code: 'KIND_CHANGED' };

    await expect(
      owner.update({ key: 'qpay', id: gateway.id, keys: QPAY_KEYS }),
    ).rejects.toMatchObject(changed);
    await expect(owner.remove({ key: 'qpay', id: gateway.id })).rejects.toMatchObject(changed);
    expect(
      (await owner.connections({ key: 'test' })).data.find((row) => row.id === gateway.id),
    ).toMatchObject({ key: 'test', name: 'Spare' });

    await expect(owner.connections({ key: 'nope' })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
    await expect(owner.connect({ key: 'nope', name: 'Nope', keys: {} })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
    await expect(owner.connect({ key: 'ebarimt', name: 'Tax', keys: {} })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
  });

  it('refuses keys that do not fit the integration’s form, naming each field under keys', async () => {
    await expect(
      both().integrations.connect({ key: 'qpay', name: 'Half', keys: { clientId: 'acme-client' } }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_INPUT',
      data: { issues: [{ path: ['keys', 'clientSecret'] }, { path: ['keys', 'invoiceCode'] }] },
    });
  });

  it('checks new credentials with the gateway before saving them, and audits each change', async () => {
    const shop = await both().integrations.connect({
      key: 'qpay',
      name: 'QPay audit',
      keys: QPAY_KEYS,
    });

    const changed = { ...QPAY_KEYS, invoiceCode: 'NEW_CODE' };

    qpayAnswers(fakeGateway([]).fetch);

    try {
      await expect(
        both().integrations.update({ key: 'qpay', id: shop.id, keys: changed }),
      ).rejects.toMatchObject({ status: 400, code: 'GATEWAY_REFUSED' });
    } finally {
      qpayAnswers(qpay.fetch);
    }

    const settingsOf = async () =>
      (await both().integrations.connections({ key: 'qpay' })).data.find(
        (row) => row.id === shop.id,
      )?.settings;

    expect(await settingsOf()).toMatchObject({ invoiceCode: 'ACME_INVOICE' });
    await both().integrations.update({
      key: 'qpay',
      id: shop.id,
      keys: { invoiceCode: 'NEW_CODE' },
    });
    expect(await settingsOf()).toEqual({
      clientId: 'acme-client',
      invoiceCode: 'NEW_CODE',
      sandbox: true,
    });
    await both().integrations.update({
      key: 'qpay',
      id: shop.id,
      keys: { clientSecret: 'rotated-secret' },
    });
    await both().integrations.update({ key: 'qpay', id: shop.id, status: 'disabled' });
    expect(await both().integrations.remove({ key: 'qpay', id: shop.id })).toEqual({ ok: true });

    const audited = (await t.owner().audit.list({ targetId: shop.id })).data;

    expect(
      audited.map(({ action, targetType, metadata }) => [action, targetType, metadata]),
    ).toEqual([
      ['integration.removed', 'integration_connection', { key: 'qpay' }],
      [
        'integration.updated',
        'integration_connection',
        { key: 'qpay', credentialsChanged: false, status: 'disabled' },
      ],
      ['integration.updated', 'integration_connection', { key: 'qpay', credentialsChanged: true }],
      [
        'integration.updated',
        'integration_connection',
        { key: 'qpay', credentialsChanged: false, invoiceCode: 'NEW_CODE' },
      ],
      [
        'integration.connected',
        'integration_connection',
        { key: 'qpay', clientId: 'acme-client', invoiceCode: 'ACME_INVOICE', sandbox: true },
      ],
    ]);
  });

  it('refuses a state report from a plugin whose manifest declares no integrations', async () => {
    await expect(
      t.hr().integrations.report({ key: 'facebook', state: 'connected' }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });

  it('lists the connections of every integration the member manages, and none to another role or organisation', async () => {
    const till = await both().integrations.connect({ key: 'test', name: 'Vault till', keys: {} });

    const shop = await both().integrations.connect({
      key: 'qpay',
      name: 'Vault QPay',
      keys: QPAY_KEYS,
    });

    const listed = await both().integrations.connections({});
    const keys = new Map(listed.data.map((row) => [row.id, row.key]));

    expect(keys.get(till.id)).toBe('test');
    expect(keys.get(shop.id)).toBe('qpay');
    expect(JSON.stringify(listed)).not.toContain('qpay-top-secret');
    expect((await integrationsOnly().integrations.connections({})).data).toEqual([]);
    expect((await t.other().integrations.connections({})).data).toEqual([]);
  });

  it('names every plugin that takes payments on each gateway that is on, and none on one turned off', async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '2',
      scopes: ['payments:read', 'payments:write'],
    });

    const owner = t.owner();
    const open = await owner.integrations.connect({ key: 'test', name: 'Open till', keys: {} });
    const spare = await owner.integrations.connect({ key: 'test', name: 'Spare till', keys: {} });

    const usedBy = async (id: string) =>
      (await owner.integrations.connections({})).data.find((row) => row.id === id)?.usedBy;

    expect(await usedBy(open.id)).toEqual(['HR']);
    expect(await usedBy(spare.id)).toEqual(['HR']);

    await owner.payments.saveSettings({ defaultGatewayId: spare.id });

    expect(await usedBy(open.id)).toEqual(['HR']);
    expect(await usedBy(spare.id)).toEqual(['HR']);

    await owner.integrations.update({ key: 'test', id: open.id, status: 'disabled' });

    expect(await usedBy(open.id)).toEqual([]);
    expect(await usedBy(spare.id)).toEqual(['HR']);
  });
});
