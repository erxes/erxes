import { newId, paymentGateways } from '@erxes/core-db';
import { describe, expect, it } from 'vite-plus/test';
import { seal } from '~/lib/secrets';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const order = { amount: 1250, description: 'Order #1', reference: { type: 'order', id: '1' } };

describe('countries and currencies', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** A QPay connection, stored directly: connecting one asks QPay. */
  const connectQPay = async () => {
    const id = newId();

    const config = {
      kind: 'qpay',
      clientId: 'c',
      clientSecret: 's',
      invoiceCode: 'I',
      sandbox: true,
    };

    await adminDb()
      .insert(paymentGateways)
      .values({
        id,
        orgId: t.ids.org,
        kind: 'qpay',
        name: 'QPay',
        configSealed: seal(JSON.stringify(config)),
      });

    return id;
  };

  it('keeps a country and currency per organisation; a new country brings its currency', async () => {
    expect(await t.owner().organizations.current({})).toMatchObject({
      country: null,
      currency: 'USD',
    });

    // Plugins read it too: they bill and show prices in it.
    expect((await t.hr().organizations.current({})).currency).toBe('USD');

    // Members need settings.manage; codes are checked.
    await expect(t.member().organizations.update({ country: 'MN' })).rejects.toMatchObject({
      status: 403,
    });
    await expect(t.owner().organizations.update({ country: 'XX' })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
    await expect(t.owner().organizations.update({ currency: 'ABC' })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });

    expect(await t.owner().organizations.update({ country: 'de' })).toMatchObject({
      country: 'DE',
      currency: 'EUR',
    });
    expect(await t.owner().organizations.update({ currency: 'usd' })).toMatchObject({
      country: 'DE',
      currency: 'USD',
    });

    const audit = await t.owner().audit.list({ action: 'organization.updated' });

    expect(audit.data[0]?.changes).toMatchObject({ currency: ['EUR', 'USD'] });

    // The other organisation is untouched.
    expect((await t.other().organizations.current({})).currency).toBe('USD');
  });

  it('prices products and bills in the organisation currency, through gateways that take it', async () => {
    await t.owner().organizations.update({ country: 'MN' });

    const qpay = await connectQPay();

    expect((await t.owner().products.create({ kind: 'goods', name: 'Tea' })).currency).toBe('MNT');

    await t.owner().organizations.update({ country: 'US' });

    // QPay only takes tögrög: a dollar invoice can't go through it.
    await expect(
      t.hr().payments.createInvoice({ ...order, gatewayId: qpay }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'CURRENCY_NOT_SUPPORTED',
    });
    await expect(t.hr().payments.createInvoice(order)).rejects.toMatchObject({
      code: 'CURRENCY_NOT_SUPPORTED',
      data: { currency: 'USD' },
    });

    // A gateway that takes dollars is picked over the first one.
    await t.owner().payments.addGateway({ name: 'Test', config: { kind: 'test' } });

    expect(await t.hr().payments.createInvoice(order)).toMatchObject({
      currency: 'USD',
      gatewayKind: 'test',
    });
    expect(await t.hr().payments.createInvoice({ ...order, currency: 'jpy' })).toMatchObject({
      currency: 'JPY',
    });
  });

  it('lets a plugin say which countries it is made for', async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'eBarimt',
      version: '1',
      countries: ['MN'],
    });

    const hr = (await t.owner().plugins.list({})).data.find((plugin) => plugin.name === 'hr');

    expect(hr?.countries).toEqual(['MN']);
  });
});
