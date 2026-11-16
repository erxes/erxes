import type { GATEWAY_REFUND_KINDS } from '@erxes/core-db/enums';
import { PAYMENT_GATEWAY_KINDS } from '@erxes/core-db/enums';
import { z } from 'zod';

export const PaymentGatewayKind = z.enum(PAYMENT_GATEWAY_KINDS);

export type PaymentGatewayKind = z.infer<typeof PaymentGatewayKind>;

type GatewayRefunds = (typeof GATEWAY_REFUND_KINDS)[number];

/** A gateway for Mongolian merchants: tögrög only. */
const mongolian = (refunds: GatewayRefunds) => ({
  currencies: ['MNT'],
  countries: ['MN'],
  refunds,
});

/**
 * The gateways core can connect, and where each works: the currencies it
 * takes and the countries it serves (empty: any), and the refunds it makes
 * itself (any part, only the whole payment, or none). The drivers are in
 * `@erxes/payment-gateways`.
 */
export const PAYMENT_GATEWAYS = {
  qpay: mongolian('full'),
  socialpay: mongolian('none'),
  monpay: mongolian('none'),
  storepay: mongolian('full'),
  pocket: mongolian('none'),
  toki: mongolian('none'),
  golomt: mongolian('none'),
  tdb: mongolian('none'),
  hipay: mongolian('full'),
  stripe: { currencies: [], countries: [], refunds: 'partial' },
  // developer.paypal.com/api/rest/reference/currency-codes
  paypal: {
    currencies: [
      'AUD',
      'BRL',
      'CAD',
      'CHF',
      'CNY',
      'CZK',
      'DKK',
      'EUR',
      'GBP',
      'HKD',
      'HUF',
      'ILS',
      'JPY',
      'MXN',
      'MYR',
      'NOK',
      'NZD',
      'PHP',
      'PLN',
      'SEK',
      'SGD',
      'THB',
      'TWD',
      'USD',
    ],
    countries: [],
    refunds: 'partial',
  },
  // Cross-border pricing currencies (pay.weixin.qq.com/doc/global)
  wechatpay: {
    currencies: [
      'AUD',
      'CAD',
      'CHF',
      'DKK',
      'EUR',
      'GBP',
      'HKD',
      'JPY',
      'KRW',
      'MOP',
      'MYR',
      'NOK',
      'NZD',
      'SEK',
      'SGD',
      'THB',
      'USD',
    ],
    countries: [],
    refunds: 'partial',
  },
  test: { currencies: [], countries: [], refunds: 'partial' },
} as const satisfies Record<
  PaymentGatewayKind,
  { currencies: readonly string[]; countries: readonly string[]; refunds: GatewayRefunds }
>;

/** Does this kind of gateway take this currency? */
export const gatewayTakes = (kind: PaymentGatewayKind, currency: string) => {
  const { currencies } = PAYMENT_GATEWAYS[kind];

  return currencies.length === 0 || currencies.some((code) => code === currency);
};

/** Where a gateway is listed: the country it serves (ISO 3166 code), or `global`. */
export const gatewayRegion = (kind: PaymentGatewayKind): string =>
  PAYMENT_GATEWAYS[kind].countries.at(0) ?? 'global';

const field = () => z.string().trim().min(1).max(200);
const secret = () => z.string().trim().min(1).max(2000);
const digits = () => z.string().trim().regex(/^\d+$/, 'a number');

const apiUrl = () =>
  z
    .url({ protocol: /^https$/ })
    .trim()
    .max(300);

/**
 * What each gateway needs. The fields in `GATEWAY_SECRETS` are write-only:
 * never returned; the rest show in Settings › Payments.
 */
export const GatewayConfig = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('qpay'),
    clientId: field(),
    clientSecret: secret(),
    invoiceCode: field(),
    /** merchant-sandbox.qpay.mn instead of merchant.qpay.mn */
    sandbox: z.boolean().default(false),
  }),
  z.object({ kind: z.literal('socialpay'), terminal: field(), terminalKey: secret() }),
  z.object({ kind: z.literal('monpay'), username: field(), accountId: secret() }),
  z.object({
    kind: z.literal('storepay'),
    storeId: digits(),
    username: field(),
    password: secret(),
    appUsername: field(),
    appPassword: secret(),
  }),
  z.object({
    kind: z.literal('pocket'),
    terminalId: digits(),
    clientId: field(),
    clientSecret: secret(),
  }),
  z.object({ kind: z.literal('toki'), merchantId: field(), username: field(), password: secret() }),
  z.object({ kind: z.literal('golomt'), checksumKey: secret(), token: secret() }),
  z.object({
    kind: z.literal('tdb'),
    username: field(),
    password: secret(),
    apiUrl: apiUrl().default('https://www.bankcard.mn:8000'),
  }),
  /** HiPay gives the API address with the merchant account. */
  z.object({
    kind: z.literal('hipay'),
    entityId: field(),
    clientSecret: secret(),
    apiUrl: apiUrl(),
  }),
  z.object({ kind: z.literal('stripe'), secretKey: secret() }),
  z.object({
    kind: z.literal('paypal'),
    clientId: field(),
    clientSecret: secret(),
    /** api-m.sandbox.paypal.com instead of api-m.paypal.com */
    sandbox: z.boolean().default(false),
  }),
  z.object({
    kind: z.literal('wechatpay'),
    appId: field(),
    mchId: digits(),
    serialNo: field(),
    privateKey: z.string().trim().min(1).max(5000).includes('PRIVATE KEY'),
    merchantCategoryCode: z
      .string()
      .trim()
      .regex(/^\d{4}$/, 'a 4-digit code'),
  }),
  /** Development and tests: invoices are paid by calling the test endpoint. */
  z.object({ kind: z.literal('test') }),
]);

export type GatewayConfig = z.infer<typeof GatewayConfig>;

/** Gateway settings that are credentials: stored sealed, never returned, typed as passwords. */
export const GATEWAY_SECRETS: ReadonlySet<string> = new Set([
  'clientSecret',
  'terminalKey',
  'checksumKey',
  'accountId',
  'password',
  'appPassword',
  'token',
  'secretKey',
  'privateKey',
]);

/** The settings a gateway may show: its config without the kind and the credentials. */
export const visibleGatewaySettings = (config: GatewayConfig) =>
  Object.fromEntries(
    Object.entries(config).filter(([key]) => key !== 'kind' && !GATEWAY_SECRETS.has(key)),
  );

/**
 * The settings a kind of gateway takes, in order, for its form: a switch
 * (`sandbox`), a credential (a password input) or text; `optional` when the
 * gateway has a default for it.
 */
export const gatewayFields = (kind: GatewayConfig['kind']) => {
  const option = GatewayConfig.options.find((item) => item.shape.kind.value === kind);

  return Object.entries<z.ZodType>(option?.shape ?? {}).flatMap(([key, schema]) =>
    key === 'kind'
      ? []
      : [
          {
            key,
            type:
              key === 'sandbox'
                ? ('switch' as const)
                : GATEWAY_SECRETS.has(key)
                  ? ('secret' as const)
                  : ('text' as const),
            optional: schema.safeParse(undefined).success,
          },
        ],
  );
};
