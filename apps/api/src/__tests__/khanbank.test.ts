import { gatewayDriver } from '~/modules/integrations/registry';
import { describe, expect, it } from 'vite-plus/test';
import { fakeGateway, tugrugInvoice as invoice } from './fakeGateway';

/** A statement line made today (Ulaanbaatar time), at `time` (hhmmssss). */
const line = (record: number, amount: number, description: string, time = '12000000') => ({
  record,
  amount,
  tranDate: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ulaanbaatar' }),
  time,
  description,
});

describe('Khan Bank', () => {
  it('Khan Bank asks for a transfer and finds it on the statement by amount, time and reference', async () => {
    const gateway = fakeGateway([
      ['/auth/token', { access_token: 'kb', access_token_expires_in: 3600 }],
      [
        '/statements/5005123456',
        {
          transactions: [
            line(1, 1500, 'Order 12 ХААНААС: 050000 Bat'),
            line(2, 1500, 'Order 123 ХААНААС: 050000 Dorj'),
            line(3, 1400, 'EB-Order 123'),
            line(4, 1500, 'eb-order-123', '23590000'),
            line(5, 1500, 'Payment ХААНААС: 050000 Order 123'),
          ],
        },
      ],
    ]);

    const driver = gatewayDriver(
      'khanbank',
      { connectionId: 'bank1', accountNumber: '5005123456', iban: 'MN12000500' },
      {
        fetch: gateway.fetch,
        cacheKey: 'khanbank-test',
        bank: { kind: 'khanbank', consumerKey: 'ck', secretKey: 'sk' },
      },
    );

    const created = await driver.createInvoice({ ...invoice, description: 'Order 123' });

    expect(created).toMatchObject({
      gatewayInvoiceId: 'inv1',
      payment: {
        qrText: null,
        bankTransfer: {
          bank: 'Khan Bank',
          accountNumber: '5005123456',
          iban: 'MN12000500',
          amount: 150_000,
          reference: 'Order 123',
        },
      },
    });

    // The statement can be from before the invoice; let every line of today count.
    const state = {
      ...created.state,
      transferSince: new Date(Date.now() - 24 * 3600_000).toISOString(),
    };

    // "Order 12" is another invoice's, 1400 another amount, and a reference only in
    // the sender text the bank appends isn't the payer's.
    expect(await driver.check('inv1', 150_000, state)).toEqual({
      paid: true,
      paidAmount: 150_000,
      paymentId: '5005123456:2',
      paymentIds: ['5005123456:2', '5005123456:4'],
    });
    expect(gateway.calls.at(-1)?.auth).toBe('Bearer kb');
    await expect(driver.createInvoice({ ...invoice, description: '—' })).rejects.toThrow(
      /description/,
    );
  });
});
