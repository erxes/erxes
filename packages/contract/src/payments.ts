import { GATEWAY_REFUND_KINDS, RECORDED_PAYMENT_METHODS } from '@erxes/core-db/enums';
import { organizations, paymentInvoices, paymentRefunds } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { InvoiceStatus } from './values';
import { CursorQuery, cursorPageOf, Id, isoDate, listOf } from './common';
import { Currency } from './money';
import { DedupeKey } from './platform';
import { TaxBuyer } from './ebarimt';
import { InvoiceLine, InvoiceLineInput } from './invoiceLines';
import { IntegrationConnection } from './integrations';
import { PayerInstructions } from './paymentPayer';

/** The caller's own data on an invoice (order lines, room number): at most 8 KB of JSON, returned in events. */
export const InvoiceMetadata = z
  .record(z.string(), z.unknown())
  .refine((value) => JSON.stringify(value).length <= 8192, 'at most 8 KB of JSON');

/** What an invoice is for, whether it goes to a gateway or records a payment made outside one. */
const InvoiceFields = z.object({
  amount: z.int().min(1).max(1_000_000_000_00),
  currency: Currency.optional(),
  description: z.string().trim().min(1).max(255),
  /** The caller's record it is for: `order` and its id. */
  referenceType: z.string().trim().min(1).max(60),
  referenceId: z.string().trim().min(1).max(100),
  dedupeKey: DedupeKey.optional(),
  metadata: InvoiceMetadata.optional(),
  lines: z.array(InvoiceLineInput).max(100).optional(),
  /** Who the tax receipt is for, where the organisation issues them (eBarimt). */
  taxBuyer: TaxBuyer.optional(),
  /** False: no tax receipt for it, as for an order that needs none. */
  taxReceipt: z.boolean().default(true),
});

const int = () => z.int();

export const Invoice = createSelectSchema(paymentInvoices, {
  id: Id,
  gatewayId: () => Id.nullable(),
  amount: int,
  metadata: z.record(z.string(), z.unknown()),
  lines: z.array(InvoiceLine),
  taxBuyer: () => z.object({ companyNo: z.string().optional(), consumerNo: z.string().optional() }),
  paidAmount: int,
  refundedAmount: int,
  payment: PayerInstructions,
  expiresAt: isoDate,
  paidAt: isoDate,
  createdAt: isoDate,
})
  .pick({
    id: true,
    /** Null when the payment was recorded as taken outside a gateway (`method`). */
    gatewayId: true,
    /** `gateway`, or `cash`, `card` or `transfer` for a payment recorded by hand (`recordPayment`). */
    method: true,
    source: true,
    /** In the currency's smallest unit: $12.50 → 1250, ₮1,500 → 150000, ¥500 → 500 (`currencyDigits`). */
    amount: true,
    /** ISO 4217. */
    currency: true,
    description: true,
    /** The caller's record it is for (`order` and its id). */
    referenceType: true,
    referenceId: true,
    status: true,
    metadata: true,
    lines: true,
    /** Who its tax receipt is for (eBarimt); null: a person. */
    taxBuyer: true,
    /** Whether it gets a tax receipt (eBarimt) once paid. */
    taxReceipt: true,
    /** What the gateway says was paid, and how much of it was given back. */
    paidAmount: true,
    refundedAmount: true,
    /** For the payer: QR (text and PNG data), a short link, bank app links. */
    payment: true,
    expiresAt: true,
    paidAt: true,
    createdAt: true,
  })
  .extend({
    /** The gateway's kind, joined in the query; null without a gateway. */
    gatewayKind: z.string().nullable(),
    /** What can still be refunded, and how the gateway refunds (`full`: only the whole payment). */
    refundable: z.object({ amount: z.int(), gateway: z.enum(GATEWAY_REFUND_KINDS) }),
  });

export type Invoice = z.infer<typeof Invoice>;

