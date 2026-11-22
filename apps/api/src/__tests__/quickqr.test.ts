import { quickqr, quickQrDistricts } from '~/modules/integrations/gateways/quickqr';
import { gatewayOf, openGateway } from '~/modules/integrations/registry';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { config } from '~/config';
import { useTestDatabase } from './db';
import { fakeGateway, tugrugInvoice as invoice, urlOf } from './fakeGateway';
import { useTwoOrgs } from './support';

const vendor = { url: 'https://quickqr.test', username: 'vendor', password: 'vendor-pass' };

const merchant = {
  merchantType: 'company' as const,
  registerNumber: '5555555',
  businessName: 'Acme LLC',
  mccCode: '5411',
  city: '11000',
  district: '11010',
  address: 'Peace avenue 1',
  phone: '99112233',
  email: 'shop@acme.mn',
  bankCode: '050000',
  bankAccount: '5005123456',
  bankAccountName: 'Acme LLC',
  iban: '75000500',
};

const replies: [string, unknown][] = [
  ['/v2/auth/token', { access_token: 'vt', expires_in: 3600 }],
  ['POST /v2/merchant/company', { id: 'M-1' }],
  ['PUT /v2/merchant/', { id: 'M-1' }],
  ['/v2/merchant/list', { rows: [{ id: 'M-9', type: 'PERSON', register_number: '5555555' }] }],
  ['/v2/invoice', { id: 'QI-1', qr_image: 'iVBORw0KGgo=', qr_code: '000201QR' }],
  ['/v2/payment/check', { invoice_status: 'PAID' }],
  ['/v2/sumduureg/11000', [{ code: '11010', name: 'Баянзүрх' }]],
];

/** QuickQR answering that the register number is already a merchant, once. */
const alreadyRegistered = (gateway: ReturnType<typeof fakeGateway>) => {
  let answered = false;

  return (input: string | URL | Request, init: RequestInit = {}) => {
    if (!answered && init.method === 'POST' && urlOf(input).endsWith('/merchant/company')) {
      answered = true;

      return Promise.resolve(
        new Response(JSON.stringify({ error: 'MERCHANT_ALREADY_REGISTERED' }), { status: 400 }),
      );
    }

    return gateway.fetch(input, init);
  };
};

