import { WEBHOOK_DELIVERY_STATUSES } from '@erxes/core-db/enums';
import { webhookDeliveries, webhooks } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, httpUrl, Id, isoDate, listOf } from './common';
import { EventTypeInfo } from './eventTypes';

export { CORE_EVENT_TYPES, type CoreEventType, EventTypeInfo } from './eventTypes';

/** `core.customer.created`, `core.customer.*`, `hr.*` or `*`. */
export const EventPattern = z
  .string()
  .trim()
  .regex(
    /^(\*|[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*(\.\*)?)$/,
    'an event type, a prefix ending in .*, or *',
  );

const WebhookUrl = httpUrl(2000);

const int = () => z.int();

export const Webhook = createSelectSchema(webhooks, {
  id: Id,
  consecutiveFailures: int,
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  id: true,
  url: true,
  description: true,
  eventTypes: true,
  status: true,
  disabledReason: true,
  consecutiveFailures: true,
  createdAt: true,
  updatedAt: true,
});

export type Webhook = z.infer<typeof Webhook>;

export const WebhookDelivery = createSelectSchema(webhookDeliveries, {
  id: Id,
  webhookId: Id,
  attempts: int,
  responseStatus: int,
  durationMs: int,
  deliveredAt: isoDate,
  createdAt: isoDate,
}).pick({
  id: true,
  webhookId: true,
  eventId: true,
  eventType: true,
  status: true,
  attempts: true,
  responseStatus: true,
  responseBody: true,
  error: true,
  durationMs: true,
  deliveredAt: true,
  createdAt: true,
});

export type WebhookDelivery = z.infer<typeof WebhookDelivery>;

const WebhookFields = createUpdateSchema(webhooks, {
  url: () => WebhookUrl,
  description: (value) => value.trim().max(300),
  eventTypes: () => z.array(EventPattern).min(1).max(100),
}).pick({ url: true, description: true, eventTypes: true, status: true });

const { INVALID_URL, LIMIT_EXCEEDED } = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({ ...COMMON_ERRORS, INVALID_URL, LIMIT_EXCEEDED });

/**
 * Webhooks: an organisation's endpoints get its events as signed POSTs
 * (`Erxes-Signature: t=<unix>,v1=<hex HMAC-SHA256 of "<t>.<body>">`), retried
 * with backoff for about a day; every attempt is in the delivery log.
 */
export const webhooksContract = {
  eventTypes: base
    .route({
      method: 'GET',
      path: '/events/types',
      summary: 'List event types',
      description: "Event types to subscribe to or automate on: core's and installed plugins'",
    })
    .output(listOf(EventTypeInfo)),
  list: base
    .route({ method: 'GET', path: '/webhooks', summary: 'List webhooks' })
    .output(listOf(Webhook)),
  create: base
    .route({
      method: 'POST',
      path: '/webhooks',
      successStatus: 201,
      summary: 'Add a webhook endpoint',
      description: 'Add an endpoint; the signing secret is returned once here',
    })
    .input(WebhookFields.omit({ status: true }).required({ url: true, eventTypes: true }))
    .output(z.object({ webhook: Webhook, secret: z.string() })),
  update: base
    .route({ method: 'PATCH', path: '/webhooks/{id}', summary: 'Change a webhook' })
    .input(WebhookFields.extend({ id: Id }))
    .output(Webhook),
  remove: base
    .route({ method: 'DELETE', path: '/webhooks/{id}', summary: 'Remove a webhook' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  rotateSecret: base
    .route({
      method: 'POST',
      path: '/webhooks/{id}/secret',
      summary: 'Rotate a webhook secret',
      description: 'A new signing secret (returned once); the old one stops at once',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ secret: z.string() })),
  test: base
    .route({
      method: 'POST',
      path: '/webhooks/{id}/test',
      summary: 'Test a webhook',
      description: 'Send a `core.webhook.test` event to the endpoint now',
    })
    .input(z.object({ id: Id }))
    .output(WebhookDelivery),
  deliveries: base
    .route({
      method: 'GET',
      path: '/webhooks/{id}/deliveries',
      summary: 'List webhook deliveries',
      description: 'Recent deliveries, newest first',
    })
    .input(CursorQuery.extend({ id: Id, status: z.enum(WEBHOOK_DELIVERY_STATUSES).optional() }))
    .output(cursorPageOf(WebhookDelivery)),
  redeliver: base
    .route({
      method: 'POST',
      path: '/webhooks/deliveries/{deliveryId}/redeliver',
      summary: 'Resend a webhook delivery',
      description: 'Send a delivery again',
    })
    .input(z.object({ deliveryId: Id }))
    .output(WebhookDelivery),
};
