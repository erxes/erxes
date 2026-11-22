import { auditLogs, bankTransfers, secrets } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { useTwoOrgs } from './support';

/** TDB's corporate gateway; its domestic transfers are refused for lack of funds. */
const tdb = fakeGateway([
  ['/oauth2/token', { success: true, data: { token: 'tt' } }],
  [
    '/accounts/statement/4600123',
    {
      success: true,
      header: { startbalance: 100, endbalance: 500 },
      txn: [{ refno: 11, txndate: '2026-11-20', txndesc: 'Order 2', credit: 400, debit: 0 }],
    },
  ],
  ['/accounts', { success: true, data: [{ ACNTNO: '4600123', CURCODE: 'MNT', BALANCE: 500 }] }],
  ['/v1/transfer/interbank', { success: true, transactionNumber: 'TN-1' }],
  ['/v1/transfer/domestic', { success: false, msg: 'Insufficient funds' }],
]);

/** Khan Bank's corporate gateway, which signs in any key but `wrong`. */
const khan = fakeGateway([
  ['/accounts', { accounts: [{ number: '5005123456', currency: 'MNT', balance: 2000 }] }],
  ['/transfer/domestic', { journalNo: 'J-1' }],
]);

const tdbKeys = {
  apiUrl: 'https://tdb.test',
  clientId: 'c',
  clientSecret: 'tdb-secret',
};

const transfer = (reference: string) => ({
  reference,
  fromAccount: '4600123',
  toAccount: '5005999999',
  amount: 150_000,
  currency: 'MNT',
  description: 'Supplier invoice 12',
});

