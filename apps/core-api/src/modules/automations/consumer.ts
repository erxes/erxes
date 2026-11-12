import type { AutomationDefinition } from '@erxes/core-contract';
import { automationRuns, automations, type Db, type events, newId } from '@erxes/core-db';
import { and, desc, eq, gt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { log } from '~/lib/log';
import { toEventDto } from '~/modules/events/events.service';
import type { EventConsumer } from '~/modules/events/processor';
import { evaluateGroup } from './conditions';
import { nextCursor, stepAt } from './cursor';
import {
  continueAfter,
  definitionOf,
  finishRun,
  queueAdvance,
  type SubjectRef,
  subjectOf,
} from './runs';

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
}

/** Has this record already been through the automation, as its re-entry rule counts? */
const enteredBefore = async (
  tx: Db,
  automationId: string,
  reentry: AutomationDefinition['reentry'],
  subject: SubjectRef | null,
) => {
  if (reentry === 'always' || !subject) return false;

  const [earlier] = await tx
    .select({ id: automationRuns.id })
    .from(automationRuns)
    .where(
      and(
        eq(automationRuns.automationId, automationId),
        eq(automationRuns.subjectId, subject.id),
        reentry === 'daily'
          ? gt(automationRuns.startedAt, sql`now() - interval '1 day'`)
          : undefined,
      ),
    )
    .orderBy(desc(automationRuns.startedAt))
    .limit(1);

  return Boolean(earlier);
};

/** Over the hourly limit: counts the skip on the automation. */
const overHourlyLimit = async (tx: Db, automationId: string, limit: number | undefined) => {
  if (!limit) return false;

  const [recent] = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(automationRuns)
    .where(
      and(
        eq(automationRuns.automationId, automationId),
        gt(automationRuns.startedAt, sql`now() - interval '1 hour'`),
      ),
    );

  if ((recent?.count ?? 0) < limit) return false;

  await tx
    .update(automations)
    .set({
      state: sql`jsonb_set(${automations.state}, '{skippedByLimit}', to_jsonb(coalesce((${automations.state}->>'skippedByLimit')::int, 0) + 1))`,
    })
    .where(eq(automations.id, automationId));

  return true;
};

/**
 * Starts a run unless the record already went through (re-entry), the
 * hourly limit is reached, or this start already happened (same `eventId`).
 */
export const startRun = async (
  tx: Db,
  automation: AutomationRow,
  definition: AutomationDefinition,
  start: RunStart,
) => {
  if (
    !automation.activeVersion ||
    (await enteredBefore(tx, automation.id, definition.reentry, start.subject)) ||
    (await overHourlyLimit(tx, automation.id, definition.maxRunsPerHour))
  )
    return null;

  const subject = start.subject
    ? await subjectOf(tx, automation.orgId, start.subject.type, start.subject.id)
    : null;

  const [run] = await tx
    .insert(automationRuns)
    .values({
      id: newId(),
      orgId: automation.orgId,
      automationId: automation.id,
      version: automation.activeVersion,
      eventId: start.eventId,
      eventType: start.eventType,
      subjectType: start.subject?.type ?? null,
      subjectId: start.subject?.id ?? null,
      context: { event: start.event, subject, steps: {} },
      depth: start.depth ?? 0,
    })
    .onConflictDoNothing()
    .returning();

  if (run) await queueAdvance(tx, run, [0]);

  return run ?? null;
};

/** Records from a quiet import (the import's own choice) start nothing. */
const QuietImport = z
  .object({ _import: z.object({ quiet: z.boolean() }) })
  .transform(({ _import: mark }) => mark.quiet)
  .catch(false);

const startRuns = async (tx: Db, event: EventRow, dto: ReturnType<typeof toEventDto>) => {
  const candidates = await tx
    .select()
    .from(automations)
    .where(
      and(
        eq(automations.orgId, event.orgId),
        eq(automations.status, 'active'),
        eq(automations.triggerEvent, event.type),
      ),
    );

  if (!candidates.length) return;

  const [cause] = event.causedByRun
    ? await tx
        .select({ automationId: automationRuns.automationId })
        .from(automationRuns)
        .where(eq(automationRuns.id, event.causedByRun))
        .limit(1)
    : [];

  const subject = await subjectOf(tx, event.orgId, event.subjectType, event.subjectId);
  const context = { event: dto, subject, steps: {} };

  for (const automation of candidates) {
    // Never an automation's own events.
    if (!automation.activeVersion || cause?.automationId === automation.id) continue;

    const definition = await definitionOf(tx, automation.id, automation.activeVersion);

    if (
      definition?.trigger.kind !== 'event' ||
      !evaluateGroup(definition.trigger.conditions, context)
    )
      continue;

    await startRun(tx, automation, definition, {
      eventId: event.id,
      eventType: event.type,
      subject:
        event.subjectType && event.subjectId
          ? { type: event.subjectType, id: event.subjectId }
          : null,
      event: dto,
      depth: event.depth,
    });
  }
};

/**
 * Runs waiting on this record: ends those whose goal this change met, and
 * resumes those waiting for this event.
 */
const resumeWaiting = async (
  tx: Db,
  event: EventRow,
  subjectId: string,
  dto: ReturnType<typeof toEventDto>,
) => {
  const waiting = await tx
    .select()
    .from(automationRuns)
    .where(
      and(
        eq(automationRuns.orgId, event.orgId),
        eq(automationRuns.subjectId, subjectId),
        eq(automationRuns.status, 'waiting'),
      ),
    )
    .for('update', { skipLocked: true });

  for (const run of waiting) {
    const definition = await definitionOf(tx, run.automationId, run.version);

    if (!definition) continue;

    const subject = await subjectOf(tx, run.orgId, run.subjectType, run.subjectId);
    const context = { ...run.context, subject };

    if (definition.goal && evaluateGroup(definition.goal, context)) {
      await finishRun(tx, run.id, 'succeeded', { goal: true, context });
      continue;
    }

    const step = stepAt(definition.steps, run.cursor);

    if (
      run.waitEvent !== event.type ||
      step?.type !== 'wait_for' ||
      !evaluateGroup(step.conditions, { ...context, event: dto })
    )
      continue;

    await continueAfter(tx, run, step, context, {
      input: null,
      output: { matched: true, event: dto },
      next: nextCursor(definition.steps, run.cursor),
      attempt: 1,
      startedAt: new Date(),
    });
  }
};

/**
 * The event stream into automations: resumes and ends waiting runs about the
 * event's record, and starts runs of active automations it triggers (their
 * conditions holding; chains stop at depth 5).
 */
export const automationsConsumer: EventConsumer = {
  name: 'core.automations',
  async handle(tx, event: EventRow) {
    const dto = toEventDto(event);

    if (event.subjectId) await resumeWaiting(tx, event, event.subjectId, dto);

    if (event.depth >= MAX_CHAIN_DEPTH) {
      log.warn('automation chain too deep; not starting more', {
        event: event.id,
        depth: event.depth,
      });

      return;
    }

    if (QuietImport.parse(event.payload)) return;

    await startRuns(tx, event, dto);
  },
};
