import { gatewayDriver } from '~/modules/integrations/registry';
import { createBankClient, golomtCipher, golomtTransferCode } from '~/modules/integrations/banks';
import type { GolomtBankConfig } from '~/modules/integrations/banks/types';
import { describe, expect, it } from 'vite-plus/test';
import { tugrugInvoice, urlOf } from './fakeGateway';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** Base 32 (RFC 4648), as banks give TOTP secrets. */
const base32 = (text: string) => {
  const bits = Array.from(Buffer.from(text), (byte) => byte.toString(2).padStart(8, '0')).join('');

  return Array.from({ length: Math.ceil(bits.length / 5) }, (_, index) =>
    BASE32.charAt(Number.parseInt(bits.slice(index * 5, index * 5 + 5).padEnd(5, '0'), 2)),
  ).join('');
};

/** AES-128-CBC of `acme-pass` with the keys below, as `openssl enc -aes-128-cbc -K … -iv …` makes it. */
const OPENSSL_CIPHERTEXT = 'EweOIiKmbhh02nE874ofsQ==';

const golomt: GolomtBankConfig = {
  kind: 'golomt',
  apiUrl: 'https://golomt.test/api',
  registerNumber: '5555555',
  username: 'acme',
  password: 'acme-pass',
  clientId: 'cid',
  sessionKey: 'sessionkey123456',
  ivKey: 'ivkey12345678901',
  // RFC 6238's test secret, in base 32.
  transferSecret: base32('12345678901234567890'),
};

const { encrypt: aes, decrypt: plain } = golomtCipher(golomt);

type Sent = { url: string; headers: Headers; body: string };

/** Golomt's gateway: signs in in the clear, answers everything else encrypted. */
const golomtBank = (answers: Record<string, unknown>) => {
  const sent: Sent[] = [];

  const fetch = (input: string | URL | Request, init: RequestInit = {}) => {
    const url = urlOf(input);
    const body = typeof init.body === 'string' ? init.body : '';

    sent.push({ url, headers: new Headers(init.headers), body });

    if (url.includes('/v1/auth/login'))
      return Promise.resolve(Response.json({ token: 'gt', expiresIn: 300 }));

    const key = Object.keys(answers).find((path) => url.includes(path));

    return Promise.resolve(
      key
        ? new Response(aes(JSON.stringify(answers[key])), { status: 200 })
        : new Response('nope', { status: 404 }),
    );
  };

  return { fetch, sent };
};