describe('bank accounts', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  beforeAll(() => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
      const url = urlOf(input);

      if (url.startsWith('https://tdb.test')) return tdb.fetch(input, init);

      if (url.startsWith('https://api.khanbank.com')) {
        if (url.includes('/auth/token'))
          return Promise.resolve(
            new Headers(init?.headers).get('authorization')?.includes(btoa('wrong:'))
              ? new Response('{"message":"Invalid client"}', { status: 401 })
              : Response.json({ access_token: 'kt', access_token_expires_in: 3600 }),
          );

        return khan.fetch(input, init);
      }

      return realFetch(input, init);
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('connects a bank once it answers, and never shows its credentials', async () => {
    await expect(
      t.owner().integrations.connect({
        name: 'Khan',
        key: 'khanbank-cgw',
        keys: { consumerKey: 'wrong', secretKey: 'x' },
      }),
    ).rejects.toMatchObject({ code: 'GATEWAY_REFUSED' });

    const added = await t
      .owner()
      .integrations.connect({ name: 'TDB', key: 'tdb-cgw', keys: tdbKeys });

    expect(added).toMatchObject({
      key: 'tdb-cgw',
      settings: { apiUrl: 'https://tdb.test', clientId: 'c' },
    });
    expect(added.settings).not.toHaveProperty('clientSecret');
    expect((await t.owner().banks.connections()).data).toMatchObject([
      { id: added.id, kind: 'tdb', transfers: true },
    ]);
    expect(JSON.stringify(await t.owner().banks.connections())).not.toContain('tdb-secret');

    // Its keys are in the vault, sealed.
    const sealed = await adminDb().select({ sealed: secrets.sealed }).from(secrets);

    expect(JSON.stringify(sealed)).not.toContain('tdb-secret');
  });

  it('reads accounts and statements, sends money once per reference, and keeps what the bank answered', async () => {
    const [connection] = (await t.owner().banks.connections()).data;
    const id = connection?.id ?? '';

    expect((await t.owner().banks.accounts({ id })).data).toMatchObject([
      { number: '4600123', balance: 50_000 },
    ]);
    expect(
      await t
        .owner()
        .banks.statement({ id, account: '4600123', from: '2026-11-01', to: '2026-11-20' }),
    ).toMatchObject({ openingBalance: 10_000, lines: [{ id: '11', amount: 40_000 }] });

    const sent = await t.owner().banks.transfer({
      id,
      ...transfer('pay-supplier-0001'),
      type: 'interbank',
      toBank: '05',
      toAccountName: 'Bat',
    });

    expect(sent).toMatchObject({ status: 'sent', bankReference: 'TN-1', amount: 150_000 });

    // Asked again (a double click, a retry), it isn't sent again.
    await expect(
      t.owner().banks.transfer({
        id,
        ...transfer('pay-supplier-0001'),
        type: 'interbank',
        toBank: '05',
        toAccountName: 'Bat',
      }),
    ).rejects.toMatchObject({ code: 'TRANSFER_REPEATED' });
    expect(tdb.calls.filter((call) => call.url.includes('/v1/transfer/interbank'))).toHaveLength(1);

    // The bank's refusal is kept and answered, not lost.
    expect(
      await t.owner().banks.transfer({ id, ...transfer('pay-supplier-0002'), type: 'domestic' }),
    ).toMatchObject({ status: 'failed' });
    expect((await t.owner().banks.transfers({})).data[0]?.error).toContain('Insufficient funds');

    const listed = await t.owner().banks.transfers({});

    expect(listed.data.map((row) => [row.reference, row.status])).toEqual([
      ['pay-supplier-0002', 'failed'],
      ['pay-supplier-0001', 'sent'],
    ]);

    const audit = await adminDb()
      .select({ action: auditLogs.action })
      .from(auditLogs)
      .where(eq(auditLogs.targetType, 'bank_transfer'));

    expect(audit.map((row) => row.action).toSorted((a, b) => a.localeCompare(b))).toEqual([
      'bank.transfer_failed',
      'bank.transfer_sent',
    ]);
  });

  it('asks Khan Bank for the sender’s login each time and never keeps it', async () => {
    const khanbank = await t.owner().integrations.connect({
      name: 'Khan',
      key: 'khanbank-cgw',
      keys: { consumerKey: 'ck', secretKey: 'sk' },
    });

    // Without its transaction password, it can't send money.
    expect(
      (await t.owner().banks.connections()).data.find((item) => item.id === khanbank.id),
    ).toMatchObject({ transfers: false });
    await expect(
      t
        .owner()
        .banks.transfer({ id: khanbank.id, ...transfer('pay-rent-000001'), type: 'domestic' }),
    ).rejects.toMatchObject({ code: 'NOT_SUPPORTED' });

    await t.owner().integrations.update({
      id: khanbank.id,
      key: 'khanbank-cgw',
      keys: { consumerKey: 'ck', secretKey: 'sk', transactionPassword: 'tp' },
    });

    expect(
      await t.owner().banks.transfer({
        id: khanbank.id,
        ...transfer('pay-rent-000002'),
        fromAccount: '5005123456',
        type: 'domestic',
        sender: { loginName: 'bat', password: 'bank-login-pass' },
      }),
    ).toMatchObject({ status: 'sent', bankReference: 'J-1' });
    expect(khan.sent('/transfer/domestic')).toMatchObject({
      loginName: 'bat',
      password: 'bank-login-pass',
    });

    const rows = await adminDb().select().from(bankTransfers);
    const logged = await adminDb().select().from(auditLogs);

    expect(JSON.stringify(rows)).not.toContain('bank-login-pass');
    expect(JSON.stringify(logged)).not.toContain('bank-login-pass');

    // Removing the connection keeps the record of money sent through it.
    await t.owner().integrations.remove({ key: 'khanbank-cgw', id: khanbank.id });
    expect((await t.owner().banks.transfers({})).data).toHaveLength(3);
  });

  it('lets only members allowed to see or send', async () => {
    const [connection] = (await t.owner().banks.connections()).data;
    const id = connection?.id ?? '';

    await expect(t.member().banks.accounts({ id })).rejects.toMatchObject({ code: 'NOT_ALLOWED' });
    await expect(
      t.member().banks.transfer({ id, ...transfer('pay-hr-0000001'), type: 'domestic' }),
    ).rejects.toMatchObject({ code: 'NOT_ALLOWED' });
    await expect(
      t.member().integrations.connect({ name: 'TDB 2', key: 'tdb-cgw', keys: tdbKeys }),
    ).rejects.toMatchObject({ code: 'NOT_ALLOWED' });

    // The other organisation sees none of it.
    expect((await t.other().banks.connections()).data).toEqual([]);
    expect((await t.other().banks.transfers({})).data).toEqual([]);
  });
});
