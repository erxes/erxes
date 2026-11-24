import { type AutomationDefinition, CoreEvent } from '@erxes/core-contract';
import {
  automationRuns,
  automations,
  type Db,
  type events,
  newId,
  savepoint,
} from '@erxes/core-db';
import { and, eq, gt, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { inOrder } from '~/lib/sequence';
import type { EventConsumer } from '~/modules/events/consumers';
import { enqueueJobs } from '~/modules/jobs/jobs';
import { checkersByMember } from './conditionCheck';
import { nextCursor, stepAt } from './cursor';
import { rememberEventData, rememberTriggerData } from './eventData';
import { findHookSubject } from './hookSubject';
import { advanceJob, continueAfter, definitionsOf, finishRun, log, type SubjectRef } from './runs';
import { type Subject, subjectOf } from './subjects';

type AutomationRow = typeof automations.$inferSelect;

type EventRow = typeof events.$inferSelect;

/** Automations started by events that automations caused stop this deep. */
export const MAX_CHAIN_DEPTH = 5;

export interface RunStart {
  eventId: string;
  eventType: string;
  subject: SubjectRef | null;
  event: Record<string, unknown>;
  depth?: number;
  /** The subject as the caller loaded it (null: none, or it is gone). */
  loaded: Subject | null;
}

/** The records that already went through the automation, as its re-entry rule counts. */
const enteredBefore = async (
  tx: Db,
  automationId: string,
  reentry: AutomationDefinition['reentry'],
  subjectIds: string[],
) => {
  if (reentry === 'always' || !subjectIds.length) return new Set<string | null>();

  const earlier = await tx
    .selectDistinct({ subjectId: automationRuns.subjectId })
    .from(automationRuns)
    .where(
      and(
        eq(automationRuns.automationId, automationId),
        inArray(automationRuns.subjectId, subjectIds),
        reentry === 'daily'
          ? gt(automationRuns.startedAt, sql`now() - interval '1 day'`)
          : undefined,
      ),
    );

  return new Set(earlier.map((row) => row.subjectId));
};

/** How many of `wanted` runs the hourly limit leaves room for; counts the rest as skipped on the automation. */
const hourlyRoom = async (
  tx: Db,
  automationId: string,
  limit: number | undefined,
  wanted: number,
) => {
  if (!limit || !wanted) return wanted;

  const [recent] = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(automationRuns)
    .where(
      and(
        eq(automationRuns.automationId, automationId),
        gt(automationRuns.startedAt, sql`now() - interval '1 hour'`),
      ),
    );

  const room = Math.max(0, limit - (recent?.count ?? 0));
  const skipped = wanted - Math.min(room, wanted);

  if (skipped)
    await tx
      .update(automations)
      .set({
        state: sql`jsonb_set(${automations.state}, '{skippedByLimit}', to_jsonb(coalesce((${automations.state}->>'skippedByLimit')::int, 0) + ${skipped}))`,
      })
      .where(eq(automations.id, automationId));

  return room;
};

/**
 * Starts one automation's runs, in the starts' order, except for records that
 * already went through (re-entry), starts past the hourly limit, and starts
 * that already happened (same `eventId`). A few statements for any number.
 */
export const startRuns = async (
  tx: Db,
  automation: AutomationRow,
  definition: AutomationDefinition,
  starts: RunStart[],
) => {
  const version = automation.activeVersion;

  if (!version || !starts.length) return [];

  // One automation's starts go one at a time (event jobs run side by side): the
  // next waits for this transaction, then re-entry and the hourly limit count its runs.
  await tx
    .select({ id: automations.id })
    .from(automations)
    .where(eq(automations.id, automation.id))
    .for('update');

  const entered = await enteredBefore(
    tx,
    automation.id,
    definition.reentry,
    starts.flatMap((start) => (start.subject ? [start.subject.id] : [])),
  );

  const started = await tx
    .select({ eventId: automationRuns.eventId })
    .from(automationRuns)
    .where(
      and(
        eq(automationRuns.automationId, automation.id),
        inArray(
          automationRuns.eventId,
          starts.map((start) => start.eventId),
        ),
      ),
    );

  // Starts that already happened, and repeats within `starts` (first wins), take
  // no room under the hourly limit.
  const eventIds = new Set(started.map((run) => run.eventId));

  const fresh = starts.filter((start) => {
    const subjectId = definition.reentry === 'always' ? undefined : start.subject?.id;

    if (eventIds.has(start.eventId) || (subjectId && entered.has(subjectId))) return false;

    eventIds.add(start.eventId);

    if (subjectId) entered.add(subjectId);

    return true;
  });

  const room = await hourlyRoom(tx, automation.id, definition.maxRunsPerHour, fresh.length);
  const allowed = fresh.slice(0, room);

  if (!allowed.length) return [];

  const runs = await tx
    .insert(automationRuns)
    .values(
      allowed.map((start) => ({
        id: newId(),
        automationId: automation.id,
        version,
        eventId: start.eventId,
        eventType: start.eventType,
        subjectType: start.subject?.type ?? null,
        subjectId: start.subject?.id ?? null,
        context: { event: start.event, subject: start.loaded, steps: {} },
        depth: start.depth ?? 0,
      })),
    )
    .onConflictDoNothing()
    .returning();

  await enqueueJobs(
    tx,
    runs.map((run) => advanceJob(run, [0])),
  );

  return runs;
};

export const startRun = async (
  tx: Db,
  automation: AutomationRow,
  definition: AutomationDefinition,
  start: RunStart,
) => (await startRuns(tx, automation, definition, [start]))[0] ?? null;

/** Records from a quiet import (the import's own choice) start nothing. */
const QuietImport = z
  .object({ _import: z.object({ quiet: z.boolean() }) })
  .transform(({ _import: mark }) => mark.quiet);

const startTriggered = async (tx: Db, event: EventRow, dto: CoreEvent) => {
  const candidates = await tx
    .select()
    .from(automations)
    .where(and(eq(automations.status, 'active'), eq(automations.triggerEvent, event.type)))
    // In one order everywhere, so startRuns' row locks never deadlock.
    .orderBy(automations.id);

  if (!candidates.length) return;

  const [cause] = event.causedByRun
    ? await tx
        .select({ automationId: automationRuns.automationId })
        .from(automationRuns)
        .where(eq(automationRuns.id, event.causedByRun))
        .limit(1)
    : [];

  const subject = await subjectOf(tx, event.subjectType, event.subjectId);
  const context = { event: dto, subject, steps: {} };
  const ref = subjectRefOf(event);

  // Never an automation's own events.
  const eligible = candidates.flatMap((automation) =>
    automation.activeVersion && cause?.automationId !== automation.id
      ? [{ automation, version: automation.activeVersion }]
      : [],
  );

  const definitions = await definitionsOf(
    tx,
    eligible.map(({ automation, version }) => ({ automationId: automation.id, version })),
  );

  const checkerOf = checkersByMember(tx, event.orgId);

  // Each automation checks its conditions, then its own re-entry and hourly limit, in turn on
  // one transaction.
  await inOrder(eligible, async ({ automation, version }) => {
    const definition = definitions.get(automation.id, version);

    const trigger = definition?.trigger;

    if (!definition || (trigger?.kind !== 'event' && trigger?.kind !== 'app')) return;

    if (trigger.kind === 'app' && automation.subscriptionId !== event.entityId) return;

    if (trigger.kind === 'app') await rememberTriggerData(tx, automation.id, event.payload);

    const found =
      trigger.kind === 'app' && trigger.subject
        ? await findHookSubject(tx, trigger.subject, { event: dto })
        : null;

    if (trigger.kind === 'app' && trigger.subject && !found) return;

    const own = found ? { type: found.type, id: found.id } : ref;
    const loaded = found ?? subject;

    const matched = await conditionsHold(
      () =>
        checkerOf(automation.activatedBy).holds(own, trigger.conditions, {
          ...context,
          subject: loaded,
        }),
      { automation: automation.id, event: event.id },
    );

    if (!matched) return;

    await startRun(tx, automation, definition, {
      eventId: event.id,
      eventType: event.type,
      subject: own,
      event: dto,
      depth: event.depth,
      loaded,
    });
  });
};

/** The record an event is about, if any. */
const subjectRefOf = (event: EventRow) =>
  event.subjectType && event.subjectId ? { type: event.subjectType, id: event.subjectId } : null;

/**
 * Whether an automation's conditions hold, checked in a savepoint: conditions that can't be
 * checked (a value the field can't take, the member who turned it on is gone) count as not
 * holding for this one automation, logged, and leave the event's other automations be.
 */
export const conditionsHold = async (
  check: () => Promise<boolean>,
  facts: Record<string, string>,
) => {
  try {
    return await savepoint(check);
  } catch (error) {
    log.warn({ ...facts, err: error }, 'automation conditions could not be checked');

    return false;
  }
};

/**
 * Runs waiting on this record: ends those whose goal this change met, and
 * resumes those waiting for this event.
 */
const resumeWaiting = async (tx: Db, event: EventRow, subjectId: string, dto: CoreEvent) => {
  const waiting = await tx
    .select()
    .from(automationRuns)
    .where(and(eq(automationRuns.subjectId, subjectId), eq(automationRuns.status, 'waiting')))
    // Waits for a run another event's job or a step holds (never skips it, or this
    // event would pass it by), in one order so two events' jobs never deadlock.
    .orderBy(automationRuns.id)
    .for('update');

  if (!waiting.length) return;

  const definitions = await definitionsOf(tx, waiting);

  // Every run here is about this one record id: read it once per record type.
  const subjects = new Map<string | null, Subject | null>();

  await inOrder(new Set(waiting.map((run) => run.subjectType)), async (type) => {
    subjects.set(type, await subjectOf(tx, type, subjectId));
  });

  const owners = await tx
    .select({ id: automations.id, activatedBy: automations.activatedBy })
    .from(automations)
    .where(
      inArray(
        automations.id,
        waiting.map((run) => run.automationId),
      ),
    );

  const checkerOf = checkersByMember(tx, event.orgId);

  // Each run advances on its own (finished, or past its wait), in turn on one transaction.
  await inOrder(waiting, async (run) => {
    const definition = definitions.get(run.automationId, run.version);

    if (!definition) return;

    const context = { ...run.context, subject: subjects.get(run.subjectType) ?? null };
    const step = stepAt(definition.steps, run.cursor);
    const awaited = run.waitEvent === event.type && step?.type === 'wait_for' ? step : null;
    const activatedBy = owners.find((owner) => owner.id === run.automationId)?.activatedBy ?? null;

    const ref =
      run.subjectType && run.subjectId ? { type: run.subjectType, id: run.subjectId } : null;

    // The goal, and the awaited event's conditions, in one check.
    const [goalMet, arrived] = await savepoint(() =>
      checkerOf(activatedBy).check(ref, [
        { group: definition.goal, context },
        { group: awaited?.conditions, context: { ...context, event: dto } },
      ]),
    ).catch((error: unknown) => {
      log.warn(
        { run: run.id, event: event.id, err: error },
        'a waiting run’s conditions could not be checked; it waits on',
      );

      return [false, false];
    });

    if (definition.goal && goalMet) {
      await finishRun(tx, run.id, 'succeeded', { goal: true, context });

      return;
    }

    if (!awaited || !arrived) return;

    await continueAfter(tx, run, awaited, context, {
      input: null,
      output: { matched: true, event: dto },
      next: nextCursor(definition.steps, run.cursor),
      attempt: 1,
      startedAt: new Date(),
    });
  });
};

/**
 * The event stream into automations: resumes and ends waiting runs about the
 * event's record, and starts runs of active automations it triggers (their
 * conditions holding; chains stop at depth 5).
 */
export const automationsConsumer: EventConsumer = {
  name: 'core.automations',
  async handle(tx, event: EventRow) {
    const dto = CoreEvent.parse(event);

    await rememberEventData(tx, event);

    if (event.subjectId) await resumeWaiting(tx, event, event.subjectId, dto);

    if (event.depth >= MAX_CHAIN_DEPTH) {
      log.warn(
        { event: event.id, depth: event.depth },
        'automation chain too deep; not starting more',
      );

      return;
    }

    if (QuietImport.safeParse(event.payload).data) return;

    await startTriggered(tx, event, dto);
  },
};
