import type { WEBHOOK_DELIVERY_STATUSES } from '@erxes/core-db/enums';
import type { CursorQuery } from '@erxes/core-contract';
import {
  caller,
  type Db,
  events,
  newId,
  webhookDeliveries,
  webhooks,
  withOrg,
} from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { notFound } from '~/http/errors';
import { hmacSha256 } from '~/lib/crypto';
import { keysetPage } from '~/lib/keyset';
import { postOutbound } from '~/lib/outbound';
import { oneRow } from '~/lib/rows';
import { unseal } from '~/lib/secrets';
import { logger } from '~/logger';
import type { EventConsumer } from '~/modules/events/consumers';
import { eventJson } from '~/modules/events/events.service';
import { describeError, defineJob } from '~/modules/jobs/jobs';
import { findWebhook, matchesPattern } from './webhooks.service';

const log = logger.child({ component: 'webhooks' });

/** An endpoint failing this many deliveries in a row is turned off. */
const DISABLE_AFTER_FAILURES = 50;

/** `Erxes-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256(secret, "<t>.<body>")>` (Stripe-style). */
export const signPayload = (
  secret: string,
  body: string,
  timestamp = Math.floor(Date.now() / 1000),
) => `t=${timestamp},v1=${hmacSha256(secret, `${timestamp}.${body}`, 'hex')}`;

const loadDelivery = (orgId: string, deliveryId: string) =>
  withOrg(orgId, async (tx) => {
    const [row] = await tx
      .select({ delivery: webhookDeliveries, webhook: webhooks, event: events })
      .from(webhookDeliveries)
      .innerJoin(webhooks, eq(webhooks.id, webhookDeliveries.webhookId))
      .leftJoin(events, eq(events.id, webhookDeliveries.eventId))
      .where(eq(webhookDeliveries.id, deliveryId))
      .limit(1);

    return row ?? null;
  });

type Loaded = NonNullable<Awaited<ReturnType<typeof loadDelivery>>>;

/** POSTs the event, signed; outside any transaction. A refusal or failure is the outcome. */
const send = async (
  deliveryId: string,
  orgId: string,
  webhook: Loaded['webhook'],
  event: NonNullable<Loaded['event']>,
) => {
  const body = JSON.stringify({
    id: event.id,
    type: event.type,
    createdAt: event.createdAt.toISOString(),
    organizationId: orgId,
    data: eventJson(event),
  });

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'erxes-webhooks/1',
    'Erxes-Webhook-Id': webhook.id,
    'Erxes-Event-Id': event.id,
    'Erxes-Delivery-Id': deliveryId,
    'Erxes-Signature': signPayload(unseal(webhook.secretSealed), body),
  };

  try {
    const response = await postOutbound(webhook.url, body, headers);
    const ok = response.status >= 200 && response.status < 300;

    return {
      status: response.status,
      body: response.body,
      error: ok ? null : `HTTP ${response.status}`,
      ms: response.ms,
    };
  } catch (error) {
    return { status: null, body: null, error: describeError(error).slice(0, 500), ms: null };
  }
};

type Outcome = Awaited<ReturnType<typeof send>>;

/** Keeps the attempt's outcome; an endpoint that keeps failing is turned off (its owner sees why). */
const recordOutcome = (
  orgId: string,
  deliveryId: string,
  webhookId: string,
  attempt: { number: number; last: boolean },
  outcome: Outcome,
) =>
  withOrg(orgId, async (tx) => {
    const succeeded = outcome.error === null;
    const retries = !succeeded && !attempt.last;

    await tx
      .update(webhookDeliveries)
      .set({
        status: succeeded ? 'succeeded' : retries ? 'pending' : 'failed',
        attempts: attempt.number,
        responseStatus: outcome.status,
        responseBody: outcome.body,
        error: outcome.error,
        durationMs: outcome.ms,
        deliveredAt: succeeded ? sql`now()` : null,
        updatedAt: sql`now()`,
      })
      .where(eq(webhookDeliveries.id, deliveryId));

    const [webhook] = await tx
      .update(webhooks)
      .set({
        consecutiveFailures: succeeded ? 0 : sql`${webhooks.consecutiveFailures} + 1`,
        updatedAt: sql`now()`,
      })
      .where(eq(webhooks.id, webhookId))
      .returning();

    if (
      webhook &&
      webhook.consecutiveFailures >= DISABLE_AFTER_FAILURES &&
      webhook.status === 'active'
    ) {
      await tx
        .update(webhooks)
        .set({
          status: 'disabled',
          disabledReason: `Turned off after ${DISABLE_AFTER_FAILURES} failed deliveries in a row`,
        })
        .where(eq(webhooks.id, webhook.id));
      log.warn({ webhook: webhook.id }, 'webhook turned off after repeated failures');
    }
  });