describe('Golomt Bank corporate gateway', () => {
  it('makes the RFC 6238 transfer codes', () => {
    expect(golomtTransferCode(golomt.transferSecret ?? '', 59_000)).toBe('287082');
    expect(golomtTransferCode(golomt.transferSecret ?? '', 1_111_111_109_000)).toBe('081804');
  });

  it('signs in with the encrypted password, checksums each body and reads encrypted answers', async () => {
    const bank = golomtBank({
      '/v1/account/list': {
        operAccounts: [{ accountId: '1105000001', accountName: 'Acme', currency: 'MNT' }],
        depoAccounts: [{ accountId: '1105000002', accountName: 'Savings', currency: 'USD' }],
      },
      '/v1/account/balance/inq': {
        accountId: '1105000001',
        currency: 'MNT',
        balanceLL: [{ type: 'AVAIL', amount: { value: 1500.5, currency: 'MNT' } }],
      },
      '/v1/account/operative/statement': {
        statements: [
          {
            tranId: 'T1',
            drOrCr: 'Credit',
            tranAmount: 100,
            tranDesc: 'Order 1',
            tranPostedDate: '2026-11-20T10:00:00',
            balance: '1100',
          },
          { tranId: 'T2', drOrCr: 'Debit', tranAmount: 40, tranDesc: 'Fee' },
        ],
        totalPages: 2,
      },
    });

    const client = createBankClient(golomt, { fetch: bank.fetch, cacheKey: 'golomt-read' });

    expect(await client.accounts()).toMatchObject([
      { number: '1105000001', currency: 'MNT' },
      { number: '1105000002', currency: 'USD' },
    ]);

    const login = bank.sent.find((item) => item.url.includes('/auth/login'));

    // The password goes encrypted with the session and IV keys, as OpenSSL does it.
    expect(JSON.parse(login?.body ?? '{}')).toMatchObject({ password: OPENSSL_CIPHERTEXT });

    const list = bank.sent.find((item) => item.url.includes('/account/list'));

    expect(list?.url).toContain('client_id=cid');
    expect(list?.headers.get('X-Golomt-Service')).toBe('ACCTLST');
    expect(list?.headers.get('Authorization')).toBe('Bearer gt');
    expect(plain(list?.headers.get('X-Golomt-Checksum') ?? '')).toMatch(/^[0-9a-f]{64}$/u);

    expect(await client.account('1105000001')).toMatchObject({ available: 150_050 });

    expect(
      await client.statement({
        account: '1105000001',
        from: '2026-11-01',
        to: '2026-11-20',
        page: 1,
      }),
    ).toMatchObject({
      more: true,
      lines: [
        { id: 'T1', amount: 10_000, balance: 110_000, date: '2026-11-20T10:00:00+08:00' },
        { id: 'T2', amount: -4000 },
      ],
    });
  });

  it('sends a transfer with its code, and refuses one Golomt says partly failed', async () => {
    const good = golomtBank({
      '/v1/transaction/cgw/transfer': {
        successCount: 1,
        failedCount: 0,
        part: [{ tranId: 'TX-9', status: 'SUCCESS' }],
      },
    });

    const transfer = {
      type: 'interbank' as const,
      reference: 'ref-00000001',
      fromAccount: '1105000001',
      toAccount: '5005123456',
      toAccountName: 'Bat',
      toBank: '05',
      amount: 150_000,
      currency: 'MNT',
      description: 'Salary',
    };

    const client = createBankClient(golomt, { fetch: good.fetch, cacheKey: 'golomt-send' });

    expect(await client.transfer(transfer)).toEqual({ bankReference: 'TX-9' });

    const sent = good.sent.find((item) => item.url.includes('/cgw/transfer'));

    expect(sent?.headers.get('X-Golomt-Code')).toMatch(/^\d{6}$/u);
    expect(JSON.parse(sent?.body ?? '{}')).toMatchObject({
      type: 'TSF',
      refCode: 'ref-00000001',
      initiator: { acctNo: '1105000001', bank: '15', amount: { value: 1500, currency: 'MNT' } },
      receives: [{ acctNo: '5005123456', bank: '05', acctName: 'Bat' }],
    });

    const partly = golomtBank({
      '/v1/transaction/cgw/transfer': { successCount: 0, failedCount: 1 },
    });

    await expect(
      createBankClient(golomt, { fetch: partly.fetch, cacheKey: 'golomt-fail' }).transfer(transfer),
    ).rejects.toThrow(/did not make the transfer/);
  });

  it('pays a Golomt transfer invoice from a transfer on the statement', async () => {
    // A minute from now in Ulaanbaatar, as Golomt writes its posting times.
    const posted = new Date(Date.now() + 60_000)
      .toLocaleString('sv-SE', { timeZone: 'Asia/Ulaanbaatar' })
      .replace(' ', 'T');

    const bank = golomtBank({
      '/v1/account/balance/inq': { accountId: '1105000001', currency: 'MNT', balanceLL: [] },
      '/v1/account/operative/statement': {
        statements: [
          {
            tranId: 'T1',
            drOrCr: 'Credit',
            tranAmount: 1500,
            tranDesc: 'Order 12',
            tranPostedDate: posted,
          },
          {
            tranId: 'T2',
            drOrCr: 'Credit',
            tranAmount: 1500,
            tranDesc: 'Order 123 Bat',
            tranPostedDate: posted,
          },
          {
            tranId: 'T3',
            drOrCr: 'Debit',
            tranAmount: 1500,
            tranDesc: 'Order 123',
            tranPostedDate: posted,
          },
        ],
        totalPages: 1,
      },
    });

    const driver = gatewayDriver(
      'golomtcgw',
      { connectionId: 'bank1', accountNumber: '1105000001' },
      { fetch: bank.fetch, cacheKey: 'golomtcgw-test', bank: golomt },
    );

    await driver.verify();

    const created = await driver.createInvoice({ ...tugrugInvoice, description: 'Order 123' });

    expect(created.payment.bankTransfer).toMatchObject({
      bank: 'Golomt Bank',
      accountNumber: '1105000001',
      amount: 150_000,
      reference: 'Order 123',
    });

    // "Order 12" is another invoice's, and money out isn't a payment.
    expect(await driver.check('inv1', 150_000, created.state ?? {})).toMatchObject({
      paid: true,
      paymentId: '1105000001:T2',
    });
  });
});