describe('QPay QuickQR driver', () => {
  it('signs the merchant up under the vendor account and makes QR invoices for it', async () => {
    const gateway = fakeGateway(replies);
    const options = { fetch: gateway.fetch, quickQr: vendor, cacheKey: 'quickqr-test' };

    const clientFor = (keys: typeof merchant & { merchantId?: string }) =>
      quickqr.client(quickqr.keys.parse(keys), options);

    await quickqr.verify(clientFor(merchant));
    expect(await quickqr.register?.(clientFor(merchant))).toEqual({
      merchantId: 'M-1',
    });
    expect(gateway.sent('/merchant/company')).toMatchObject({
      company_name: 'Acme LLC',
      name: 'Acme LLC',
      register_number: '5555555',
      mcc_code: '5411',
    });

    const { payments, client } = openGateway(
      'quickqr',
      { ...merchant, merchantId: 'M-1' },
      options,
    );

    const created = await payments.createInvoice(client, invoice);

    expect(gateway.sent('/invoice')).toMatchObject({
      merchant_id: 'M-1',
      amount: 1500,
      callback_url: invoice.callbackUrl,
      bank_accounts: [
        { account_bank_code: '050000', account_number: '5005123456', iban_number: '75000500' },
      ],
    });
    expect(created).toMatchObject({
      gatewayInvoiceId: 'QI-1',
      payment: { qrText: '000201QR', qrImage: 'data:image/png;base64,iVBORw0KGgo=' },
    });
    expect(
      await payments.check(client, { gatewayInvoiceId: 'QI-1', amount: 150_000, state: {} }),
    ).toEqual({
      paid: true,
      paidAmount: 150_000,
      paymentId: 'QI-1',
    });
    expect(gateway.calls.at(-1)?.auth).toBe('Bearer vt');

    // Changing a registered merchant updates it.
    expect(await quickqr.register?.(clientFor({ ...merchant, merchantId: 'M-1' }))).toEqual({
      merchantId: 'M-1',
    });
    expect(gateway.calls.at(-1)).toMatchObject({ method: 'PUT' });
    expect(gateway.calls.at(-1)?.url).toContain('/merchant/company/M-1');
  });

  it('updates the merchant QuickQR already has for the register number', async () => {
    const gateway = fakeGateway(replies);

    const options = {
      fetch: alreadyRegistered(gateway),
      quickQr: vendor,
      cacheKey: 'quickqr-again',
    };

    expect(await quickqr.register?.(quickqr.client(quickqr.keys.parse(merchant), options))).toEqual(
      { merchantId: 'M-1' },
    );
    // Registered as a person before: updated where it is.
    expect(gateway.calls.at(-1)?.url).toContain('/merchant/person/M-9');
  });

  it('asks a company for its name and a person for theirs, as 3.x did', () => {
    const { businessName: _, ...nameless } = merchant;

    expect(quickqr.keys.safeParse(nameless).success).toBe(false);
    expect(quickqr.keys.safeParse({ ...nameless, merchantType: 'person' }).success).toBe(false);
    expect(
      quickqr.keys.safeParse({
        ...nameless,
        merchantType: 'person',
        firstName: 'Bat',
        lastName: 'Dorj',
      }).success,
    ).toBe(true);
  });

  it('needs the server’s vendor account, and a registered merchant to invoice', async () => {
    await expect(
      gatewayOf('quickqr').verify(openGateway('quickqr', { ...merchant }).client),
    ).rejects.toThrow(/QUICK_QR_USERNAME/);

    const gateway = fakeGateway(replies);

    const unregistered = openGateway(
      'quickqr',
      { ...merchant },
      { fetch: gateway.fetch, quickQr: vendor },
    );

    await expect(unregistered.payments.createInvoice(unregistered.client, invoice)).rejects.toThrow(
      /not registered/,
    );
    expect(await quickQrDistricts('11000', { fetch: gateway.fetch, quickQr: vendor })).toEqual([
      { code: '11010', name: 'Баянзүрх' },
    ]);
  });
});

describe('QPay QuickQR through core', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const gateway = fakeGateway(replies);
  const before = config.quickQr;

  beforeAll(() => {
    const realFetch = globalThis.fetch;

    config.quickQr = vendor;
    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) =>
      urlOf(input).startsWith(vendor.url) ? gateway.fetch(input, init) : realFetch(input, init),
    );
  });

  afterAll(() => {
    config.quickQr = before;
    vi.unstubAllGlobals();
  });

  it('registers the merchant on connecting, keeps its id through changes, and invoices', async () => {
    const added = await t.owner().integrations.connect({
      name: 'QuickQR',
      key: 'quickqr',
      keys: { ...merchant },
    });

    expect(added.settings).toMatchObject({ merchantId: 'M-1', registerNumber: '5555555' });

    // A change (the form never sends the merchant id) updates the same merchant.
    const changed = await t.owner().integrations.update({
      id: added.id,
      key: 'quickqr',
      keys: { ...merchant, address: 'Peace avenue 2' },
    });

    expect(changed.settings).toMatchObject({ merchantId: 'M-1', address: 'Peace avenue 2' });
    expect(gateway.calls.at(-1)?.url).toContain('/merchant/company/M-1');

    const forged = await t.owner().integrations.update({
      id: added.id,
      key: 'quickqr',
      keys: { merchantId: 'M-999', address: 'Peace avenue 3' },
    });

    expect(forged.settings).toMatchObject({ merchantId: 'M-1', address: 'Peace avenue 3' });
    expect(gateway.calls.at(-1)?.url).toContain('/merchant/company/M-1');

    expect(await t.owner().payments.quickQrDistricts({ city: '11000' })).toEqual({
      data: [{ code: '11010', name: 'Баянзүрх' }],
    });

    const created = await t.hr().payments.createInvoice({
      gatewayId: added.id,
      amount: 150_000,
      currency: 'MNT',
      description: 'Order #1',
      referenceType: 'order',
      referenceId: 'q1',
    });

    expect(created.payment.qrText).toBe('000201QR');
    expect((await t.hr().payments.getInvoice({ id: created.id })).status).toBe('paid');
  });
});
