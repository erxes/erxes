import { z } from 'zod';

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
