import {
  CORE_EVENT_TYPES,
  type CursorQuery,
  type EventTypeInfo,
  type Webhook,
  type WebhookDelivery,
} from '@erxes/core-contract';
import {
  type Db,
  events,
  newId,
  pluginInstallations,
  plugins,
  type Transaction,
  webhookDeliveries,
  webhooks,
  withOrg,
} from '@erxes/core-db';
import { and, desc, eq, sql } from 'drizzle-orm';
import { createHmac, randomBytes } from 'node:crypto';
import { type Actor, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';
import { log } from '~/lib/log';
import { assertOutboundUrl, OutboundError, postOutbound } from '~/lib/outbound';
import { seal, unseal } from '~/lib/secrets';
import { recordAudit } from '~/modules/audit/audit.service';
import type { EventConsumer } from '~/modules/events/processor';
import { toEventDto } from '~/modules/events/events.service';
import { enqueueJob, type JobDefinition } from '~/modules/jobs/jobs';

type WebhookRow = typeof webhooks.$inferSelect;
type DeliveryRow = typeof webhookDeliveries.$inferSelect;

/** Deliveries retry for about a day (8 attempts), then the delivery is failed. */
export const DELIVERY_ATTEMPTS = 8;
/** An endpoint failing this many deliveries in a row is turned off. */
export const DISABLE_AFTER_FAILURES = 50;

const toWebhookDto = (row: WebhookRow): Webhook => ({
  id: row.id,
  url: row.url,
  description: row.description,
  eventTypes: row.eventTypes,
  status: row.status,
  disabledReason: row.disabledReason,
  consecutiveFailures: row.consecutiveFailures,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const toDeliveryDto = (row: DeliveryRow): WebhookDelivery => ({
  id: row.id,
  webhookId: row.webhookId,
  eventId: row.eventId,
  eventType: row.eventType,
  status: row.status,
  attempts: row.attempts,
  responseStatus: row.responseStatus,
  responseBody: row.responseBody,
  error: row.error,
  durationMs: row.durationMs,
  nextAttemptAt: row.nextAttemptAt?.toISOString() ?? null,
  deliveredAt: row.deliveredAt?.toISOString() ?? null,
  createdAt: row.createdAt.toISOString(),
});

/** Core's events and those of the plugins installed here. */
export const eventTypeCatalog = async (client: Db, orgId: string): Promise<EventTypeInfo[]> => {
  const installed = await client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(
      and(
        eq(pluginInstallations.orgId, orgId),
        eq(pluginInstallations.status, 'active'),
        eq(plugins.status, 'active'),
      ),
    );

  return [
    ...CORE_EVENT_TYPES.map((item) => ({
      type: item.type,
      label: item.label,
      description: item.description,
      source: 'core',
      subject: item.subject,
    })),
    ...installed.flatMap((plugin) =>
      (plugin.manifest?.events ?? []).map((item) => ({
        type: item.type,
        label: item.label,
        description: item.description ?? null,
        source: plugin.name,
        subject: item.subject ?? null,
      })),
    ),
  ];
};

/** Does `type` match a subscription pattern (`x.y.z`, `x.*`, `*`)? */
export const matchesPattern = (pattern: string, type: string) =>
  pattern === '*' ||
  pattern === type ||
  (pattern.endsWith('.*') && type.startsWith(pattern.slice(0, -1)));

const newSecret = () => `whsec_${randomBytes(24).toString('base64url')}`;

const checkUrl = (url: string) => {
  try {
    assertOutboundUrl(url);
  } catch (error) {
    throw new HttpError(
      400,
      'INVALID_URL',
      error instanceof OutboundError ? error.message : 'Not a valid address',
    );
  }
};

const findWebhook = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(webhooks)
    .where(and(eq(webhooks.orgId, orgId), eq(webhooks.id, id)))
    .limit(1);

  if (!row) throw notFound('Webhook');

  return row;
};

export const listWebhooks = async (client: Db, actor: Actor) => ({
  data: (
    await client
      .select()
      .from(webhooks)
      .where(eq(webhooks.orgId, actor.orgId))
      .orderBy(desc(webhooks.createdAt))
  ).map(toWebhookDto),
});

export const createWebhook = async (
  client: Db,
  actor: Actor,
  input: { url: string; description?: string | null; eventTypes: string[] },
) => {
  checkUrl(input.url);

  const secret = newSecret();
  const [row] = await client
    .insert(webhooks)
    .values({
      id: newId(),
      orgId: actor.orgId,
      url: input.url,
      description: input.description ?? null,
      eventTypes: [...new Set(input.eventTypes)],
      secretSealed: seal(secret),
      createdBy: actor.userId,
    })
    .returning();

  await recordAudit(client, userCaller(actor), {
    action: 'webhook.created',
    targetType: 'webhook',
    targetId: row!.id,
    targetLabel: row!.url,
    metadata: { eventTypes: row!.eventTypes },
  });

  return { webhook: toWebhookDto(row!), secret };
};

export const updateWebhook = async (
  client: Db,
  actor: Actor,
  id: string,
  input: {
    url?: string;
    description?: string | null;
    eventTypes?: string[];
    status?: 'active' | 'disabled';
  },
) => {
  const before = await findWebhook(client, actor.orgId, id);

  if (input.url) checkUrl(input.url);

  const [row] = await client
    .update(webhooks)
    .set({
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.eventTypes ? { eventTypes: [...new Set(input.eventTypes)] } : {}),
      ...(input.status
        ? {
            status: input.status,
            disabledReason: input.status === 'disabled' ? 'Turned off by a member' : null,
            ...(input.status === 'active' ? { consecutiveFailures: 0 } : {}),
          }
        : {}),
      updatedAt: sql`now()`,
    })
    .where(and(eq(webhooks.orgId, actor.orgId), eq(webhooks.id, id)))
    .returning();

  await recordAudit(client, userCaller(actor), {
    action: 'webhook.updated',
    targetType: 'webhook',
    targetId: id,
    targetLabel: row!.url,
    changes: {
      ...(input.url !== undefined && input.url !== before.url
        ? { url: [before.url, input.url] }
        : {}),
      ...(input.eventTypes ? { eventTypes: [before.eventTypes, row!.eventTypes] } : {}),
      ...(input.status && input.status !== before.status
        ? { status: [before.status, input.status] }
        : {}),
    },
  });

  return toWebhookDto(row!);
};

export const removeWebhook = async (client: Db, actor: Actor, id: string) => {
  const row = await findWebhook(client, actor.orgId, id);

  await client.delete(webhooks).where(and(eq(webhooks.orgId, actor.orgId), eq(webhooks.id, id)));
  await recordAudit(client, userCaller(actor), {
    action: 'webhook.deleted',
    targetType: 'webhook',
    targetId: id,
    targetLabel: row.url,
  });

  return { ok: true as const };
};

export const rotateWebhookSecret = async (client: Db, actor: Actor, id: string) => {
  const row = await findWebhook(client, actor.orgId, id);
  const secret = newSecret();

  await client
    .update(webhooks)
    .set({ secretSealed: seal(secret), updatedAt: sql`now()` })
    .where(eq(webhooks.id, id));
  await recordAudit(client, userCaller(actor), {
    action: 'webhook.secret_rotated',
    targetType: 'webhook',
    targetId: id,
    targetLabel: row.url,
  });

  return { secret };
};

/** Records a delivery and queues its first attempt (in the caller's transaction). */
const queueDelivery = async (
  client: Db,
  orgId: string,
  webhookId: string,
  event: { id: string; type: string },
) => {
  const [delivery] = await client
    .insert(webhookDeliveries)
    .values({ id: newId(), orgId, webhookId, eventId: event.id, eventType: event.type })
    .returning();

  await enqueueJob(client, {
    orgId,
    queue: 'webhook.deliver',
    payload: { deliveryId: delivery!.id },
    dedupeKey: delivery!.id,
    maxAttempts: DELIVERY_ATTEMPTS,
  });

  return delivery!;
};

/** Sends a `core.webhook.test` event to the endpoint now (and logs it like any delivery). */
export const testWebhook = async (client: Db, actor: Actor, id: string) => {
  const webhook = await findWebhook(client, actor.orgId, id);
  const [event] = await client
    .insert(events)
    .values({
      id: newId(),
      orgId: actor.orgId,
      source: 'core',
      type: 'core.webhook.test',
      actorType: 'user',
      actorId: actor.userId,
      payload: { webhookId: id, message: 'A test from erxes' },
    })
    .returning();

  return toDeliveryDto(await queueDelivery(client, actor.orgId, webhook.id, event!));
};

export const listDeliveries = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & { id: string; status?: 'pending' | 'succeeded' | 'failed' },
) => {
  await findWebhook(client, actor.orgId, query.id);

  const page = await keysetPage(
    client,
    {
      table: webhookDeliveries,
      id: webhookDeliveries.id,
      createdAt: webhookDeliveries.createdAt,
      scope: and(
        eq(webhookDeliveries.orgId, actor.orgId),
        eq(webhookDeliveries.webhookId, query.id),
      )!,
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

  return { ...page, data: page.data.map(toDeliveryDto) };
};

export const redeliver = async (client: Db, actor: Actor, deliveryId: string) => {
  const [delivery] = await client
    .select()
    .from(webhookDeliveries)
    .where(and(eq(webhookDeliveries.orgId, actor.orgId), eq(webhookDeliveries.id, deliveryId)))
    .limit(1);

  if (!delivery) throw notFound('Delivery');

  return toDeliveryDto(
    await queueDelivery(client, actor.orgId, delivery.webhookId, {
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
      .where(and(eq(webhooks.orgId, event.orgId), eq(webhooks.status, 'active')));

    for (const endpoint of endpoints) {
      if (endpoint.eventTypes.some((pattern) => matchesPattern(pattern, event.type))) {
        await queueDelivery(tx, event.orgId, endpoint.id, event);
      }
    }
  },
};

/** `Erxes-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256(secret, "<t>.<body>")>` (Stripe-style). */
export const signPayload = (
  secret: string,
  body: string,
  timestamp = Math.floor(Date.now() / 1000),
) =>
  `t=${timestamp},v1=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`;

/** One attempt of one delivery: POST, record the outcome, throw to retry. */
export const deliverJob: JobDefinition = {
  queue: 'webhook.deliver',
  leaseSeconds: 60,
  // 1 min, 5 min, 30 min, 2 h, 5 h, 8 h, 8 h: about a day in all.
  backoff: (attempt) => [60, 300, 1800, 7200, 18_000, 28_800, 28_800][attempt - 1] ?? 28_800,
  async handle(job) {
    const deliveryId = job.payload.deliveryId as string;
    const loaded = await withOrg(job.orgId, async (tx: Transaction) => {
      const [row] = await tx
        .select({ delivery: webhookDeliveries, webhook: webhooks, event: events })
        .from(webhookDeliveries)
        .innerJoin(webhooks, eq(webhooks.id, webhookDeliveries.webhookId))
        .leftJoin(events, eq(events.id, webhookDeliveries.eventId))
        .where(and(eq(webhookDeliveries.orgId, job.orgId), eq(webhookDeliveries.id, deliveryId)))
        .limit(1);

      return row;
    });

    // Removed, turned off, or the event is gone: nothing to send.
    if (!loaded || loaded.webhook.status !== 'active' || !loaded.event) {
      if (loaded) {
        await withOrg(job.orgId, (tx) =>
          tx
            .update(webhookDeliveries)
            .set({
              status: 'failed',
              error: loaded.event ? 'The webhook is turned off' : 'The event is no longer kept',
              updatedAt: sql`now()`,
            })
            .where(eq(webhookDeliveries.id, deliveryId)),
        );
      }

      return;
    }

    const body = JSON.stringify({
      id: loaded.event.id,
      type: loaded.event.type,
      createdAt: loaded.event.createdAt.toISOString(),
      organizationId: job.orgId,
      data: toEventDto(loaded.event),
    });
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'erxes-webhooks/1',
      'Erxes-Webhook-Id': loaded.webhook.id,
      'Erxes-Event-Id': loaded.event.id,
      'Erxes-Delivery-Id': deliveryId,
      'Erxes-Signature': signPayload(unseal(loaded.webhook.secretSealed), body),
    };
    let outcome: {
      status: number | null;
      body: string | null;
      error: string | null;
      ms: number | null;
    };

    try {
      const response = await postOutbound(loaded.webhook.url, body, headers);

      outcome = {
        status: response.status,
        body: response.body,
        error: response.status >= 200 && response.status < 300 ? null : `HTTP ${response.status}`,
        ms: response.ms,
      };
    } catch (error) {
      outcome = {
        status: null,
        body: null,
        error: (error as Error).message.slice(0, 500),
        ms: null,
      };
    }

    const succeeded = outcome.error === null;
    const last = !succeeded && job.attempts >= job.maxAttempts;

    await withOrg(job.orgId, async (tx) => {
      await tx
        .update(webhookDeliveries)
        .set({
          status: succeeded ? 'succeeded' : last ? 'failed' : 'pending',
          attempts: job.attempts,
          responseStatus: outcome.status,
          responseBody: outcome.body,
          error: outcome.error,
          durationMs: outcome.ms,
          deliveredAt: succeeded ? sql`now()` : null,
          nextAttemptAt:
            succeeded || last
              ? null
              : sql`now() + make_interval(secs => ${deliverJob.backoff!(job.attempts)})`,
          updatedAt: sql`now()`,
        })
        .where(eq(webhookDeliveries.id, deliveryId));

      const [webhook] = await tx
        .update(webhooks)
        .set({
          consecutiveFailures: succeeded ? 0 : sql`${webhooks.consecutiveFailures} + 1`,
          updatedAt: sql`now()`,
        })
        .where(eq(webhooks.id, loaded.webhook.id))
        .returning();

      // An endpoint that keeps failing is turned off (its owner sees why).
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
        log.warn('webhook turned off after repeated failures', { webhook: webhook.id });
      }
    });

    if (!succeeded) throw new Error(outcome.error ?? 'delivery failed');
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