export const Refund = createSelectSchema(paymentRefunds, {
  id: Id,
  invoiceId: Id,
  amount: int,
  createdAt: isoDate,
}).pick({
  id: true,
  invoiceId: true,
  amount: true,
  reason: true,
  /** `gateway`: sent through it; `manual`: the organisation paid it back itself and recorded it. */
  method: true,
  status: true,
  error: true,
  /** Who asked: a team member (`requestedBy` = user id), a plugin (its name) or `system`. */
  requestedByType: true,
  requestedBy: true,
  createdAt: true,
});

export type Refund = z.infer<typeof Refund>;

export const PaymentSettings = createSelectSchema(organizations, {
  defaultGatewayId: () => Id.nullable(),
}).pick({ defaultGatewayId: true });

export type PaymentSettings = z.infer<typeof PaymentSettings>;

/** Money back for a paid invoice: all that is left unless `amount`. */
export const RefundRequest = z.object({
  id: Id,
  amount: z.int().min(1).optional(),
  reason: z.string().trim().min(1).max(255),
  manual: z.boolean().default(false),
  dedupeKey: DedupeKey.optional(),
});

export type RefundRequest = z.infer<typeof RefundRequest>;

/** A payment taken outside a gateway, recorded as a paid invoice. */
export const RecordedPayment = InvoiceFields.extend({ method: z.enum(RECORDED_PAYMENT_METHODS) });

export type RecordedPayment = z.infer<typeof RecordedPayment>;

/**
 * Payments: an organisation's gateway connections (QPay, …) and invoices
 * made through them for plugins' records. Paid invoices publish
 * `core.payment.paid` (webhooks, automations, the plugin's own consumer).
 */
const {
  CURRENCY_NOT_SUPPORTED,
  GATEWAY_REFUSED,
  INVALID_PRODUCT,
  INVALID_SUBDOMAIN,
  LIMIT_EXCEEDED,
  LINES_MISMATCH,
  NOTHING_TO_RETRY,
  NOT_PENDING,
  NOT_REFUNDABLE,
  NOT_TEST,
  NO_GATEWAY,
  PARTIAL_NOT_SUPPORTED,
  SUBJECT_REQUIRED,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  CURRENCY_NOT_SUPPORTED,
  GATEWAY_REFUSED,
  INVALID_PRODUCT,
  INVALID_SUBDOMAIN,
  LIMIT_EXCEEDED,
  LINES_MISMATCH,
  NOTHING_TO_RETRY,
  NOT_PENDING,
  NOT_REFUNDABLE,
  NOT_TEST,
  NO_GATEWAY,
  PARTIAL_NOT_SUPPORTED,
  SUBJECT_REQUIRED,
});

/**
 * A connected gateway with its service: `integrationName` is what payers know it as (`QPay`),
 * `pays` how they pay (`bank-qr`, `card`, `installments`), next to the connection's own `name`.
 */
export const PaymentGateway = IntegrationConnection.extend({
  integrationName: z.string(),
  pays: z.string(),
});

export type PaymentGateway = z.infer<typeof PaymentGateway>;

