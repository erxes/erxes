import type { CoreEvent, CursorQuery, EventInput } from '@erxes/core-contract';
import { type Db, events, newId } from '@erxes/core-db';
import { and, eq, like, sql } from 'drizzle-orm';
import { type Actor, type Caller, type PluginCaller, requireManager } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { assertMember, assertPluginNamespace } from '~/lib/guards';
import { keysetPage } from '~/lib/keyset';
import { assertTarget } from '~/modules/activities/activities.service';

type EventRow = typeof events.$inferSelect;

export const toEventDto = (row: EventRow): CoreEvent => ({
  id: row.id,
  source: row.source,
  type: row.type,
  version: row.version,
  subject: row.subjectType && row.subjectId ? { type: row.subjectType, id: row.subjectId } : null,
  entity: row.entityType && row.entityId ? { type: row.entityType, id: row.entityId } : null,
  actor: { type: row.actorType, id: row.actorId },
  payload: row.payload,
  summary: row.summary,
  link: row.link,
  occurredAt: row.occurredAt.toISOString(),
  createdAt: row.createdAt.toISOString(),
});

export interface CoreEventInput {
  type: string;
  subject?: { type: 'customer' | 'company'; id: string };
  entity?: { type: string; id: string };
  payload?: Record<string, unknown>;
}

/**
 * Core publishes its own events (`core.customer.created`, …) in the same
 * transaction as the change, for automations and webhooks to come.
 */
export const publishCoreEvents = async (client: Db, caller: Caller, inputs: CoreEventInput | CoreEventInput[]) => {
  const list = Array.isArray(inputs) ? inputs : [inputs];

  if (!list.length) {
    return;
  }

  await client.insert(events).values(
    list.map((input) => ({
      id: newId(),
      orgId: caller.orgId,
      source: 'core',
      type: input.type,
      subjectType: input.subject?.type ?? null,
      subjectId: input.subject?.id ?? null,
      entityType: input.entity?.type ?? null,
      entityId: input.entity?.id ?? null,
      actorType: caller.actorType,
      actorId: caller.actorId,
      payload: input.payload ?? {},
    })),
  );
};

/**
 * A plugin publishes events over HTTP (plugins on core's database use
 * `core_publish_event()` in their own transaction instead). Each event is
 * checked here, so mistakes come back as errors rather than being dropped.
 */
export const publishPluginEvents = async (client: Db, caller: PluginCaller, inputs: EventInput[]) => {
  for (const input of inputs) {
    assertPluginNamespace(caller.plugin, input.type);

    if (input.subject) {
      await assertTarget(client, caller.orgId, input.subject.type, input.subject.id);
    }

    if (input.summary && !input.subject) {
      throw new HttpError(400, 'SUBJECT_REQUIRED', 'A timeline summary needs a subject (customer or company)');
    }

    await assertMember(client, caller.orgId, input.actorUserId);
  }

  const inserted = await client
    .insert(events)
    .values(
      inputs.map((input) => ({
        id: newId(),
        orgId: caller.orgId,
        source: caller.plugin,
        type: input.type,
        version: input.version,
        subjectType: input.subject?.type ?? null,
        subjectId: input.subject?.id ?? null,
        entityType: input.entity?.type ?? null,
        entityId: input.entity?.id ?? null,
        actorType: input.actorUserId ? ('user' as const) : ('plugin' as const),
        actorId: input.actorUserId ?? caller.plugin,
        payload: input.payload,
        summary: input.summary ?? null,
        link: input.link ?? null,
        notify: input.notify ?? null,
        dedupeKey: input.dedupeKey ?? null,
        occurredAt: input.occurredAt ? new Date(input.occurredAt) : sql`now()`,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: events.id });

  return { published: inserted.length, duplicates: inputs.length - inserted.length };
};

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export const listEvents = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & { source?: string; type?: string; subjectType?: 'customer' | 'company'; subjectId?: string },
) => {
  requireManager(actor, 'Only owners and admins can see the event stream');

  const filters = and(
    query.source ? eq(events.source, query.source) : undefined,
    query.type
      ? /[.*]$/.test(query.type)
        ? like(events.type, `${escapeLike(query.type.replace(/\*$/, ''))}%`)
        : eq(events.type, query.type)
      : undefined,
    query.subjectType ? eq(events.subjectType, query.subjectType) : undefined,
    query.subjectId ? eq(events.subjectId, query.subjectId) : undefined,
  );
  const page = await keysetPage(
    client,
    { table: events, id: events.id, createdAt: events.createdAt, scope: eq(events.orgId, actor.orgId), countCap: 10_000 },
    filters,
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(events)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  return { ...page, data: page.data.map(toEventDto) };
};

