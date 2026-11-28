import { createBankClient, khanbankTaxes } from '~/modules/integrations/banks';
import { describe, expect, it } from 'vite-plus/test';
import { fakeGateway } from './fakeGateway';

describe('Khan Bank corporate gateway', () => {
  it('reads accounts and statements, and sends transfers with the sender’s login', async () => {
    const gateway = fakeGateway([
      ['/auth/token', { access_token: 'kt', access_token_expires_in: 3600 }],
      [
        '/accounts/5005123456/',
        {
          account: {
            number: '5005123456',
            currency: 'MNT',
            balance: 2000,
            availableBalance: 1900,
            holdBalance: 100,
          },
        },
      ],
      [
        '/accounts',
        {
          accounts: [{ number: '5005123456', ibanAcctNo: 'MN12', currency: 'MNT', balance: 2000 }],
        },
      ],
      [
        '/statements/5005123456',
        {
          currency: 'MNT',
          beginBalance: 1000,
          endBalance: 2000,
          transactions: [
            {
              record: 7,
              tranDate: '2026-11-20',
              time: '11393704',
              amount: 1000,
              balance: 2000,
              description: 'Order 1',
            },
          ],
        },
      ],
      ['/transfer/domestic', { journalNo: 'J-1' }],
      ['/tax/inquiry/register', { tin: '123', name: 'Bat' }],
    ]);

    const config = {
      kind: 'khanbank' as const,
      consumerKey: 'ck',
      secretKey: 'sk',
      transactionPassword: 'tp',
    };

    const client = createBankClient(config, { fetch: gateway.fetch, cacheKey: 'kb-cg' });

    expect(await client.accounts()).toMatchObject([
      { number: '5005123456', iban: 'MN12', balance: 200_000 },
    ]);
    expect(await client.account('5005123456')).toMatchObject({ available: 190_000, hold: 10_000 });

    expect(
      await client.statement({
        account: '5005123456',
        from: '2026-11-01',
        to: '2026-11-20',
        page: 2,
      }),
    ).toEqual({
      lines: [
        {
          id: '7',
          date: '2026-11-20T11:39:37+08:00',
          amount: 100_000,
          balance: 200_000,
          description: 'Order 1',
          counterparty: null,
        },
      ],
      openingBalance: 100_000,
      closingBalance: 200_000,
      more: false,
    });
    expect(gateway.calls.at(-1)?.url).toContain('from=20261101&to=20261120&page=1');

    await expect(
      client.transfer({
        type: 'domestic',
        reference: 'ref-00000002',
        fromAccount: '5005123456',
        toAccount: '5005999999',
        amount: 150_000,
        currency: 'MNT',
        description: 'Rent',
      }),
    ).rejects.toThrow(/internet bank user/);

    expect(
      await client.transfer({
        type: 'domestic',
        reference: 'ref-00000002',
        fromAccount: '5005123456',
        toAccount: '5005999999',
        amount: 150_000,
        currency: 'MNT',
        description: 'Rent',
        sender: { loginName: 'bat', password: 'bank-pass' },
      }),
    ).toEqual({ bankReference: 'J-1' });
    expect(gateway.sent('/transfer/domestic')).toMatchObject({
      amount: 1500,
      transferid: 'ref-00000002',
      loginName: 'bat',
      tranPassword: 'tp',
    });

    expect(
      await khanbankTaxes(config, { fetch: gateway.fetch, cacheKey: 'kb-cg' }).taxpayer(
        'AA00112233',
      ),
    ).toEqual({
      tin: '123',
      name: 'Bat',
    });
  });
});

describe('TDB corporate gateway', () => {
  it('reads balances and statements, sends transfers, and treats success: false as a refusal', async () => {
    const gateway = fakeGateway([
      ['/oauth2/token', { success: true, data: { token: 'tt' } }],
      [
        '/accounts/4600123/balance',
        {
          success: true,
          data: { invoice: { ACNTNO: '4600123', CURCODE: 'MNT', BALANCE: 500, AVAILABLEBAL: 450 } },
        },
      ],
      [
        '/accounts/statement/4600123',
        {
          success: true,
          header: { startbalance: 100, endbalance: 500 },
          txn: [
            {
              refno: 11,
              txndate: '2026-11-20',
              txndesc: 'Order 2',
              credit: 400,
              debit: 0,
              balance: 500,
              contacntno: '99',
              contacntname: 'Dorj',
              bankcode: '05',
            },
          ],
        },
      ],
      ['/v1/transfer/interbank', { success: true, transactionNumber: 'TN-1' }],
      ['/v1/transfer/domestic', { success: false, msg: 'Insufficient funds' }],
    ]);

    const client = createBankClient(
      { kind: 'tdb', apiUrl: 'https://tdb.test', clientId: 'c', clientSecret: 's' },
      { fetch: gateway.fetch, cacheKey: 'tdb-cg' },
    );

    expect(await client.account('4600123')).toMatchObject({ balance: 50_000, available: 45_000 });
    expect(
      await client.statement({ account: '4600123', from: '2026-11-01', to: '2026-11-20', page: 1 }),
    ).toMatchObject({
      openingBalance: 10_000,
      closingBalance: 50_000,
      lines: [
        { id: '11', amount: 40_000, counterparty: { account: '99', name: 'Dorj', bank: '05' } },
      ],
    });

    const transfer = {
      reference: 'ref-00000003',
      fromAccount: '4600123',
      toAccount: '5005',
      amount: 10_000,
      currency: 'MNT',
      description: 'Supplier',
    };

    expect(
      await client.transfer({ ...transfer, type: 'interbank', toBank: '05', toAccountName: 'Bat' }),
    ).toEqual({ bankReference: 'TN-1' });
    expect(gateway.sent('/v1/transfer/interbank')).toMatchObject({
      txnAmount: 100,
      beneficiaryBankCode: 5,
      creditorAccountName: 'Bat',
    });

    await expect(client.transfer({ ...transfer, type: 'domestic' })).rejects.toThrow(
      /Insufficient funds/,
    );
  });
});
