import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import type { GatewayInvoice } from '@erxes/plugin-sdk/integrations';
import { gatewayOf, openGateway } from '~/modules/integrations/registry';
import { fakeGateway, refusal } from './fakeGateway';

const basicAuth = (user: string, password: string) =>
  `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;

const FORM = 'application/x-www-form-urlencoded';

interface TokenGateway {
  key: string;
  name: string;
  keys: Record<string, unknown>;
  tokenPath: string;
  token: (value: string) => unknown;
  /** The sign-in request, as the gateway's API asks for it. */
  signIn: { method: string; url: string; auth: string | null; type: string | null; body: string };
  routes: [string, unknown][];
  invoice: GatewayInvoice;
}

const QPAY: TokenGateway = {
  key: 'qpay',
  name: 'QPay',
  keys: { clientId: 'id', clientSecret: 'secret', invoiceCode: 'CODE' },
  tokenPath: '/auth/token',
  token: (value) => ({ access_token: value }),
  signIn: {
    method: 'POST',
    url: 'https://merchant.qpay.mn/v2/auth/token',
    auth: basicAuth('id', 'secret'),
    type: null,
    body: '',
  },
  routes: [['POST /payment/check', { rows: [] }]],
  invoice: { gatewayInvoiceId: 'q-1', amount: 150_000, state: {} },
};

const PAYPAL: TokenGateway = {
  key: 'paypal',
  name: 'PayPal',
  keys: { clientId: 'c', clientSecret: 's' },
  tokenPath: '/v1/oauth2/token',
  token: (value) => ({ access_token: value }),
  signIn: {
    method: 'POST',
    url: 'https://api-m.paypal.com/v1/oauth2/token',
    auth: basicAuth('c', 's'),
    type: FORM,
    body: 'grant_type=client_credentials',
  },
  routes: [['GET /v2/checkout/orders/O-1', { id: 'O-1', status: 'CREATED' }]],
  invoice: { gatewayInvoiceId: 'O-1', amount: 1500, state: {} },
};

const GATEWAYS: TokenGateway[] = [
  QPAY,
  PAYPAL,
  {
    key: 'storepay',
    name: 'StorePay',
    keys: { storeId: '12', username: 'u', password: 'p', appUsername: 'a', appPassword: 'b' },
    tokenPath: '/merchant-uaa/oauth/token',
    token: (value) => ({ access_token: value }),
    signIn: {
      method: 'POST',
      url: 'https://service.storepay.mn/merchant-uaa/oauth/token?grant_type=password&username=u&password=p',
      auth: basicAuth('a', 'b'),
      type: 'application/json',
      body: '{"username":"u","password":"p"}',
    },
    routes: [['GET /lend-merchant/merchant/loan/check/77', { status: 'Success', value: false }]],
    invoice: { gatewayInvoiceId: '77', amount: 150_000, state: {} },
  },
  {
    key: 'pocket',
    name: 'Pocket',
    keys: { terminalId: '9', clientId: 'c', clientSecret: 's' },
    tokenPath: '/openid-connect/token',
    token: (value) => ({ access_token: value }),
    signIn: {
      method: 'POST',
      url: 'https://sso.invescore.mn/auth/realms/invescore/protocol/openid-connect/token',
      auth: null,
      type: FORM,
      body: 'client_id=c&client_secret=s&grant_type=client_credentials',
    },
    routes: [['POST /invoices/invoice-id', { state: 'pending' }]],
    invoice: { gatewayInvoiceId: '501', amount: 150_000, state: {} },
  },
  {
    key: 'toki',
    name: 'Toki',
    keys: { merchantId: 'm', username: 'u', password: 'p' },
    tokenPath: '/auth/token',
    token: (value) => ({ data: { accessToken: value } }),
    signIn: {
      method: 'GET',
      url: 'https://ms-api.toki.mn/third-party-service/v1/auth/token',
      auth: basicAuth('u', 'p'),
      type: null,
      body: '',
    },
    routes: [['GET /payment-request/status?requestId=r-1', { code: 200, data: { status: 'NEW' } }]],
    invoice: { gatewayInvoiceId: 'r-1', amount: 150_000, state: { tokiRequestId: 'r-1' } },
  },
];

let connections = 0;

/** A new connection to the gateway, whose sign-in answers `token`. */
const connect = (
  gateway: TokenGateway,
  token: unknown,
  cacheKey = `${gateway.key}-${++connections}`,
) => {
  const fake = fakeGateway([[gateway.tokenPath, token], ...gateway.routes]);
  const opened = openGateway(gateway.key, gateway.keys, { fetch: fake.fetch, cacheKey });
  const signIns = () => fake.calls.filter((call) => call.url.includes(gateway.tokenPath)).length;
  const check = () => opened.payments.check(opened.client, gateway.invoice);
  const verify = () => gatewayOf(gateway.key).verify(opened.client);

  return { fake, signIns, check, verify };
};

describe.each(GATEWAYS)('$name access token', (gateway) => {
  it('signs in as its API asks and sends the token as the bearer', async () => {
    const { fake, check } = connect(gateway, gateway.token('T1'));

    await check();

    const [signIn, request] = fake.calls;

    expect({
      method: signIn?.method,
      url: signIn?.url,
      auth: signIn?.auth,
      type: signIn?.headers.get('content-type'),
      body: signIn?.body,
    }).toEqual(gateway.signIn);
    expect(request?.auth).toBe('Bearer T1');
    expect(fake.calls.map((call) => [call.headers.get('accept'), call.redirect])).toEqual([
      ['application/json', 'error'],
      ['application/json', 'error'],
    ]);
  });

  it('reuses the token, keeps one per connection, and verifies with a fresh one', async () => {
    const first = connect(gateway, gateway.token('A'), `${gateway.key}-shared`);

    await first.check();
    await first.check();
    expect(first.signIns()).toBe(1);

    const other = connect(gateway, gateway.token('B'));

    await other.check();
    expect(other.fake.calls.at(-1)?.auth).toBe('Bearer B');

    const again = connect(gateway, gateway.token('C'), `${gateway.key}-shared`);

    await again.check();
    expect(again.signIns()).toBe(0);
    expect(again.fake.calls.at(-1)?.auth).toBe('Bearer A');

    await again.verify();
    expect(again.signIns()).toBe(1);
    await again.check();
    expect(again.fake.calls.at(-1)?.auth).toBe('Bearer C');
  });

  it('fails with a GatewayError when the sign-in gives no token', async () => {
    expect((await refusal(connect(gateway, gateway.token('')).check())).message).toBe(
      `${gateway.name} gave no access token`,
    );
  });

  it('answers a refused sign-in as a GatewayError with the status', async () => {
    const fake = fakeGateway([[gateway.tokenPath, { error: 'invalid_client' }, 401]]);

    const { client } = openGateway(gateway.key, gateway.keys, {
      fetch: fake.fetch,
      cacheKey: `${gateway.key}-refused`,
    });

    const { status, message } = await refusal(gatewayOf(gateway.key).verify(client));

    expect(status).toBe(401);
    expect(message).toMatch(new RegExp(`^${gateway.name} /\\S*token answered 401`));
  });
});

const signInsFor = async (gateway: TokenGateway, expiresIn: number | undefined) => {
  const { check, signIns } = connect(gateway, { access_token: 'T', expires_in: expiresIn });

  await check();
  await check();

  return signIns();
};

describe('access token lifetime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps a token its lifetime less a minute, an hour when the gateway gives none', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-22T00:00:00Z'));

    expect(await signInsFor(PAYPAL, undefined)).toBe(1);
    expect(await signInsFor(PAYPAL, 3000)).toBe(1);
    expect(await signInsFor(PAYPAL, 61)).toBe(1);
    expect(await signInsFor(PAYPAL, 60)).toBe(2);
    expect(await signInsFor(PAYPAL, 30)).toBe(2);
  });

  it('reads QPay’s expiry as a unix time and ignores one that is not', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-22T00:00:00Z'));

    const now = Date.now() / 1000;

    expect(await signInsFor(QPAY, now + 3600)).toBe(1);
    expect(await signInsFor(QPAY, now + 30)).toBe(2);
    expect(await signInsFor(QPAY, 30)).toBe(1);
  });
});
