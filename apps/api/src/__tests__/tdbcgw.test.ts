import { gatewayOf, openGateway } from '~/modules/integrations/registry';
import { describe, expect, it } from 'vite-plus/test';
import { fakeGateway, tugrugInvoice as invoice } from './fakeGateway';

const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ulaanbaatar' });

describe('TDB by transfer', () => {
  it('asks for a transfer and finds it on the TDB statement by amount and reference', async () => {
    const gateway = fakeGateway([
      ['/oauth2/token', { success: true, data: { token: 'tt' } }],
      [
        '/accounts/4600123/balance',
        { success: true, data: { invoice: { ACNTNO: '4600123', CURCODE: 'MNT' } } },
      ],
      [
        '/accounts/statement/4600123',
        {
          success: true,
          txn: [
            { refno: 1, txndate: today, txndesc: 'Order 12', credit: 1500 },
            { refno: 2, txndate: today, txndesc: 'EB-Order 123 Bat', credit: 1500 },
            { refno: 3, txndate: today, txndesc: 'Order 123', credit: 1400 },
            { refno: 4, txndate: today, txndesc: 'Order 123', debit: 1500 },
          ],
        },
      ],
    ]);

    const { payments, client } = openGateway(
      'tdbcgw',
      { connectionId: 'bank1', accountNumber: '4600123', iban: 'MN34' },
      {
        fetch: gateway.fetch,
        cacheKey: 'tdbcgw-test',
        bank: { kind: 'tdb', apiUrl: 'https://tdb.test', clientId: 'c', clientSecret: 's' },
      },
    );

    await gatewayOf('tdbcgw').verify(client);

    const created = await payments.createInvoice(client, { ...invoice, description: 'Order 123' });

    expect(created.payment).toMatchObject({
      qrText: null,
      bankTransfer: {
        bank: 'TDB',
        accountNumber: '4600123',
        iban: 'MN34',
        amount: 150_000,
        reference: 'Order 123',
      },
    });

    // TDB gives days without times: today's lines count for an invoice made today.
    const state = created.state ?? {};

    // "Order 12" is another invoice's, 1400 another amount, and money out isn't a payment.
    expect(
      await payments.check(client, { gatewayInvoiceId: 'inv1', amount: 150_000, state }),
    ).toEqual({
      paid: true,
      paidAmount: 150_000,
      paymentId: '4600123:2',
      paymentIds: ['4600123:2'],
    });
  });
});
