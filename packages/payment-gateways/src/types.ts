/** QPay v2 merchant credentials (merchant.qpay.mn). */
export interface QPayConfig {
  kind: 'qpay';
  clientId: string;
  clientSecret: string;
  invoiceCode: string;
  /** merchant-sandbox.qpay.mn instead of merchant.qpay.mn */
  sandbox: boolean;
}

/** Development and tests: nothing leaves the server. */
export interface TestConfig {
  kind: 'test';
}

export type GatewayConfig = QPayConfig | TestConfig;

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
  /** Where the gateway tells us something happened (never trusted alone). */
  callbackUrl: string;
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
  /** What refunds the gateway can make itself: any amount, only the whole payment, or none. */
  readonly refunds: 'partial' | 'full' | 'none';
  /** Checks the credentials (on connecting). */
  verify(): Promise<void>;
  createInvoice(
    input: CreateInvoiceInput,
  ): Promise<{ gatewayInvoiceId: string; payment: PayerInstructions }>;
  /** Asked of the gateway itself: callbacks are never trusted alone. `state` is the invoice's stored `payment`. */
  check(
    gatewayInvoiceId: string,
    amount: number,
    state: Record<string, unknown>,
  ): Promise<PaymentCheck>;
  cancel(gatewayInvoiceId: string): Promise<void>;
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
