import { oc } from '@orpc/contract';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, Id } from './common';

/**
 * Events core publishes (plugins add theirs through their manifest). Webhooks
 * subscribe to them; automations start from them.
 */
export const CORE_EVENT_TYPES = [
  { type: 'core.customer.created', label: 'Customer created', subject: 'customer' },
  { type: 'core.customer.updated', label: 'Customer updated', subject: 'customer' },
  { type: 'core.customer.deleted', label: 'Customer deleted', subject: 'customer' },
  { type: 'core.customer.merged', label: 'Customers merged', subject: 'customer' },
  { type: 'core.customer.tagged', label: 'Customer tagged', subject: 'customer' },
  { type: 'core.customer.company_linked', label: 'Customer linked to a company', subject: 'customer' },
  { type: 'core.customer.company_unlinked', label: 'Customer unlinked from a company', subject: 'customer' },
  { type: 'core.company.created', label: 'Company created', subject: 'company' },
  { type: 'core.company.updated', label: 'Company updated', subject: 'company' },
  { type: 'core.company.deleted', label: 'Company deleted', subject: 'company' },
  { type: 'core.company.merged', label: 'Companies merged', subject: 'company' },
  { type: 'core.company.tagged', label: 'Company tagged', subject: 'company' },
  { type: 'core.customer.restored', label: 'Customer restored', subject: 'customer' },
  { type: 'core.company.restored', label: 'Company restored', subject: 'company' },
  { type: 'core.payment.paid', label: 'Invoice paid', subject: null },
  { type: 'core.payment.cancelled', label: 'Invoice cancelled', subject: null },
] as const;

export const EventTypeInfo = z.object({
  type: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  /** `core` or the plugin that publishes it. */
  source: z.string(),
  /** The record it is about, when it is about a customer or company. */
  subject: z.enum(['customer', 'company']).nullable(),
});
export type EventTypeInfo = z.infer<typeof EventTypeInfo>;

/** `core.customer.created`, `core.customer.*`, `hr.*` or `*`. */
export const EventPattern = z
  .string()
  .trim()
  .regex(/^(\*|[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*(\.\*)?)$/, 'an event type, a prefix ending in .*, or *');

const WebhookUrl = z
  .string()
  .trim()
  .url()
  .max(2000)
  .refine((value) => /^https?:\/\//.test(value), 'an http(s) address');

export const Webhook = z.object({
  id: Id,
  url: z.string(),
  description: z.string().nullable(),
  eventTypes: z.array(z.string()),
  status: z.enum(['active', 'disabled']),
  disabledReason: z.string().nullable(),
  consecutiveFailures: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Webhook = z.infer<typeof Webhook>;

export const WebhookDelivery = z.object({
  id: Id,
  webhookId: Id,
  eventId: z.string(),
  eventType: z.string(),
  status: z.enum(['pending', 'succeeded', 'failed']),
  attempts: z.number().int(),
  responseStatus: z.number().int().nullable(),
  responseBody: z.string().nullable(),
  error: z.string().nullable(),
  durationMs: z.number().int().nullable(),
  nextAttemptAt: z.string().datetime().nullable(),
  deliveredAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type WebhookDelivery = z.infer<typeof WebhookDelivery>;

const WebhookFields = {
  url: WebhookUrl,
  description: z.string().trim().max(300).nullable().optional(),
  eventTypes: z.array(EventPattern).min(1).max(100),
};

/**
 * Webhooks: an organisation's endpoints get its events as signed POSTs
 * (`Erxes-Signature: t=<unix>,v1=<hex HMAC-SHA256 of "<t>.<body>">`), retried
 * with backoff for about a day; every attempt is in the delivery log.
 */
export const webhooksContract = {
  eventTypes: oc
    .route({ method: 'GET', path: '/events/types', summary: "Event types to subscribe to or automate on: core's and installed plugins'" })
    .output(z.object({ data: z.array(EventTypeInfo) })),
  list: oc.route({ method: 'GET', path: '/webhooks' }).output(z.object({ data: z.array(Webhook) })),
  create: oc
    .route({ method: 'POST', path: '/webhooks', successStatus: 201, summary: 'Add an endpoint; the signing secret is returned once here' })
    .input(z.object(WebhookFields))
    .output(z.object({ webhook: Webhook, secret: z.string() })),
  update: oc
    .route({ method: 'PATCH', path: '/webhooks/{id}' })
    .input(
      z.object({
        id: Id,
        url: WebhookFields.url.optional(),
        description: WebhookFields.description,
        eventTypes: WebhookFields.eventTypes.optional(),
        status: z.enum(['active', 'disabled']).optional(),
      }),
    )
    .output(Webhook),
  remove: oc.route({ method: 'DELETE', path: '/webhooks/{id}' }).input(z.object({ id: Id })).output(z.object({ ok: z.literal(true) })),
  rotateSecret: oc
    .route({ method: 'POST', path: '/webhooks/{id}/secret', summary: 'A new signing secret (returned once); the old one stops at once' })
    .input(z.object({ id: Id }))
    .output(z.object({ secret: z.string() })),
  test: oc
    .route({ method: 'POST', path: '/webhooks/{id}/test', summary: 'Send a `core.webhook.test` event to the endpoint now' })
    .input(z.object({ id: Id }))
    .output(WebhookDelivery),
  deliveries: oc
    .route({ method: 'GET', path: '/webhooks/{id}/deliveries', summary: 'Recent deliveries, newest first' })
    .input(CursorQuery.extend({ id: Id, status: z.enum(['pending', 'succeeded', 'failed']).optional() }))
    .output(cursorPageOf(WebhookDelivery)),
  redeliver: oc
    .route({ method: 'POST', path: '/webhooks/deliveries/{deliveryId}/redeliver', summary: 'Send a delivery again' })
    .input(z.object({ deliveryId: Id }))
    .output(WebhookDelivery),
};
