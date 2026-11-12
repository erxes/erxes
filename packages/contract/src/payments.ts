import { oc } from '@orpc/contract';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, Id } from './common';
import { DedupeKey } from './platform';

export const PaymentGatewayKind = z.enum(['qpay', 'test']);

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

export const PaymentGateway = z.object({
  id: Id,
  kind: PaymentGatewayKind,
  name: z.string(),
  status: z.enum(['active', 'disabled']),
  /** Non-secret settings, for display (`invoiceCode`, `sandbox`). */
  settings: z.record(z.unknown()),
  createdAt: z.string().datetime(),
});

export type PaymentGateway = z.infer<typeof PaymentGateway>;

export const InvoiceStatus = z.enum([
  'pending',
  'paid',
  'refunded',
  'cancelled',
  'expired',
  'failed',
]);

/** The caller's own data on an invoice (order lines, room number): at most 8 KB of JSON, returned in events. */
export const InvoiceMetadata = z
  .record(z.unknown())
  .refine((value) => JSON.stringify(value).length <= 8192, 'at most 8 KB of JSON');

export const Invoice = z.object({
  id: Id,
  gatewayId: Id,
  gatewayKind: PaymentGatewayKind,
  source: z.string(),
  reference: z.object({ type: z.string(), id: z.string() }),
  /** Hundredths of the currency unit (₮1,500 → 150000). */
  amount: z.number().int(),
  currency: z.string(),
  description: z.string(),
  status: InvoiceStatus,
  metadata: z.record(z.unknown()),
  /** What the gateway says was paid, and how much of it was given back (hundredths). */
  paidAmount: z.number().int().nullable(),
  refundedAmount: z.number().int(),
  /** What can still be refunded, and how the gateway refunds (`full`: only the whole payment). */
  refundable: z.object({ amount: z.number().int(), gateway: z.enum(['partial', 'full', 'none']) }),
  /** For the payer: QR (text and PNG data), a short link, bank app links. */
  payment: z.object({
    qrText: z.string().nullable(),
    qrImage: z.string().nullable(),
    shortUrl: z.string().nullable(),
    links: z.array(z.object({ name: z.string(), logo: z.string().nullable(), link: z.string() })),
  }),
  expiresAt: z.string().datetime(),
  paidAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type Invoice = z.infer<typeof Invoice>;

export const Refund = z.object({
  id: Id,
  invoiceId: Id,
  amount: z.number().int(),
  reason: z.string(),
  /** `gateway`: sent through it; `manual`: the organisation paid it back itself and recorded it. */
  method: z.enum(['gateway', 'manual']),
  status: z.enum(['succeeded', 'failed']),
  error: z.string().nullable(),
  requestedBy: z.object({ type: z.string(), id: z.string().nullable() }),
  createdAt: z.string().datetime(),
});

export type Refund = z.infer<typeof Refund>;

/** How a plugin takes payments here: its default gateway, and the only ones it may use (none: any). */
export const PluginPaymentSettings = z.object({
  plugin: z.string(),
  title: z.string(),
  defaultGatewayId: Id.nullable(),
  allowedGatewayIds: z.array(Id),
});

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
      summary: 'An invoice at a gateway for a record (plugins: payments:write)',
    })
    .input(
      z.object({
        gatewayId: Id.optional(),
        amount: z.number().int().min(1).max(1_000_000_000_00),
        currency: z.literal('MNT').default('MNT'),
        description: z.string().trim().min(1).max(255),
        reference: z.object({
          type: z.string().trim().min(1).max(60),
          id: z.string().trim().min(1).max(100),
        }),
        /** Minutes the invoice can be paid in (default 30). */
        expiresInMinutes: z
          .number()
          .int()
          .min(1)
          .max(60 * 24 * 7)
          .default(30),
        dedupeKey: DedupeKey.optional(),
        metadata: InvoiceMetadata.optional(),
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
        amount: z.number().int().min(1).optional(),
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
