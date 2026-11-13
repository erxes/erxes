import {
  INVOICE_STATUSES,
  PAYMENT_GATEWAY_KINDS,
  paymentGateways,
  paymentInvoices,
  paymentPluginSettings,
  paymentRefunds,
} from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, Id, isoDate } from './common';
import { Currency } from './money';
import { DedupeKey } from './platform';
import { PluginName } from './plugins';

/**
 * The gateways core can connect, and where each works: the currencies it
 * takes and the countries it serves (empty: any). QPay is Mongolian; global
 * ones (Stripe …) join here as drivers in `@erxes/payment-gateways`.
 */
export const PAYMENT_GATEWAYS = {
  qpay: { currencies: ['MNT'], countries: ['MN'] },
  test: { currencies: [], countries: [] },
} as const satisfies Record<string, { currencies: string[]; countries: string[] }>;

export const PaymentGatewayKind = z.enum(PAYMENT_GATEWAY_KINDS);

export type PaymentGatewayKind = z.infer<typeof PaymentGatewayKind>;

/** Does this kind of gateway take this currency? */
export const gatewayTakes = (kind: PaymentGatewayKind, currency: string) => {
  const { currencies } = PAYMENT_GATEWAYS[kind];

  return currencies.length === 0 || currencies.some((code) => code === currency);
};

/** What each gateway needs (secrets are write-only: never returned). */
export const GatewayConfig = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('qpay'),
    clientId: z.string().trim().min(1).max(200),
    clientSecret: z.string().trim().min(1).max(500),
    invoiceCode: z.string().trim().min(1).max(200),
    /** merchant-sandbox.qpay.mn instead of merchant.qpay.mn */
    sandbox: z.boolean().default(false),
  }),
  /** Development and tests: invoices are paid by calling the test endpoint. */
  z.object({ kind: z.literal('test') }),
]);

export type GatewayConfig = z.infer<typeof GatewayConfig>;

export const PaymentGateway = createSelectSchema(paymentGateways, { id: Id, createdAt: isoDate })
  .pick({ id: true, kind: true, name: true, status: true, createdAt: true })
  .extend({
    /** Non-secret settings, for display (`invoiceCode`, `sandbox`). */
    settings: z.record(z.string(), z.unknown()),
  });

export type PaymentGateway = z.infer<typeof PaymentGateway>;

export const InvoiceStatus = z.enum(INVOICE_STATUSES);

/** The caller's own data on an invoice (order lines, room number): at most 8 KB of JSON, returned in events. */
export const InvoiceMetadata = z
  .record(z.string(), z.unknown())
  .refine((value) => JSON.stringify(value).length <= 8192, 'at most 8 KB of JSON');

/**
 * What an invoice is for. `plugin`: whose line it is when one invoice pays
 * for several plugins' records (an order and its delivery); that plugin
 * hears the invoice's events too.
 */
export const InvoiceLine = z.object({
  productId: Id.nullable(),
  name: z.string(),
  quantity: z.number(),
  /** In the smallest unit, like `amount`. */
  unitPrice: z.int(),
  /** quantity × unit price, rounded to the smallest unit. */
  amount: z.int(),
  plugin: z.string().nullable(),
});

export type InvoiceLine = z.infer<typeof InvoiceLine>;

export const InvoiceLineInput = z.object({
  productId: Id.optional(),
  /** Defaults to the product's name. */
  name: z.string().trim().min(1).max(200).optional(),
  /** Up to 3 decimals (1.5 kg). */
  quantity: z
    .number()
    .positive()
    .max(1_000_000)
    .refine((value) => Number.isInteger(value * 1000), 'at most 3 decimals'),
  unitPrice: z.int().min(0).max(1_000_000_000_00),
  plugin: PluginName.optional(),
});

export type InvoiceLineInput = z.infer<typeof InvoiceLineInput>;

const int = () => z.int();

export const Invoice = createSelectSchema(paymentInvoices, {
  id: Id,
  gatewayId: Id,
  amount: int,
  metadata: z.record(z.string(), z.unknown()),
  lines: z.array(InvoiceLine),
  paidAmount: int,
  refundedAmount: int,
  payment: z.object({
    qrText: z.string().nullable(),
    qrImage: z.string().nullable(),
    shortUrl: z.string().nullable(),
    links: z.array(z.object({ name: z.string(), logo: z.string().nullable(), link: z.string() })),
  }),
  expiresAt: isoDate,
  paidAt: isoDate,
  createdAt: isoDate,
})
  .pick({
    id: true,
    gatewayId: true,
    source: true,
    /** In the currency's smallest unit: $12.50 → 1250, ₮1,500 → 150000, ¥500 → 500 (`currencyDigits`). */
    amount: true,
    /** ISO 4217. */
    currency: true,
    description: true,
    status: true,
    metadata: true,
    lines: true,
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
    gatewayKind: PaymentGatewayKind,
    reference: z.object({ type: z.string(), id: z.string() }),
    /** What can still be refunded, and how the gateway refunds (`full`: only the whole payment). */
    refundable: z.object({ amount: z.int(), gateway: z.enum(['partial', 'full', 'none']) }),
  });

export type Invoice = z.infer<typeof Invoice>;

export const Refund = createSelectSchema(paymentRefunds, {
  id: Id,
  invoiceId: Id,
  amount: int,
  createdAt: isoDate,
})
  .pick({
    id: true,
    invoiceId: true,
    amount: true,
    reason: true,
    /** `gateway`: sent through it; `manual`: the organisation paid it back itself and recorded it. */
    method: true,
    status: true,
    error: true,
    createdAt: true,
  })
  .extend({ requestedBy: z.object({ type: z.string(), id: z.string().nullable() }) });

