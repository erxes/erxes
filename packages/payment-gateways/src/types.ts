/** QPay v2 merchant credentials (merchant.qpay.mn). */
export interface QPayConfig {
  kind: 'qpay';
  clientId: string;
  clientSecret: string;
  invoiceCode: string;
  /** merchant-sandbox.qpay.mn instead of merchant.qpay.mn */
  sandbox: boolean;
}

/** SocialPay in-store invoices (Golomt Bank, instore.golomtbank.com). */
export interface SocialPayConfig {
  kind: 'socialpay';
  terminal: string;
  terminalKey: string;
}

/** MonPay branch QR purchases (wallet.monpay.mn). */
export interface MonPayConfig {
  kind: 'monpay';
  username: string;
  accountId: string;
}

/** StorePay buy-now-pay-later loans (service.storepay.mn); the payer confirms in the app. */
export interface StorePayConfig {
  kind: 'storepay';
  appUsername: string;
  appPassword: string;
  username: string;
  password: string;
  storeId: string;
}

/** Pocket (InvesCore) invoices (service.invescore.mn). */
export interface PocketConfig {
  kind: 'pocket';
  clientId: string;
  clientSecret: string;
  terminalId: string;
}

/** Toki merchant QR payment requests (ms-api.toki.mn). */
export interface TokiConfig {
  kind: 'toki';
  merchantId: string;
  username: string;
  password: string;
}

/** Golomt Bank card e-commerce (ecommerce.golomtbank.com). */
export interface GolomtConfig {
  kind: 'golomt';
  checksumKey: string;
  token: string;
}

/** TDB (Trade and Development Bank) card e-commerce: a hosted payment page. */
export interface TdbConfig {
  kind: 'tdb';
  username: string;
  password: string;
  /** The bank's API address for this merchant (https://www.bankcard.mn:8000 by default). */
  apiUrl: string;
}

/** HiPay checkouts (developers.hipay.mn); the API address comes with the merchant account. */
export interface HiPayConfig {
  kind: 'hipay';
  entityId: string;
  clientSecret: string;
  apiUrl: string;
}

/** Stripe Checkout (cards and wallets, any currency Stripe takes). */
export interface StripeConfig {
  kind: 'stripe';
  secretKey: string;
}

/** PayPal Checkout orders (v2). */
export interface PayPalConfig {
  kind: 'paypal';
  clientId: string;
  clientSecret: string;
  /** api-m.sandbox.paypal.com instead of api-m.paypal.com */
  sandbox: boolean;
}

/** WeChat Pay cross-border (APIv3, direct merchant): Native QR orders. */
export interface WeChatPayConfig {
  kind: 'wechatpay';
  appId: string;
  mchId: string;
  /** The serial number of the merchant's API certificate. */
  serialNo: string;
  /** The merchant's API private key (PKCS#8 PEM, apiclient_key.pem). */
  privateKey: string;
  /** The merchant's 4-digit category code (MCC). */
  merchantCategoryCode: string;
}

/** Development and tests: nothing leaves the server. */
export interface TestConfig {
  kind: 'test';
}

export type GatewayConfig =
  | QPayConfig
  | SocialPayConfig
  | MonPayConfig
  | StorePayConfig
  | PocketConfig
  | TokiConfig
  | GolomtConfig
  | TdbConfig
  | HiPayConfig
  | StripeConfig
  | PayPalConfig
  | WeChatPayConfig
  | TestConfig;

export type GatewayKind = GatewayConfig['kind'];

export type PaymentLink = {
  name: string;
  logo: string | null;
  link: string;
};

/** What the payer needs: QR (text and PNG data URL), a short link, bank app links. */
export type PayerInstructions = {
  qrText: string | null;
  qrImage: string | null;
  shortUrl: string | null;
  links: PaymentLink[];
};

export interface CreateInvoiceInput {
  /** Our invoice id (sent as the merchant's reference). */
  invoiceId: string;
  /** In the currency's smallest unit (₮1,500 → 150000, $12.50 → 1250). */
  amount: number;
  /** ISO 4217; core only sends currencies the gateway takes (`PAYMENT_GATEWAYS` in the contract). */
  currency: string;
  description: string;
  /** Where the gateway's server tells us something happened (never trusted alone). */
  callbackUrl: string;
  /** Where a card page sends the payer when done: core checks, then sends them on. */
  returnUrl: string;
  /** The payer's phone: StorePay bills it; SocialPay sends the invoice to it. */
  payerPhone?: string;
  /** Prefilled on card pages (Stripe, PayPal). */
  payerEmail?: string;
}

export interface CreatedInvoice {
  gatewayInvoiceId: string;
  payment: PayerInstructions;
  /** What the driver needs later (`check`, `refund`); kept with the invoice, never shown. */
  state?: Record<string, unknown>;
}

export interface PaymentCheck {
  /** Paid at least the invoice amount. */
  paid: boolean;
  /** What the gateway says was paid, in the smallest unit. */
  paidAmount: number;
  /** The gateway's payment id (needed to refund it), when paid. */
  paymentId: string | null;
}

export interface RefundInput {
  paymentId: string;
  /** In the smallest unit; drivers with `refunds: 'full'` only accept the paid amount. */
  amount: number;
  note: string;
  callbackUrl?: string;
}

/** What any payment gateway does for core. */
export interface GatewayDriver {
  readonly kind: GatewayKind;
  /** Checks the credentials (on connecting). */
  verify(): Promise<void>;
  createInvoice(input: CreateInvoiceInput): Promise<CreatedInvoice>;
  /** Asked of the gateway itself: callbacks are never trusted alone. `state` is the invoice's stored `payment`. */
  check(
    gatewayInvoiceId: string,
    amount: number,
    state: Record<string, unknown>,
  ): Promise<PaymentCheck>;
  cancel(gatewayInvoiceId: string, amount: number, state: Record<string, unknown>): Promise<void>;
  refund(input: RefundInput, state: Record<string, unknown>): Promise<{ refundId: string | null }>;
}

export class GatewayError extends Error {
  constructor(
    message: string,
    readonly status: number | null = null,
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

export interface DriverOptions {
  /** Caches the gateway's access token under this key (the connection id). */
  cacheKey?: string;
  fetch?: typeof globalThis.fetch;
}
