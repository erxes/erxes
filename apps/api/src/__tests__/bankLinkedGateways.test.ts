import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { useTwoOrgs } from './support';

const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ulaanbaatar' });

/** TDB's corporate gateway: one account, and a statement with a ₮1,500 transfer for "Order 7". */
const tdb = fakeGateway([
  ['/oauth2/token', { success: true, data: { token: 'tt' } }],
  [
    '/accounts/4600123/balance',
    { success: true, data: { invoice: { ACNTNO: '4600123', CURCODE: 'MNT', BALANCE: 500 } } },
  ],
  [
    '/accounts/statement/4600123',
    { success: true, txn: [{ refno: 21, txndate: today, txndesc: 'Order 7 Bat', credit: 1500 }] },
  ],
  ['/accounts', { success: true, data: [{ ACNTNO: '4600123', CURCODE: 'MNT', BALANCE: 500 }] }],
]);

describe('payments by transfer through a bank connection', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  beforeAll(() => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) =>
      urlOf(input).startsWith('https://tdb.test') ? tdb.fetch(input, init) : realFetch(input, init),
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('reads the statement with the connection’s keys, and keeps the connection while payments that are on use it', async () => {
    const connection = await t.owner().integrations.connect({
      name: 'TDB',
      key: 'tdb-cgw',
      keys: { apiUrl: 'https://tdb.test', clientId: 'c', clientSecret: 'tdb-secret' },
    });

    // A connection of another bank isn't one this gateway can read through.
    await expect(
      t.owner().integrations.connect({
        name: 'Khan by transfer',
        key: 'khanbank',
        keys: { connectionId: connection.id, accountNumber: '4600123' },
      }),
    ).rejects.toMatchObject({ code: 'GATEWAY_REFUSED' });

    const gateway = await t.owner().integrations.connect({
      name: 'TDB by transfer',
      key: 'tdbcgw',
      keys: { connectionId: connection.id, accountNumber: '4600123' },
    });

    // Settings › Integrations › Connected shows the bank connection used by the payment.
    expect((await t.owner().integrations.connections({ key: 'tdb-cgw' })).data).toMatchObject([
      { id: connection.id, usedBy: ['TDB by transfer'] },
    ]);

    // The gateway keeps the connection, not its keys.
    expect(gateway.settings).toEqual({ connectionId: connection.id, accountNumber: '4600123' });

    const invoice = await t.hr().payments.createInvoice({
      gatewayId: gateway.id,
      amount: 150_000,
      currency: 'MNT',
      description: 'Order 7',
      referenceType: 'order',
      referenceId: 'o7',
    });

    expect(invoice.payment.bankTransfer).toMatchObject({ bank: 'TDB', accountNumber: '4600123' });
    expect((await t.hr().payments.getInvoice({ id: invoice.id })).status).toBe('paid');

    await expect(
      t.owner().integrations.remove({ key: 'tdb-cgw', id: connection.id }),
    ).rejects.toMatchObject({ code: 'BANK_IN_USE' });

    // Turned off, its invoices stay and the connection can go.
    await t.owner().integrations.update({ key: 'tdbcgw', id: gateway.id, status: 'disabled' });
    await t.owner().integrations.remove({ key: 'tdb-cgw', id: connection.id });
    expect((await t.owner().banks.connections()).data).toEqual([]);
  });
});
