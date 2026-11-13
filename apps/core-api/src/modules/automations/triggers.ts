import type { Audience, AutomationDefinition, ConditionGroup } from '@erxes/core-contract';
import { automations, type Db, newId, withSystem } from '@erxes/core-db';
import { and, eq, lte, type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { inOrder } from '~/lib/sequence';
import { valuesTable } from '~/modules/fields/fieldValues';
import { defineJob } from '~/modules/jobs/jobs';
import { evaluateGroup } from './conditions';
import { startRun, startRuns } from './consumer';
import { definitionOf, log } from './runs';
import { nextOccurrence, zonedDate } from './schedule';
import { loadSubjects, SUBJECT_PAGE, type Subject, type SubjectType } from './subjects';

type AutomationRow = typeof automations.$inferSelect;

type DateTrigger = Extract<AutomationDefinition['trigger'], { kind: 'date' }>;

/** What `core_automations.trigger_event` holds: the event type, or the trigger's kind. */
export const triggerKey = (definition: AutomationDefinition) =>
  definition.trigger.kind === 'event' ? definition.trigger.event : `${definition.trigger.kind}:`;

/** When a scheduled or date trigger first fires (null for the others). */
export const firstRunAt = (definition: AutomationDefinition, now = new Date()) =>
  definition.trigger.kind === 'schedule' || definition.trigger.kind === 'date'
    ? nextOccurrence(definition.trigger, now)
    : null;

/** Which records one firing starts, and how each one's run starts. */
interface Enrollment {
  type: SubjectType;
  where: SQL;
  conditions: ConditionGroup | undefined;
  eventType: string;
  startOf: (subject: Subject) => { eventId: string; event: Record<string, unknown> };
}

const audienceEnrollment = (
  audience: Audience,
  startKey: string,
  event: { type: string; occurredAt: string; payload: Record<string, unknown> },
): Enrollment => ({
  type: audience.type,
  where: sql`true`,
  conditions: audience.conditions,
  eventType: event.type,
  startOf: (subject) => ({ eventId: `${startKey}:${subject.id}`, event }),
});

const CustomFields = z.record(z.string(), z.unknown());

/** The records whose date (moved by the offset) is today in the trigger's time zone. */
const dateEnrollment = (trigger: DateTrigger, at: string): Enrollment => {
  const today = zonedDate(new Date(at), trigger.timezone);
  // The record's date + offset = today → the record's date = today − offset.
  const target = new Date(Date.UTC(today.year, today.month - 1, today.day - trigger.offsetDays));
  const iso = target.toISOString().slice(0, 10);
  const day = new Date(Date.UTC(today.year, today.month - 1, today.day)).toISOString().slice(0, 10);

  const column =
    trigger.field === 'birthDate' && trigger.subject === 'customer'
      ? sql`r.birth_date::text`
      : sql`(select to_char(v.date_value, 'YYYY-MM-DD') from ${valuesTable(trigger.subject)} v where v.record_id = r.id and v.field_id = ${trigger.field} and v.date_value is not null limit 1)`;

  const payload = { field: trigger.field, offsetDays: trigger.offsetDays, day };

  return {
    type: trigger.subject,
    where: trigger.yearly
      ? sql`substr(${column}, 6, 5) = ${iso.slice(5)}`
      : sql`substr(${column}, 1, 10) = ${iso}`,
    conditions: trigger.conditions,
    eventType: 'date',
    startOf: (subject) => ({
      eventId: `date:${day}:${subject.id}`,
      event: {
        type: 'date',
        occurredAt: at,
        payload: {
          ...payload,
          date:
            trigger.field === 'birthDate'
              ? subject.birthDate
              : CustomFields.safeParse(subject.customFields).data?.[trigger.field],
        },
      },
    }),
  };
};

/** Starts runs for one page of an enrollment's records (after `after`, in id order). */
const enrollPage = async (
  tx: Db,
  automation: AutomationRow,
  definition: AutomationDefinition,
  enrollment: Enrollment,
  page: { after?: string; limit?: number } = {},
) => {
  const subjects = await loadSubjects(
    tx,
    automation.orgId,
    enrollment.type,
    enrollment.where,
    page,
  );

  const starts = subjects.flatMap((subject) => {
    const { eventId, event } = enrollment.startOf(subject);

    return evaluateGroup(enrollment.conditions, { event, subject, steps: {} })
      ? [
          {
            eventId,
            eventType: enrollment.eventType,
            subject: { type: enrollment.type, id: subject.id },
            event,
            loaded: subject,
          },
        ]
      : [];
  });

  const runs = await startRuns(tx, automation, definition, starts);
  const last = subjects.at(-1)?.id;

  return {
    started: runs.length,
    skipped: subjects.length - runs.length,
    next: last && subjects.length === (page.limit ?? SUBJECT_PAGE) ? last : null,
  };
};

const FirePayload = z.object({
  automationId: z.string(),
  /** When it was due (or started by a member). */
  scheduledFor: z.string(),
  /** A member's start: its key. Scheduled and date firings are keyed by `scheduledFor`. */
  manualKey: z.string().optional(),
  /** The next page starts after this record id. */
  after: z.string().optional(),
});

type FirePayload = z.infer<typeof FirePayload>;

const enrollmentFor = (definition: AutomationDefinition, payload: FirePayload) => {
  const { trigger } = definition;
  const at = payload.scheduledFor;

  if (trigger.kind === 'date') return dateEnrollment(trigger, at);

  if (trigger.kind !== 'schedule' && trigger.kind !== 'manual') return null;

  if (!trigger.audience) return null;

  if (payload.manualKey)
    return audienceEnrollment(trigger.audience, payload.manualKey, {
      type: 'manual',
      occurredAt: at,
      payload: {},
    });

  return trigger.kind === 'schedule'
    ? audienceEnrollment(trigger.audience, `schedule:${at}`, {
        type: 'schedule',
        occurredAt: at,
        payload: { every: trigger.every },
      })
    : null;
};

/**
 * One firing of a scheduled, date or member-started automation, a page of its
 * records per job: each page queues the next, so any audience size is enrolled.
 */
export const fireJob = defineJob({
  queue: 'automation.fire',
  payload: FirePayload,
  atomic: true,
  leaseSeconds: 600,
  async handle(job, tx) {
    const [automation] = await tx
      .select()
      .from(automations)
      .where(eq(automations.id, job.payload.automationId))
      .limit(1);

    if (automation?.status !== 'active' || !automation.activeVersion) return;

    const definition = await definitionOf(tx, automation.id, automation.activeVersion);

    if (!definition) return;

    const { trigger } = definition;

    if (trigger.kind === 'schedule' && !trigger.audience) {
      const at = job.payload.scheduledFor;

      await startRun(tx, automation, definition, {
        eventId: `schedule:${at}`,
        eventType: 'schedule',
        subject: null,
        event: { type: 'schedule', occurredAt: at, payload: { every: trigger.every } },
        loaded: null,
      });

      return;
    }

    const enrollment = enrollmentFor(definition, job.payload);

    if (!enrollment) return;

    const page = await enrollPage(tx, automation, definition, enrollment, job.payload);

    if (page.next) await queueFire(tx, automation, { ...job.payload, after: page.next });
  },
});

const queueFire = (tx: Db, automation: AutomationRow, payload: FirePayload) =>
  fireJob.enqueue(tx, {
    orgId: automation.orgId,
    payload,
    dedupeKey: [automation.id, payload.manualKey ?? payload.scheduledFor, payload.after]
      .filter(Boolean)
      .join(':'),
  });

/**
 * Every minute: scheduled and date automations that are due get their next
 * time set (claimed, so one server fires them) and a firing queued. Each in
 * its own savepoint, so one that fails doesn't stop the others.
 */
export const tickAutomations = () =>
  withSystem('automations: schedule', async (tx) => {
    const due = await tx
      .select()
      .from(automations)
      .where(and(eq(automations.status, 'active'), lte(automations.nextRunAt, sql`now()`)))
      .for('update', { skipLocked: true })
      .limit(200);

    // One savepoint after another on this transaction.
    await inOrder(due, (automation) => {
      const scheduledFor = automation.nextRunAt;

      return tx
        .transaction(async (savepoint) => {
          const definition = automation.activeVersion
            ? await definitionOf(savepoint, automation.id, automation.activeVersion)
            : null;

          if (!definition || !scheduledFor) return;

          await savepoint
            .update(automations)
            .set({ nextRunAt: firstRunAt(definition, new Date()) })
            .where(eq(automations.id, automation.id));
          await queueFire(savepoint, automation, {
            automationId: automation.id,
            scheduledFor: scheduledFor.toISOString(),
          });
        })
        .catch((error: unknown) =>
          log.error({ automation: automation.id, err: error }, 'could not schedule an automation'),
        );
    });

    return due.length;
  });

/**
 * A member starts an automation now: on the given records, or on its
 * audience (the first page now, the rest in the background: `continuing`).
 */
export const startNow = async (
  tx: Db,
  automation: AutomationRow,
  definition: AutomationDefinition,
  subjects?: string[],
) => {
  const manualKey = `manual:${newId()}`;
  const scheduledFor = new Date().toISOString();
  const event = { type: 'manual', occurredAt: scheduledFor, payload: {} };
  const { trigger } = definition;

  const audience =
    trigger.kind === 'manual' || trigger.kind === 'schedule' ? trigger.audience : undefined;

  if (subjects?.length) {
    const chosen = audienceEnrollment(audience ?? { type: 'customer' }, manualKey, event);

    const page = await enrollPage(
      tx,
      automation,
      definition,
      {
        ...chosen,
        where: sql`r.id in (${sql.join(
          subjects.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      },
      { limit: subjects.length },
    );

    return { started: page.started, skipped: page.skipped, continuing: false };
  }

  if (audience) {
    const enrollment = audienceEnrollment(audience, manualKey, event);
    const page = await enrollPage(tx, automation, definition, enrollment);

    if (page.next)
      await queueFire(tx, automation, {
        automationId: automation.id,
        scheduledFor,
        manualKey,
        after: page.next,
      });

    return { started: page.started, skipped: page.skipped, continuing: page.next !== null };
  }

  const run = await startRun(tx, automation, definition, {
    eventId: manualKey,
    eventType: 'manual',
    subject: null,
    event,
    loaded: null,
  });

  return { started: run ? 1 : 0, skipped: run ? 0 : 1, continuing: false };
};
