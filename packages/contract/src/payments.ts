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

export const InvoiceStatus = z.enum(['pending', 'paid', 'cancelled', 'expired', 'failed']);

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

/**
 * Payments: an organisation's gateway connections (QPay, …) and invoices
 * made through them for plugins' records. Paid invoices publish
 * `core.payment.paid` (webhooks, automations, the plugin's own consumer).
 */
export const paymentsContract = {
  gateways: oc.route({ method: 'GET', path: '/payments/gateways' }).output(z.object({ data: z.array(PaymentGateway) })),
  addGateway: oc
    .route({ method: 'POST', path: '/payments/gateways', successStatus: 201, summary: 'Connect a gateway (checked against it first)' })
    .input(z.object({ name: z.string().trim().min(1).max(80), config: GatewayConfig }))
    .output(PaymentGateway),
  updateGateway: oc
    .route({ method: 'PATCH', path: '/payments/gateways/{id}' })
    .input(z.object({ id: Id, name: z.string().trim().min(1).max(80).optional(), config: GatewayConfig.optional(), status: z.enum(['active', 'disabled']).optional() }))
    .output(PaymentGateway),
  removeGateway: oc
    .route({ method: 'DELETE', path: '/payments/gateways/{id}', summary: 'Remove a gateway without invoices (turn it off otherwise)' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  createInvoice: oc
    .route({ method: 'POST', path: '/payments/invoices', successStatus: 201, summary: 'An invoice at a gateway for a record (plugins: payments:write)' })
    .input(
      z.object({
        gatewayId: Id.optional(),
        amount: z.number().int().min(1).max(1_000_000_000_00),
        currency: z.literal('MNT').default('MNT'),
        description: z.string().trim().min(1).max(255),
        reference: z.object({ type: z.string().trim().min(1).max(60), id: z.string().trim().min(1).max(100) }),
        /** Minutes the invoice can be paid in (default 30). */
        expiresInMinutes: z.number().int().min(1).max(60 * 24 * 7).default(30),
        dedupeKey: DedupeKey.optional(),
      }),
    )
    .output(Invoice),
  getInvoice: oc
    .route({ method: 'GET', path: '/payments/invoices/{id}', summary: 'An invoice; a pending one is checked with the gateway' })
    .input(z.object({ id: Id }))
    .output(Invoice),
  cancelInvoice: oc
    .route({ method: 'POST', path: '/payments/invoices/{id}/cancel' })
    .input(z.object({ id: Id }))
    .output(Invoice),
  invoices: oc
    .route({ method: 'GET', path: '/payments/invoices', summary: 'Invoices, newest first' })
    .input(CursorQuery.extend({ status: InvoiceStatus.optional(), source: z.string().max(40).optional(), referenceId: z.string().max(100).optional() }))
    .output(cursorPageOf(Invoice)),
  payTestInvoice: oc
    .route({ method: 'POST', path: '/payments/invoices/{id}/test-pay', summary: 'Pay an invoice of the test gateway (development)' })
    .input(z.object({ id: Id }))
    .output(Invoice),
};
