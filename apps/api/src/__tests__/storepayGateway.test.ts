import { describe, expect, it } from 'vite-plus/test';
import { openGateway } from '~/modules/integrations/registry';
import { fakeGateway, refusal, tugrugInvoice } from './fakeGateway';

const LENDS = { status: 'Success', value: 1500 };
const LOAN = { status: 'Success', value: 77 };

let connections = 0;

const connect = (limit: unknown, loan: unknown = LOAN, more: [string, unknown, number?][] = []) => {
  const gateway = fakeGateway([
    ...more,
    ['/oauth/token', { access_token: 'sp' }],
    ['/user/possibleAmount', limit],
    ['POST /lend-merchant/merchant/loan', loan],
  ]);

  const { payments, client } = openGateway(
    'storepay',
    { storeId: '12', username: 'u', password: 'p', appUsername: 'a', appPassword: 'b' },
    { fetch: gateway.fetch, cacheKey: `storepay-${++connections}` },
  );

  const lend = (payerPhone = '99112233') =>
    payments.createInvoice(client, { ...tugrugInvoice, payerPhone });

  return { gateway, payments, client, lend };
};

describe('StorePay driver', () => {
  it('asks what it can lend the payer’s phone, then requests the loan by POST', async () => {
    const { gateway, lend } = connect(LENDS);

    expect(await lend()).toEqual({
      gatewayInvoiceId: '77',
      payment: { qrText: null, qrImage: null, shortUrl: null, links: [] },
    });
    expect(gateway.sent('/user/possibleAmount')).toEqual({ mobileNumber: 99_112_233 });
    expect(gateway.sent('/merchant/loan')).toEqual({
      storeId: 12,
      mobileNumber: 99_112_233,
      description: 'Order #1',
      amount: 1500,
      callbackUrl: tugrugInvoice.callbackUrl,
      requestId: 'inv1',
    });
    expect(gateway.calls.slice(1).map((call) => `${call.method} ${call.url}`)).toEqual([
      'POST https://service.storepay.mn/lend-merchant/user/possibleAmount',
      'POST https://service.storepay.mn/lend-merchant/merchant/loan',
    ]);
  });

  it('reads the payer’s phone as 8 digits after the country code', async () => {
    const { gateway, lend } = connect(LENDS);

    await lend('9976 1234');
    expect(gateway.sent('/merchant/loan')).toMatchObject({ mobileNumber: 99_761_234 });
    await lend('976 9911 2233');
    expect(gateway.sent('/merchant/loan')).toMatchObject({ mobileNumber: 99_112_233 });

    for (const phone of ['1 9911 2233', '9911 223']) {
      const { status, message } = await refusal(lend(phone));

      expect(status).toBe(400);
      expect(message).toMatch(/^StorePay needs/);
    }
  });

  it('lends up to the payer’s limit, and refuses past it with StorePay’s reason', async () => {
    expect(await connect({ status: 'Success', value: '1500' }).lend()).toMatchObject({
      gatewayInvoiceId: '77',
    });

    for (const [limit, reason] of [
      [{ status: 'Success', value: 1499.99 }, 'Success'],
      [{ status: 'Failed', msgList: [{ code: 'E1', text: 'No limit' }] }, 'No limit'],
      [{ status: 'Failed', msgList: [{ code: 'E2' }] }, 'E2'],
      [{ status: 'Blocked', msgList: [] }, 'Blocked'],
      [{}, 'refused'],
    ] as const) {
      const { status, message } = await refusal(connect(limit).lend());

      expect(status).toBe(400);
      expect(message).toContain(reason);
    }
  });

  it('refuses a loan StorePay did not make', async () => {
    for (const loan of [
      { status: 'Failed', value: 77 },
      { status: 'Success' },
      { status: 'Success', value: '' },
    ])
      await refusal(connect(LENDS, loan).lend());

    expect((await refusal(connect(LENDS, [LOAN]).lend())).message).toBe(
      'StorePay gave an unreadable answer',
    );
  });

  it('reads a loan as paid only when StorePay confirms it, and cancels it to refund', async () => {
    const { gateway, payments, client } = connect(LENDS, LOAN, [
      ['/merchant/loan/check/77', { status: 'Success', value: true }],
      ['/merchant/loan/check/78', { status: 'Success', value: 'true' }],
      ['/merchant/loanChange', { status: 'Success' }],
    ]);

    expect(
      await payments.check(client, { gatewayInvoiceId: '77', amount: 150_000, state: {} }),
    ).toEqual({ paid: true, paidAmount: 150_000, paymentId: '77' });
    expect(gateway.calls.at(-1)?.method).toBe('GET');
    expect(
      await payments.check(client, { gatewayInvoiceId: '78', amount: 150_000, state: {} }),
    ).toEqual({ paid: false, paidAmount: 0, paymentId: null });
    expect(
      await payments.refund(client, {
        paymentId: '77',
        amount: 150_000,
        note: 'r'.repeat(300),
        state: {},
      }),
    ).toEqual({ refundId: null });
    expect(gateway.sent('/merchant/loanChange')).toEqual({
      changeTypeId: 2,
      loanId: 77,
      reason: 'r'.repeat(255),
    });
  });

  it('fails a refund StorePay refuses', async () => {
    const { payments, client } = connect(LENDS, LOAN, [
      ['/merchant/loanChange', { status: 'Failed', msgList: [{ text: 'Already repaid' }] }],
    ]);

    const { message } = await refusal(
      payments.refund(client, { paymentId: '77', amount: 150_000, note: 'r', state: {} }),
    );

    expect(message).toContain('Already repaid');
  });
});
