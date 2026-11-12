import { events, plugins, pluginInstallations, withOrg } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import { log } from '~/lib/log';
import { postOutbound } from '~/lib/outbound';
import { signJwt } from '~/lib/signing';
import type { EventConsumer } from '~/modules/events/processor';
import { toEventDto } from '~/modules/events/events.service';
import { enqueueJob, type JobDefinition } from '~/modules/jobs/jobs';
import { matchesPattern } from '~/modules/webhooks/webhooks.service';

type EventRow = typeof events.$inferSelect;

export const CORE_EVENT_TYP = 'erxes-core-event+jwt';

/**
 * May this plugin see this event? Payment events: its own invoices only
 * (`payments:read`); customers and companies: `customers:read`; anything
 * else from core or other plugins: `events:read`.
 */
export const pluginMaySee = (
  plugin: string,
  scopes: string[],
  event: Pick<EventRow, 'type' | 'source' | 'payload'>,
) => {
  if (event.source === plugin) return false;

  if (event.type.startsWith('core.payment.')) {
    return (
      scopes.includes('payments:read') &&
      (event.payload as { source?: unknown } | null)?.source === plugin
    );
  }

  if (event.type.startsWith('core.customer.') || event.type.startsWith('core.company.'))
    return scopes.includes('customers:read');

  return scopes.includes('events:read');
};

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

      await enqueueJob(tx, {
        orgId: event.orgId,
        queue: 'plugin.event',
        payload: { plugin: row.plugin, eventId: event.id },
        dedupeKey: `${row.plugin}:${event.id}`,
        maxAttempts: 10,
      });
    }
  },
};

/** The body's SHA-256 (base64url), bound into the token so the body can't be swapped. */
export const bodyDigest = (body: string) => createHash('sha256').update(body).digest('base64url');

/**
 * One delivery: POST `{ id, type, organizationId, createdAt, data }` to
 * `<api.url>/events` with a 5-minute core token (`aud` the plugin, `sha` the
 * body's digest) and `Idempotency-Key: <event id>`. Anything but 2xx retries:
 * 1 min, 5 min, 30 min, 2 h, then every 8 h (about two days in all).
 */
export const pluginEventJob: JobDefinition = {
  queue: 'plugin.event',
  leaseSeconds: 60,
  backoff: (attempt) => [60, 300, 1800, 7200][attempt - 1] ?? 28_800,
  async handle(job) {
    const plugin = job.payload.plugin as string;

    const loaded = await withOrg(job.orgId, async (tx) => {
      const [event] = await tx
        .select()
        .from(events)
        .where(and(eq(events.orgId, job.orgId), eq(events.id, job.payload.eventId as string)))
        .limit(1);

      const [target] = await tx
        .select({ scopes: pluginInstallations.grantedScopes, manifest: plugins.manifest })
        .from(pluginInstallations)
        .innerJoin(plugins, eq(plugins.name, pluginInstallations.plugin))
        .where(
          and(
            eq(pluginInstallations.orgId, job.orgId),
            eq(pluginInstallations.plugin, plugin),
            eq(pluginInstallations.status, 'active'),
            eq(plugins.status, 'active'),
          ),
        )
        .limit(1);

      return { event, target };
    });

    const url = loaded.target?.manifest?.api?.url;

    // Uninstalled, suspended, scopes taken away, or the event is gone: nothing to send.
    if (!loaded.event || !url || !pluginMaySee(plugin, loaded.target!.scopes, loaded.event)) return;

    const body = JSON.stringify({
      id: loaded.event.id,
      type: loaded.event.type,
      organizationId: job.orgId,
      createdAt: loaded.event.createdAt.toISOString(),
      data: toEventDto(loaded.event),
    });

    const token = await signJwt(
      { org: job.orgId, event: loaded.event.id, sha: bodyDigest(body) },
      {
        typ: CORE_EVENT_TYP,
        audience: plugin,
        subject: `event:${loaded.event.id}`,
        expiresInSeconds: 300,
      },
    );

    const response = await postOutbound(`${url.replace(/\/+$/, '')}/events`, body, {
      'Content-Type': 'application/json',
      'User-Agent': 'erxes-events/1',
      Authorization: `Bearer ${token}`,
      'Idempotency-Key': loaded.event.id,
      'Erxes-Event-Id': loaded.event.id,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`${plugin} answered ${response.status}: ${response.body.slice(0, 300)}`);
    }
  },
  async onDead(job, error) {
    log.error('a plugin never accepted an event', {
      plugin: job.payload.plugin,
      event: job.payload.eventId,
      error,
    });
  },
};
