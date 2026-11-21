type PaymentLink = {
  name: string;
  logo: string | null;
  link: string;
};

/** What the payer needs: QR (text and PNG data URL), a short link, bank app links. */
type PayerInstructions = {
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
  /** ISO 4217; core only sends currencies the gateway takes (its definition's `payments.currencies`). */
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
  /** What the gateway needs later (`check`, `refund`); kept with the invoice, never shown. */
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

export interface GatewayInvoice {
  gatewayInvoiceId: string;
  amount: number;
  state: Record<string, unknown>;
}

export interface RefundInput {
  paymentId: string;
  amount: number;
  note: string;
  callbackUrl?: string;
  state: Record<string, unknown>;
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

export interface ClientOptions {
  /** Caches the gateway's access token under this key (the connection id). */
  cacheKey?: string;
  fetch?: typeof globalThis.fetch;
}
