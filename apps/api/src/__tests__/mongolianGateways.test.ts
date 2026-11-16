import { createGateway } from '@erxes/payment-gateways';
import { describe, expect, it } from 'vite-plus/test';
import { hmacSha256 } from '~/lib/crypto';
import { fakeGateway, tugrugInvoice as invoice, urlOf } from './fakeGateway';

const hmac = (key: string, text: string) => hmacSha256(key, text, 'hex');

describe('Mongolian gateway drivers', () => {
  it('SocialPay signs a deeplink invoice, shows it as QR, and checks it with the same signature', async () => {
    const gateway = fakeGateway([
      [
        '/qr/deeplink',
        {
          header: { code: 200 },
          body: { response: { status: 'SUCCESS', desc: 'socialpay://pay/1' } },
        },
      ],
      [
        '/check',
        { header: { code: 200 }, body: { response: { resp_code: '00', amount: '1500' } } },
      ],
    ]);

    const driver = createGateway(
      { kind: 'socialpay', terminal: 'T1', terminalKey: 'k' },
      { fetch: gateway.fetch },
    );

    const created = await driver.createInvoice(invoice);

    expect(gateway.sent('/qr/deeplink')).toEqual({
      amount: '1500',
      invoice: 'inv1',
      terminal: 'T1',
      checksum: hmac('k', 'T1inv11500'),
    });
    expect(created.payment).toMatchObject({
      qrText: 'socialpay://pay/1',
      links: [{ name: 'SocialPay', link: 'socialpay://pay/1' }],
    });
    expect(created.payment.qrImage).toMatch(/^data:image\/png;base64,/);
    expect(await driver.check(created.gatewayInvoiceId, 150_000, {})).toEqual({
      paid: true,
      paidAmount: 150_000,
      paymentId: 'inv1',
    });
  });

  it('MonPay makes a QR purchase and reads code 0 as paid, 23 as waiting', async () => {
    let code = 23;

    const replies: [string, unknown][] = [
      ['/generate', { code: 0, result: { qrcode: 'MONPAYQR', uuid: 'u-1' } }],
    ];

    const gateway = fakeGateway(replies);

    const driver = createGateway(
      { kind: 'monpay', username: 'branch', accountId: 'acc' },
      {
        fetch: (url, init) =>
          urlOf(url).includes('/check?uuid=u-1')
            ? Promise.resolve(new Response(JSON.stringify({ code }), { status: 200 }))
            : gateway.fetch(url, init),
      },
    );

    const created = await driver.createInvoice(invoice);

    expect(gateway.sent('/generate')).toMatchObject({
      amount: 1500,
      callbackUrl: invoice.callbackUrl,
    });
    expect(gateway.calls[0]?.auth).toBe(`Basic ${Buffer.from('branch:acc').toString('base64')}`);
    expect(created).toMatchObject({ gatewayInvoiceId: 'u-1', payment: { qrText: 'MONPAYQR' } });
    expect((await driver.check('u-1', 150_000, {})).paid).toBe(false);
    code = 0;
    expect((await driver.check('u-1', 150_000, {})).paid).toBe(true);
  });

  it('StorePay needs the payer’s phone, lends within their limit, and refunds by cancelling the loan', async () => {
    const gateway = fakeGateway([
      ['/oauth/token', { access_token: 'sp-tok', expires_in: 3600 }],
      ['/user/possibleAmount', { status: 'Success', value: 900_000 }],
      ['/merchant/loan/check/77', { status: 'Success', value: true }],
      ['/merchant/loanChange', { status: 'Success' }],
      ['/merchant/loan', { status: 'Success', value: 77 }],
    ]);

    const driver = createGateway(
      {
        kind: 'storepay',
        storeId: '12',
        username: 'u',
        password: 'p',
        appUsername: 'a',
        appPassword: 'b',
      },
      { fetch: gateway.fetch, cacheKey: 'storepay-test' },
    );

    await expect(driver.createInvoice(invoice)).rejects.toMatchObject({ status: 400 });

    const created = await driver.createInvoice({ ...invoice, payerPhone: '+976 9911 2233' });

    expect(gateway.sent('/merchant/loan')).toMatchObject({
      storeId: 12,
      mobileNumber: 99_112_233,
      amount: 1500,
      requestId: 'inv1',
    });
    expect(created).toMatchObject({ gatewayInvoiceId: '77', payment: { qrText: null } });
    expect(await driver.check('77', 150_000, {})).toMatchObject({ paid: true, paymentId: '77' });

    await driver.refund({ paymentId: '77', amount: 150_000, note: 'Returned' }, {});
    expect(gateway.sent('/merchant/loanChange')).toEqual({
      changeTypeId: 2,
      loanId: 77,
      reason: 'Returned',
    });
  });

  it('Pocket signs in with client credentials and checks the invoice by id', async () => {
    const gateway = fakeGateway([
      ['/openid-connect/token', { access_token: 'pk', expires_in: 600 }],
      ['/generate-invoice', { id: 501, qr: 'POCKETQR', deeplink: 'pocket://pay/501' }],
      ['/invoices/invoice-id', { state: 'paid' }],
    ]);

    const driver = createGateway(
      { kind: 'pocket', terminalId: '9', clientId: 'c', clientSecret: 's' },
      { fetch: gateway.fetch, cacheKey: 'pocket-test' },
    );

    const created = await driver.createInvoice(invoice);

    expect(gateway.sent('/generate-invoice')).toMatchObject({
      terminalId: 9,
      amount: 1500,
      orderNumber: 'inv1',
    });
    expect(created).toMatchObject({ gatewayInvoiceId: '501', payment: { qrText: 'POCKETQR' } });
    expect(await driver.check('501', 150_000, {})).toMatchObject({ paid: true });
    expect(gateway.sent('/invoices/invoice-id')).toEqual({ terminalId: 9, invoiceId: 501 });
  });

  it('Toki checks the payment request by the transaction id it keeps in the invoice state', async () => {
    const gateway = fakeGateway([
      ['/auth/token', { data: { accessToken: 'tk' } }],
      ['/merchant-qr', { code: 200, data: { requestId: 'req-1', transactionId: 'tx-1' } }],
      ['/status?requestId=tx-1', { code: 200, data: { status: 'APPROVED' } }],
    ]);

    const driver = createGateway(
      { kind: 'toki', merchantId: 'm', username: 'u', password: 'p' },
      { fetch: gateway.fetch, cacheKey: 'toki-test' },
    );

    const created = await driver.createInvoice(invoice);

    expect(created).toMatchObject({
      gatewayInvoiceId: 'req-1',
      state: { tokiTransactionId: 'tx-1' },
    });
    expect(await driver.check('req-1', 150_000, created.state ?? {})).toMatchObject({ paid: true });
    expect(gateway.calls.at(-1)?.auth).toBe('Bearer tk');
  });

  it('Golomt opens its card page, which returns the payer through core, and checks by inquiry', async () => {
    const gateway = fakeGateway([
      ['/api/invoice', { invoice: 'G-INV', socialDeeplink: 'socialpay://g' }],
      ['/api/inquiry', { status: 'SENT', amount: '1500' }],
    ]);

    const driver = createGateway(
      { kind: 'golomt', checksumKey: 'ck', token: 'gt' },
      { fetch: gateway.fetch },
    );

    const created = await driver.createInvoice(invoice);

    expect(gateway.sent('/api/invoice')).toMatchObject({
      callback: invoice.returnUrl,
      checksum: hmac('ck', `inv11500GET${invoice.returnUrl}`),
    });
    expect(created.payment.shortUrl).toBe('https://ecommerce.golomtbank.com/payment/mn/G-INV');
    expect(await driver.check('inv1', 150_000, {})).toMatchObject({
      paid: true,
      paidAmount: 150_000,
    });
    expect(gateway.sent('/api/inquiry')).toEqual({
      transactionId: 'inv1',
      checksum: hmac('ck', 'inv1inv1'),
    });
  });

  it('TDB opens its hosted page with the order password and reads the order back with it', async () => {
    const gateway = fakeGateway([
      ['GET /order/31', { order: { status: 'FullyPaid', amount: 1500 } }],
      ['POST /order', { order: { id: 31, password: 'pw', hppUrl: 'https://hpp.tdb.mn/flex' } }],
    ]);

    const driver = createGateway(
      { kind: 'tdb', username: 'u', password: 'p', apiUrl: 'https://tdb.test:8000/' },
      { fetch: gateway.fetch },
    );

    const created = await driver.createInvoice(invoice);

    expect(gateway.sent('/order')).toMatchObject({
      order: { amount: 1500, hppRedirectUrl: invoice.returnUrl },
    });
    expect(created).toMatchObject({
      gatewayInvoiceId: '31',
      state: { tdbPassword: 'pw' },
      payment: { shortUrl: 'https://hpp.tdb.mn/flex?id=31&password=pw' },
    });
    expect(await driver.check('31', 150_000, created.state ?? {})).toMatchObject({ paid: true });
    expect(gateway.calls.at(-1)?.url).toBe('https://tdb.test:8000/order/31?password=pw');
  });

  it('HiPay makes a checkout with QR, reads its array answers, and refunds the payment whole', async () => {
    const gateway = fakeGateway([
      ['POST /checkout/cancel', [{ code: '1', description: 'SUCCESS' }]],
      [
        'POST /checkout',
        [{ code: '1', description: 'SUCCESS', checkoutId: 'HPS1', qrData: 'HIPAYQR' }],
      ],
      [
        '/checkout/get/HPS1?entityId=e1',
        [{ description: 'SUCCESS', status: 'paid', amount: 1500, paymentId: 'pay-1' }],
      ],
      ['/payment/cancel', [{ description: 'SUCCESS', correction_paymentId: 'corr-1' }]],
    ]);

    const driver = createGateway(
      { kind: 'hipay', entityId: 'e1', clientSecret: 'hs', apiUrl: 'https://hipay.test/v2' },
      { fetch: gateway.fetch },
    );

    const created = await driver.createInvoice(invoice);

    expect(gateway.sent('/checkout')).toMatchObject({
      entityId: 'e1',
      amount: 1500,
      redirect_uri: invoice.returnUrl,
      webhook_url: invoice.callbackUrl,
    });
    expect(gateway.calls[0]?.auth).toBe('Bearer hs');
    expect(created).toMatchObject({ gatewayInvoiceId: 'HPS1', payment: { qrText: 'HIPAYQR' } });
    expect(await driver.check('HPS1', 150_000, {})).toEqual({
      paid: true,
      paidAmount: 150_000,
      paymentId: 'pay-1',
    });
    expect(await driver.refund({ paymentId: 'pay-1', amount: 150_000, note: '' }, {})).toEqual({
      refundId: 'corr-1',
    });
    await driver.cancel('HPS1', 150_000, {});
    expect(gateway.sent('/checkout/cancel')).toEqual({ checkoutId: 'HPS1' });
  });
});