export type Refund = z.infer<typeof Refund>;

/** How a plugin takes payments here: its default gateway, and the only ones it may use (none: any). */
export const PluginPaymentSettings = createSelectSchema(paymentPluginSettings, {
  defaultGatewayId: () => Id,
  allowedGatewayIds: () => z.array(Id),
})
  .pick({ plugin: true, defaultGatewayId: true, allowedGatewayIds: true })
  .extend({ title: z.string() });

export type PluginPaymentSettings = z.infer<typeof PluginPaymentSettings>;

/**
 * Payments: an organisation's gateway connections (QPay, …) and invoices
 * made through them for plugins' records. Paid invoices publish
 * `core.payment.paid` (webhooks, automations, the plugin's own consumer).
 */
export const paymentsContract = {
  gateways: oc
    .route({ method: 'GET', path: '/payments/gateways' })
    .output(z.object({ data: z.array(PaymentGateway) })),
  addGateway: oc
    .route({
      method: 'POST',
      path: '/payments/gateways',
      successStatus: 201,
      summary: 'Connect a gateway (checked against it first)',
    })
    .input(z.object({ name: z.string().trim().min(1).max(80), config: GatewayConfig }))
    .output(PaymentGateway),
  updateGateway: oc
    .route({ method: 'PATCH', path: '/payments/gateways/{id}' })
    .input(
      z.object({
        id: Id,
        name: z.string().trim().min(1).max(80).optional(),
        config: GatewayConfig.optional(),
        status: z.enum(['active', 'disabled']).optional(),
      }),
    )
    .output(PaymentGateway),
  removeGateway: oc
    .route({
      method: 'DELETE',
      path: '/payments/gateways/{id}',
      summary: 'Remove a gateway without invoices (turn it off otherwise)',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  createInvoice: oc
    .route({
      method: 'POST',
      path: '/payments/invoices',
      successStatus: 201,
      summary:
        "An invoice at a gateway for a record (plugins: payments:write), in the organisation's currency unless `currency` says otherwise; without `gatewayId`, the first allowed gateway that takes the currency. 400 CURRENCY_NOT_SUPPORTED when the gateway doesn't take it. With `lines`, their amounts add up to `amount`: 400 LINES_MISMATCH, INVALID_PRODUCT",
    })
    .input(
      z.object({
        gatewayId: Id.optional(),
        amount: z.int().min(1).max(1_000_000_000_00),
        currency: Currency.optional(),
        description: z.string().trim().min(1).max(255),
        reference: z.object({
          type: z.string().trim().min(1).max(60),
          id: z.string().trim().min(1).max(100),
        }),
        /** Minutes the invoice can be paid in (default 30). */
        expiresInMinutes: z
          .int()
          .min(1)
          .max(60 * 24 * 7)
          .default(30),
        dedupeKey: DedupeKey.optional(),
        metadata: InvoiceMetadata.optional(),
        lines: z.array(InvoiceLineInput).max(100).optional(),
      }),
    )
    .output(Invoice),
  getInvoice: oc
    .route({
      method: 'GET',
      path: '/payments/invoices/{id}',
      summary: 'An invoice; a pending one is checked with the gateway',
    })
    .input(z.object({ id: Id }))
    .output(Invoice),
  cancelInvoice: oc
    .route({ method: 'POST', path: '/payments/invoices/{id}/cancel' })
    .input(z.object({ id: Id }))
    .output(Invoice),
  refund: oc
    .route({
      method: 'POST',
      path: '/payments/invoices/{id}/refunds',
      successStatus: 201,
      summary:
        'Give money back for a paid invoice (all that is left unless `amount`). Through the gateway, or `manual` to record a refund made outside erxes. A refused refund is kept as failed. 409 NOT_REFUNDABLE / PARTIAL_NOT_SUPPORTED',
    })
    .input(
      z.object({
        id: Id,
        amount: z.int().min(1).optional(),
        reason: z.string().trim().min(1).max(255),
        manual: z.boolean().default(false),
        dedupeKey: DedupeKey.optional(),
      }),
    )
    .output(z.object({ refund: Refund, invoice: Invoice })),
  refunds: oc
    .route({ method: 'GET', path: '/payments/invoices/{id}/refunds' })
    .input(z.object({ id: Id }))
    .output(z.object({ data: z.array(Refund) })),
  pluginSettings: oc
    .route({
      method: 'GET',
      path: '/payments/plugins',
      summary: 'Installed plugins that take payments, with their gateway settings',
    })
    .output(z.object({ data: z.array(PluginPaymentSettings) })),
  updatePluginSettings: oc
    .route({ method: 'PUT', path: '/payments/plugins/{plugin}' })
    .input(
      z.object({
        plugin: z.string().min(1).max(60),
        defaultGatewayId: Id.nullable(),
        allowedGatewayIds: z.array(Id).max(50),
      }),
    )
    .output(PluginPaymentSettings),
  invoices: oc
    .route({ method: 'GET', path: '/payments/invoices', summary: 'Invoices, newest first' })
    .input(
      CursorQuery.extend({
        status: InvoiceStatus.optional(),
        source: z.string().max(40).optional(),
        referenceId: z.string().max(100).optional(),
      }),
    )
    .output(cursorPageOf(Invoice)),
  payTestInvoice: oc
    .route({
      method: 'POST',
      path: '/payments/invoices/{id}/test-pay',
      summary: 'Pay an invoice of the test gateway (development)',
    })
    .input(z.object({ id: Id }))
    .output(Invoice),
};
