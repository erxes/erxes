import { integrationConnections, secrets } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { splitConnectionValues } from '~/modules/integrations/splitConnectionValues';
import { sealFor } from '~/modules/secrets/vault';
import { adminDb, useTestDatabase } from './db';
import { QPAY_KEYS, qpayAnswers, qpayTokens } from './qpaySandbox';
import { useTwoOrgs } from './support';

const basic = (secret: string) =>
  `Basic ${Buffer.from(`${QPAY_KEYS.clientId}:${secret}`).toString('base64')}`;

const SETTINGS = { clientId: 'acme-client', invoiceCode: 'ACME_INVOICE', sandbox: true };

const stored = async (id: string) => {
  const [row] = await adminDb()
    .select({ settings: integrationConnections.settings, secret: secrets })
    .from(integrationConnections)
    .innerJoin(secrets, eq(secrets.id, integrationConnections.secretId))
    .where(eq(integrationConnections.id, id));

  if (!row) throw new Error(`no connection ${id}`);

  return row;
};

describe('connection values', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const qpay = qpayTokens();

  const listed = async (id: string) =>
    (await t.owner().integrations.connections({ key: 'qpay' })).data.find((row) => row.id === id);

  beforeAll(() => {
    qpayAnswers(qpay.fetch);
  });

  it('keeps settings readable on the connection and asks the service with the kept secret when one setting changes', async () => {
    const shop = await t.owner().integrations.connect({
      key: 'qpay',
      name: 'Shop',
      keys: QPAY_KEYS,
    });

    expect((await stored(shop.id)).settings).toEqual(SETTINGS);
    expect(JSON.stringify(await stored(shop.id))).not.toContain(QPAY_KEYS.clientSecret);

    const changed = await t.owner().integrations.update({
      key: 'qpay',
      id: shop.id,
      keys: { invoiceCode: 'SECOND_CODE' },
    });

    expect(changed.settings).toEqual({ ...SETTINGS, invoiceCode: 'SECOND_CODE' });
    expect(qpay.calls.at(-1)?.auth).toBe(basic(QPAY_KEYS.clientSecret));

    await t.owner().integrations.update({
      key: 'qpay',
      id: shop.id,
      keys: { clientSecret: 'rotated-secret' },
    });

    expect(qpay.calls.at(-1)?.auth).toBe(basic('rotated-secret'));
    expect((await listed(shop.id))?.settings).toEqual({ ...SETTINGS, invoiceCode: 'SECOND_CODE' });
    expect(JSON.stringify(await listed(shop.id))).not.toContain('rotated-secret');
  });

  it('splits a connection that kept every value sealed, and it still reaches the service', async () => {
    const old = await t.owner().integrations.connect({ key: 'qpay', name: 'Old', keys: QPAY_KEYS });
    const { secret } = await stored(old.id);

    await adminDb()
      .update(secrets)
      .set(sealFor(secret, JSON.stringify(QPAY_KEYS)))
      .where(eq(secrets.id, secret.id));
    await adminDb()
      .update(integrationConnections)
      .set({ settings: {} })
      .where(eq(integrationConnections.id, old.id));

    expect((await listed(old.id))?.settings).toEqual({});

    await adminDb().transaction((tx) => splitConnectionValues(tx));

    expect((await listed(old.id))?.settings).toEqual(SETTINGS);

    await t.owner().integrations.update({
      key: 'qpay',
      id: old.id,
      keys: { invoiceCode: 'AFTER_SPLIT' },
    });

    expect(qpay.calls.at(-1)?.auth).toBe(basic(QPAY_KEYS.clientSecret));
    expect((await listed(old.id))?.settings).toEqual({ ...SETTINGS, invoiceCode: 'AFTER_SPLIT' });
  });
});
