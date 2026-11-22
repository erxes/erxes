import type { BankConfig } from '../banks/types';

type PaymentLink = {
  name: string;
  logo: string | null;
  link: string;
};

/**
 * What a page open inside the payer's app passes to the app's own pay call
 * (Toki's mini program: `buy()`).
 */
type InAppPayment = {
  app: string;
  data: Record<string, string | number>;
};

/** Where the payer transfers the money, and the reference that matches it to the invoice. */
type BankTransfer = {
  bank: string;
  accountNumber: string;
  iban: string | null;
  accountName: string | null;
  /** In the currency's smallest unit, like the invoice. */
  amount: number;
  /** What the payer writes as the transfer's description. */
  reference: string;
};

/**
 * What the payer needs: QR (text and PNG data URL), a short link, bank app
 * links; a pay call inside the payer's app, or the account to transfer to.
 */
type PayerInstructions = {
  qrText: string | null;
  qrImage: string | null;
  shortUrl: string | null;
  links: PaymentLink[];
  inApp?: InAppPayment;
  bankTransfer?: BankTransfer;
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
  /**
   * Every payment that could be this invoice's, oldest first, when the gateway
   * can't tell (several matching transfers on a bank statement): core settles
   * it with the first no other invoice was settled with, instead of `paymentId`.
   */
  paymentIds?: string[];
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
  /** The platform's QPay QuickQR vendor account (QUICK_QR_*), unset where it has none. */
  quickQr?: { url: string; username: string; password: string };
  /** The bank connection a transfer gateway reads its statement through (its `connectionId`). */
  bank?: BankConfig;
}
