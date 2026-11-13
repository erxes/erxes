import { oc } from '@orpc/contract';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, Id } from './common';

/**
 * Events core publishes (plugins add theirs through their manifest). Webhooks
 * subscribe to them; automations start from them.
 */
export const CORE_EVENT_TYPES = [
  {
    type: 'core.customer.created',
    label: 'Customer created',
    subject: 'customer',
    description: 'A person is added (by hand, an import, a form or a plugin)',
  },
  {
    type: 'core.customer.updated',
    label: 'Customer updated',
    subject: 'customer',
    description: 'A person’s fields, owner or properties change',
  },
  {
    type: 'core.customer.deleted',
    label: 'Customer deleted',
    subject: 'customer',
    description: 'A person is deleted (to the recycle bin)',
  },
  {
    type: 'core.customer.merged',
    label: 'Customers merged',
    subject: 'customer',
    description: 'Duplicates are merged into one person',
  },
  {
    type: 'core.customer.tagged',
    label: 'Customer tagged',
    subject: 'customer',
    description: 'Tags are added to or removed from a person',
  },
  {
    type: 'core.customer.company_linked',
    label: 'Customer linked to a company',
    subject: 'customer',
    description: 'A person is linked to a company',
  },
  {
    type: 'core.customer.company_unlinked',
    label: 'Customer unlinked from a company',
    subject: 'customer',
    description: 'A person is unlinked from a company',
  },
  {
    type: 'core.lead.stage_changed',
    label: 'Lead moved to another stage',
    subject: 'customer',
    description: 'A lead (person or company) moves to another stage',
  },
  {
    type: 'core.lead.converted',
    label: 'Lead became a customer',
    subject: 'customer',
    description: 'A lead becomes a customer',
  },
  {
    type: 'core.company.created',
    label: 'Company created',
    subject: 'company',
    description: 'A company is added',
  },
  {
    type: 'core.company.updated',
    label: 'Company updated',
    subject: 'company',
    description: 'A company’s fields, owner or properties change',
  },
  {
    type: 'core.company.deleted',
    label: 'Company deleted',
    subject: 'company',
    description: 'A company is deleted (to the recycle bin)',
  },
  {
    type: 'core.company.merged',
    label: 'Companies merged',
    subject: 'company',
    description: 'Duplicate companies are merged into one',
  },
  {
    type: 'core.company.tagged',
    label: 'Company tagged',
    subject: 'company',
    description: 'Tags are added to or removed from a company',
  },
  {
    type: 'core.customer.restored',
    label: 'Customer restored',
    subject: 'customer',
    description: 'A deleted person is restored from the recycle bin',
  },
  {
    type: 'core.company.restored',
    label: 'Company restored',
    subject: 'company',
    description: 'A deleted company is restored from the recycle bin',
  },
  {
    type: 'core.product.created',
    label: 'Product added',
    subject: null,
    description: 'A product is added to the catalog (by a member or a plugin)',
  },
  {
    type: 'core.product.updated',
    label: 'Product updated',
    subject: null,
    description: 'A product’s fields, or the plugins that use it, change',
  },
  {
    type: 'core.product.archived',
    label: 'Product archived',
    subject: null,
    description: 'A product is taken out of lists; orders keep it',
  },
  {
    type: 'core.product.restored',
    label: 'Product restored',
    subject: null,
    description: 'An archived product is back in lists',
  },
  {
    type: 'core.payment.paid',
    label: 'Invoice paid',
    subject: null,
    description: 'An invoice is paid',
  },
  {
    type: 'core.payment.cancelled',
    label: 'Invoice cancelled',
    subject: null,
    description: 'An invoice is cancelled',
  },
  {
    type: 'core.payment.expired',
    label: 'Invoice expired unpaid',
    subject: null,
    description: 'An invoice expires unpaid',
  },
  {
    type: 'core.payment.refunded',
    label: 'Payment refunded',
    subject: null,
    description: 'A payment is refunded, in part or in full',
  },
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
  .regex(
    /^(\*|[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*(\.\*)?)$/,
    'an event type, a prefix ending in .*, or *',
  );

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
    .route({
      method: 'GET',
      path: '/events/types',
      summary: "Event types to subscribe to or automate on: core's and installed plugins'",
    })
    .output(z.object({ data: z.array(EventTypeInfo) })),
  list: oc.route({ method: 'GET', path: '/webhooks' }).output(z.object({ data: z.array(Webhook) })),
  create: oc
    .route({
      method: 'POST',
      path: '/webhooks',
      successStatus: 201,
      summary: 'Add an endpoint; the signing secret is returned once here',
    })
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
  remove: oc
    .route({ method: 'DELETE', path: '/webhooks/{id}' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  rotateSecret: oc
    .route({
      method: 'POST',
      path: '/webhooks/{id}/secret',
      summary: 'A new signing secret (returned once); the old one stops at once',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ secret: z.string() })),
  test: oc
    .route({
      method: 'POST',
      path: '/webhooks/{id}/test',
      summary: 'Send a `core.webhook.test` event to the endpoint now',
    })
    .input(z.object({ id: Id }))
    .output(WebhookDelivery),
  deliveries: oc
    .route({
      method: 'GET',
      path: '/webhooks/{id}/deliveries',
      summary: 'Recent deliveries, newest first',
    })
    .input(
      CursorQuery.extend({ id: Id, status: z.enum(['pending', 'succeeded', 'failed']).optional() }),
    )
    .output(cursorPageOf(WebhookDelivery)),
  redeliver: oc
    .route({
      method: 'POST',
      path: '/webhooks/deliveries/{deliveryId}/redeliver',
      summary: 'Send a delivery again',
    })
    .input(z.object({ deliveryId: Id }))
    .output(WebhookDelivery),
};
