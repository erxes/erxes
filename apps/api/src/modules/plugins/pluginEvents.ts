import { CoreEvent } from '@erxes/core-contract';
import { events, plugins, pluginInstallations, withOrg } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { EventConsumer } from '~/modules/events/consumers';
import { defineJob } from '~/modules/jobs/jobs';
import { matchesPattern } from '~/modules/webhooks/webhooks.service';
import { activeInstallation, deliverToPlugin } from './pluginDelivery';

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
 * `customers:read`; products: `products:read`; branches and departments:
 * `units:read`; an agent's (`core.agent.*`): the plugin it belongs to; anything else from core or
 * other plugins: `events:read`.
 */
const pluginMaySee = (
  plugin: string,
  scopes: string[],
  event: Pick<EventRow, 'type' | 'source' | 'payload'>,
) => {
  if (event.source === plugin) return false;

  // An agent's runs go to the plugin that declared it only.
  if (event.type.startsWith('core.agent.')) {
    const parsed = z.object({ agent: z.string() }).safeParse(event.payload);

    return parsed.success && parsed.data.agent.startsWith(`${plugin}.`);
  }

  if (event.type.startsWith('core.payment.')) {
    return scopes.includes('payments:read') && paymentConcerns(plugin, event.payload);
  }

  if (event.type.startsWith('core.customer.') || event.type.startsWith('core.company.'))
    return scopes.includes('customers:read');

  if (event.type.startsWith('core.product.')) return scopes.includes('products:read');

  if (event.type.startsWith('core.unit.')) return scopes.includes('units:read');

  return scopes.includes('events:read');
};

/** The event and the plugin's active installation, or null when there is nothing to send. */
const loadDelivery = (orgId: string, plugin: string, eventId: string) =>
  withOrg(orgId, async (tx) => {
    const [event] = await tx.select().from(events).where(eq(events.id, eventId)).limit(1);
    const target = await activeInstallation(tx, plugin);
    const url = target?.manifest?.api?.url;

    // Uninstalled, suspended, scopes taken away, or the event is gone: nothing to send.
    if (!event || !target || !url || !pluginMaySee(plugin, target.scopes, event)) return null;

    return { event, url };
  });

/**
 * One delivery: POST `{ id, type, organizationId, createdAt, data }` to
 * `<api.url>/events` with a 5-minute core token (`aud` the plugin, `sha` the
 * body's digest) and `Idempotency-Key: <event id>`. Anything but 2xx retries:
 * 10 attempts, each wait about twice the last (2 min first), up to 8 hours
 * apart: 9 to 17 hours in all.
 */
export const pluginEventJob = defineJob({
  queue: 'plugin.event',
  timeoutSeconds: 60,
  retry: { attempts: 10, delay: 120, maxDelay: 8 * 3600 },
  concurrency: 5,
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
      data: CoreEvent.parse(event),
    });

    await deliverToPlugin({
      plugin,
      url,
      path: '/events',
      orgId: job.orgId,
      kind: 'event',
      id: event.id,
      body,
      typ: CORE_EVENT_TYP,
      headers: { 'User-Agent': 'erxes-events/1', 'Erxes-Event-Id': event.id },
    });
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
      .where(and(eq(pluginInstallations.status, 'active'), eq(plugins.status, 'active')));

    const subscribed = installed.filter(
      (row) =>
        row.manifest?.api?.url &&
        (row.manifest.subscriptions ?? []).some((pattern) => matchesPattern(pattern, event.type)) &&
        pluginMaySee(row.plugin, row.scopes, event),
    );

    await pluginEventJob.enqueueAll(
      tx,
      subscribed.map((row) => ({
        orgId: event.orgId,
        payload: { plugin: row.plugin, eventId: event.id },
        dedupeKey: `${row.plugin}:${event.id}`,
      })),
    );
  },
};