export const paymentsContract = {
  gateways: base
    .route({
      method: 'GET',
      path: '/payments/gateways',
      summary: 'List payment gateways',
      description:
        'The payment gateways connected on Settings › Integrations (plugins: payments:read), so a plugin can pick one as `gatewayId`',
    })
    .output(listOf(PaymentGateway)),
  createInvoice: base
    .route({
      method: 'POST',
      path: '/payments/invoices',
      successStatus: 201,
      summary: 'Create an invoice',
      description:
        "An invoice at a gateway for a record (plugins: payments:write), in the organisation's currency unless `currency` says otherwise; without `gatewayId`, the organisation's default gateway, else the oldest active one that takes the currency. 400 CURRENCY_NOT_SUPPORTED when the gateway doesn't take it. With `lines`, their amounts add up to `amount`: 400 LINES_MISMATCH, INVALID_PRODUCT",
    })
    .input(
      InvoiceFields.extend({
        gatewayId: Id.optional(),
        /** Minutes the invoice can be paid in (default 30). */
        expiresInMinutes: z
          .int()
          .min(1)
          .max(60 * 24 * 7)
          .default(30),
        /** The payer's phone: StorePay bills it (required there); SocialPay sends the invoice to it. */
        payerPhone: z.string().trim().min(6).max(20).optional(),
        /** The payer's email, prefilled on card pages (Stripe, PayPal). */
        payerEmail: z.email().max(200).optional(),
        /** Where card pages (Golomt, TDB, HiPay, Stripe, PayPal) send the payer once done. */
        returnUrl: z
          .url({ protocol: /^https?$/ })
          .max(1000)
          .optional(),
      }),
    )
    .output(Invoice),
  recordPayment: base
    .route({
      method: 'POST',
      path: '/payments/invoices/recorded',
      successStatus: 201,
      summary: 'Record an outside payment',
      description:
        'Record a payment taken outside a gateway (cash, a card terminal, a bank transfer) as a paid invoice (plugins: payments:write). It publishes core.payment.paid, so eBarimt issues its receipt; refunds are recorded by hand. 400 LINES_MISMATCH, INVALID_PRODUCT',
    })
    .input(RecordedPayment)
    .output(Invoice),
  getInvoice: base
    .route({
      method: 'GET',
      path: '/payments/invoices/{id}',
      summary: 'Get an invoice',
      description: 'An invoice; a pending one is checked with the gateway',
    })
    .input(z.object({ id: Id }))
    .output(Invoice),
  cancelInvoice: base
    .route({ method: 'POST', path: '/payments/invoices/{id}/cancel', summary: 'Cancel an invoice' })
    .input(z.object({ id: Id }))
    .output(Invoice),
  refund: base
    .route({
      method: 'POST',
      path: '/payments/invoices/{id}/refunds',
      successStatus: 201,
      summary: 'Refund an invoice',
      description:
        'Give money back for a paid invoice (all that is left unless `amount`). Through the gateway, or `manual` to record a refund made outside erxes. A refused refund is kept as failed. 409 NOT_REFUNDABLE / PARTIAL_NOT_SUPPORTED',
    })
    .input(RefundRequest)
    .output(z.object({ refund: Refund, invoice: Invoice })),
  refunds: base
    .route({ method: 'GET', path: '/payments/invoices/{id}/refunds', summary: 'List refunds' })
    .input(z.object({ id: Id }))
    .output(listOf(Refund)),
  settings: base
    .route({
      method: 'GET',
      path: '/payments/settings',
      summary: 'Get the default gateway',
      description:
        'The organisation’s default gateway, which an invoice goes through unless it names one; null: the oldest active one that takes its currency',
    })
    .output(PaymentSettings),
  saveSettings: base
    .route({
      method: 'PUT',
      path: '/payments/settings',
      summary: 'Set the default gateway',
      description:
        'Set or clear the default gateway, for every invoice of the organisation. 400 NO_GATEWAY when it is not an active gateway here',
    })
    .input(z.object({ defaultGatewayId: Id.nullable() }))
    .output(PaymentSettings),
  invoices: base
    .route({
      method: 'GET',
      path: '/payments/invoices',
      summary: 'List invoices',
      description: 'Invoices, newest first',
    })
    .input(
      CursorQuery.extend({
        status: InvoiceStatus.optional(),
        source: z.string().max(40).optional(),
        referenceId: z.string().max(100).optional(),
      }),
    )
    .output(cursorPageOf(Invoice)),
  payTestInvoice: base
    .route({
      method: 'POST',
      path: '/payments/invoices/{id}/test-pay',
      summary: 'Pay a test invoice',
      description: 'Pay an invoice of the test gateway (development)',
    })
    .input(z.object({ id: Id }))
    .output(Invoice),
  quickQrDistricts: base
    .route({
      method: 'GET',
      path: '/payments/quickqr/districts/{city}',
      summary: 'List QuickQR districts',
      description:
        "QPay QuickQR's districts of a city or aimag (by code), for a merchant's address",
    })
    .input(
      z.object({
        city: z
          .string()
          .trim()
          .regex(/^\d{1,10}$/),
      }),
    )
    .output(listOf(z.object({ code: z.string(), name: z.string() }))),
};
