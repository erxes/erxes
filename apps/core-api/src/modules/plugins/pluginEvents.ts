import { events, plugins, pluginInstallations, withOrg } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { logger } from '~/logger';
import { postOutbound } from '~/lib/outbound';
import { signJwt } from '~/lib/signing';
import type { EventConsumer } from '~/modules/events/processor';
import { toEventDto } from '~/modules/events/events.service';
import { defineJob } from '~/modules/jobs/jobs';
import { matchesPattern } from '~/modules/webhooks/webhooks.service';

const log = logger.child({ component: 'plugins' });

type EventRow = typeof events.$inferSelect;

export const CORE_EVENT_TYP = 'erxes-core-event+jwt';

const PaymentPayload = z.object({
  source: z.string(),
  lines: z.array(z.object({ plugin: z.string().nullable() })).default([]),
});

/** The plugin's own invoice, or one with a line for it (an order and its delivery, paid at once). */
const paymentConcerns = (plugin: string, payload: unknown) => {
  const parsed = PaymentPayload.safeParse(payload);

  return (
    parsed.success &&
    (parsed.data.source === plugin || parsed.data.lines.some((line) => line.plugin === plugin))
  );
};

/**
 * May this plugin see this event? Payment events: its own invoices and those
 * with a line for it (`payments:read`); customers and companies:
 * `customers:read`; products: `products:read`; anything else from core or
 * other plugins: `events:read`.
 */
const pluginMaySee = (
  plugin: string,
  scopes: string[],
  event: Pick<EventRow, 'type' | 'source' | 'payload'>,
) => {
  if (event.source === plugin) return false;

  if (event.type.startsWith('core.payment.')) {
    return scopes.includes('payments:read') && paymentConcerns(plugin, event.payload);
  }

  if (event.type.startsWith('core.customer.') || event.type.startsWith('core.company.'))
    return scopes.includes('customers:read');

  if (event.type.startsWith('core.product.')) return scopes.includes('products:read');

  return scopes.includes('events:read');
};

/** The body's SHA-256 (base64url), bound into the token so the body can't be swapped. */
export const bodyDigest = (body: string) => createHash('sha256').update(body).digest('base64url');

/** The event and the plugin's active installation, or null when there is nothing to send. */
const loadDelivery = (orgId: string, plugin: string, eventId: string) =>
  withOrg(orgId, async (tx) => {
    const [event] = await tx
      .select()
      .from(events)
      .where(and(eq(events.orgId, orgId), eq(events.id, eventId)))
      .limit(1);

    const [target] = await tx
      .select({ scopes: pluginInstallations.grantedScopes, manifest: plugins.manifest })
      .from(pluginInstallations)
      .innerJoin(plugins, eq(plugins.name, pluginInstallations.plugin))
      .where(
        and(
          eq(pluginInstallations.orgId, orgId),
          eq(pluginInstallations.plugin, plugin),
          eq(pluginInstallations.status, 'active'),
          eq(plugins.status, 'active'),
        ),
      )
      .limit(1);

    const url = target?.manifest?.api?.url;

    // Uninstalled, suspended, scopes taken away, or the event is gone: nothing to send.
    if (!event || !target || !url || !pluginMaySee(plugin, target.scopes, event)) return null;

    return { event, url };
  });

/**
 * One delivery: POST `{ id, type, organizationId, createdAt, data }` to
 * `<api.url>/events` with a 5-minute core token (`aud` the plugin, `sha` the
 * body's digest) and `Idempotency-Key: <event id>`. Anything but 2xx retries:
 * 1 min, 5 min, 30 min, 2 h, then every 8 h (about two days in all).
 */
export const pluginEventJob = defineJob({
  queue: 'plugin.event',
  leaseSeconds: 60,
  backoff: (attempt) => [60, 300, 1800, 7200][attempt - 1] ?? 28_800,
  payload: z.object({ plugin: z.string(), eventId: z.string() }),
  async handle(job) {
    const { plugin } = job.payload;
    const delivery = await loadDelivery(job.orgId, plugin, job.payload.eventId);

    if (!delivery) return;

    const { event, url } = delivery;

    const body = JSON.stringify({
      id: event.id,
      type: event.type,
      organizationId: job.orgId,
      createdAt: event.createdAt.toISOString(),
      data: toEventDto(event),
    });

    const token = await signJwt(
      { org: job.orgId, event: event.id, sha: bodyDigest(body) },
      {
        typ: CORE_EVENT_TYP,
        audience: plugin,
        subject: `event:${event.id}`,
        expiresInSeconds: 300,
      },
    );

    const response = await postOutbound(`${url.replace(/\/+$/, '')}/events`, body, {
      'Content-Type': 'application/json',
      'User-Agent': 'erxes-events/1',
      Authorization: `Bearer ${token}`,
      'Idempotency-Key': event.id,
      'Erxes-Event-Id': event.id,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`${plugin} answered ${response.status}: ${response.body.slice(0, 300)}`);
    }
  },
  async onDead(job, error) {
    log.error(
      { plugin: job.payload.plugin, event: job.payload.eventId, err: error },
      'a plugin never accepted an event',
    );
  },
});

/**
 * `core.plugins`: events a plugin subscribed to in its manifest go to its
 * API, one job per plugin and event (retried; never blocks the stream).
 */
export const pluginEventsConsumer: EventConsumer = {
  name: 'core.plugins',
  async handle(tx, event) {
    const installed = await tx
      .select({
        plugin: pluginInstallations.plugin,
        scopes: pluginInstallations.grantedScopes,
        manifest: plugins.manifest,
      })
      .from(pluginInstallations)
      .innerJoin(plugins, eq(plugins.name, pluginInstallations.plugin))
      .where(
        and(
          eq(pluginInstallations.orgId, event.orgId),
          eq(pluginInstallations.status, 'active'),
          eq(plugins.status, 'active'),
        ),
      );

    for (const row of installed) {
      const patterns = row.manifest?.subscriptions ?? [];

      if (
        !row.manifest?.api?.url ||
        !patterns.some((pattern) => matchesPattern(pattern, event.type))
      )
        continue;

      if (!pluginMaySee(row.plugin, row.scopes, event)) continue;

      await pluginEventJob.enqueue(tx, {
        orgId: event.orgId,
        payload: { plugin: row.plugin, eventId: event.id },
        dedupeKey: `${row.plugin}:${event.id}`,
        maxAttempts: 10,
      });
    }
  },
};