/**
 * One attempt of one delivery: POST, record the outcome, throw to retry.
 * 10 attempts, each wait about twice the last (2 min first): 9 to 17 hours
 * in all, then the delivery is failed.
 */
export const deliverJob = defineJob({
  queue: 'webhook.deliver',
  timeoutSeconds: 60,
  retry: { attempts: 10, delay: 120, maxDelay: 8 * 3600 },
  concurrency: 5,
  payload: z.object({ deliveryId: z.string() }),
  async handle(job) {
    const { deliveryId } = job.payload;
    const loaded = await loadDelivery(job.orgId, deliveryId);

    if (!loaded) return;

    const { webhook, event } = loaded;

    // Turned off, or the event is gone: nothing to send.
    if (webhook.status !== 'active' || !event) {
      await withOrg(job.orgId, (tx) =>
        tx
          .update(webhookDeliveries)
          .set({
            status: 'failed',
            error: event ? 'The webhook is turned off' : 'The event is no longer kept',
            updatedAt: sql`now()`,
          })
          .where(eq(webhookDeliveries.id, deliveryId)),
      );

      return;
    }

    const outcome = await send(deliveryId, job.orgId, webhook, event);

    await recordOutcome(
      job.orgId,
      deliveryId,
      webhook.id,
      { number: job.attempt, last: job.lastAttempt },
      outcome,
    );

    if (outcome.error !== null) throw new Error(outcome.error);
  },
});

/** Records the event's delivery to each endpoint and queues their first attempts (in the caller's transaction). */
const queueDeliveries = async (
  client: Db,
  orgId: string,
  webhookIds: string[],
  event: { id: string; type: string },
) => {
  if (!webhookIds.length) return [];

  const deliveries = await client
    .insert(webhookDeliveries)
    .values(
      webhookIds.map((webhookId) => ({
        id: newId(),
        webhookId,
        eventId: event.id,
        eventType: event.type,
      })),
    )
    .returning();

  await deliverJob.enqueueAll(
    client,
    deliveries.map((delivery) => ({
      orgId,
      payload: { deliveryId: delivery.id },
      dedupeKey: delivery.id,
    })),
  );

  return deliveries;
};

/** Sends a `core.webhook.test` event to the endpoint now (and logs it like any delivery). */
export const testWebhook = async (client: Db, id: string) => {
  const webhook = await findWebhook(client, id);

  const event = oneRow(
    await client
      .insert(events)
      .values({
        id: newId(),
        source: 'core',
        type: 'core.webhook.test',
        actorType: 'user',
        actorId: caller('user').userId,
        payload: { webhookId: id, message: 'A test from erxes' },
      })
      .returning(),
  );

  return oneRow(await queueDeliveries(client, webhook.orgId, [webhook.id], event));
};

export const listDeliveries = async (
  client: Db,
  query: CursorQuery & { id: string; status?: (typeof WEBHOOK_DELIVERY_STATUSES)[number] },
) => {
  await findWebhook(client, query.id);

  return keysetPage(
    client,
    {
      table: webhookDeliveries,
      id: webhookDeliveries.id,
      createdAt: webhookDeliveries.createdAt,
      scope: eq(webhookDeliveries.webhookId, query.id),
      countCap: 10_000,
    },
    query.status ? eq(webhookDeliveries.status, query.status) : undefined,
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(webhookDeliveries)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );
};

export const redeliver = async (client: Db, deliveryId: string) => {
  const [delivery] = await client
    .select()
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.id, deliveryId))
    .limit(1);

  if (!delivery) throw notFound('Delivery');

  return oneRow(
    await queueDeliveries(client, delivery.orgId, [delivery.webhookId], {
      id: delivery.eventId,
      type: delivery.eventType,
    }),
  );
};

/**
 * The event stream → webhooks: each event becomes a delivery for every
 * active endpoint of its organisation subscribed to its type.
 */
export const webhooksConsumer: EventConsumer = {
  name: 'core.webhooks',
  async handle(tx, event) {
    const endpoints = await tx
      .select({ id: webhooks.id, eventTypes: webhooks.eventTypes })
      .from(webhooks)
      .where(eq(webhooks.status, 'active'));

    await queueDeliveries(
      tx,
      event.orgId,
      endpoints
        .filter((endpoint) =>
          endpoint.eventTypes.some((pattern) => matchesPattern(pattern, event.type)),
        )
        .map((endpoint) => endpoint.id),
      event,
    );
  },
};

/** Deliveries older than the retention are removed (system scope). */
export const pruneDeliveries = async (client: Db, days: number) => {
  const result = await client.execute(sql`
    delete from ${webhookDeliveries} where id in (
      select id from ${webhookDeliveries} where created_at < now() - make_interval(days => ${days}) limit 10000
    )
  `);

  return result.rowCount ?? 0;
};
