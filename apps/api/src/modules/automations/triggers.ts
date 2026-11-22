import type { Audience, AutomationDefinition, ConditionGroup } from '@erxes/core-contract';
import { automations, customers, type Db, newId, withOrg, withSystem } from '@erxes/core-db';
import { and, eq, inArray, isNotNull, lte, type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { addDays, isoDay, orgTimezone, zonedDate } from '~/lib/orgTime';
import { inOrder } from '~/lib/sequence';
import { valuesTable } from '~/modules/fields/fieldValues';
import { defineJob } from '~/modules/jobs/jobs';
import { automationChecker } from './conditionCheck';
import { dateConditions } from './conditions';
import { startRun, startRuns } from './consumer';
import { definitionOf, log } from './runs';
import { nextOccurrence } from './schedule';
import {
  loadSubjects,
  SUBJECT_PAGE,
  SUBJECT_TABLES,
  type Subject,
  type SubjectType,
} from './subjects';

type AutomationRow = typeof automations.$inferSelect;

type DateTrigger = Extract<AutomationDefinition['trigger'], { kind: 'date' }>;

/** What `core_automations.trigger_event` holds: the event type, or the trigger's kind. */
export const triggerKey = (definition: AutomationDefinition) =>
  definition.trigger.kind === 'event' ? definition.trigger.event : `${definition.trigger.kind}:`;

/** When a scheduled or date trigger next fires on the organisation's clock (null for the others). */
export const firstRunAt = (definition: AutomationDefinition, timeZone: string, now = new Date()) =>
  definition.trigger.kind === 'schedule' || definition.trigger.kind === 'date'
    ? nextOccurrence(definition.trigger, timeZone, now)
    : null;

/**
 * The organisation's time zone changed: its active scheduled and date
 * automations get their next time on the new clock, in the caller's scope.
 */
export const rescheduleAutomations = async (tx: Db, timeZone: string) => {
  const timed = await tx
    .select({ id: automations.id, activeVersion: automations.activeVersion })
    .from(automations)
    .where(and(eq(automations.status, 'active'), isNotNull(automations.nextRunAt)));

  await inOrder(timed, async (automation) => {
    const definition = automation.activeVersion
      ? await definitionOf(tx, automation.id, automation.activeVersion)
      : null;

    if (!definition) return;

    await tx
      .update(automations)
      .set({ nextRunAt: firstRunAt(definition, timeZone) })
      .where(eq(automations.id, automation.id));
  });
};

/** An event a firing starts runs with. */
type FiringEvent = { type: string; occurredAt: string; payload: Record<string, unknown> };

/** Which records one firing starts, and how each one's run starts. */
interface Enrollment {
  type: SubjectType;
  /** Which records, before the conditions (undefined: all). */
  where: SQL | undefined;
  /** On the records' fields, and the firing's event (the same for every record). */
  conditions: ConditionGroup | undefined;
  event: FiringEvent;
  startOf: (subject: Subject) => { eventId: string; event: Record<string, unknown> };
}

const audienceEnrollment = (
  audience: Audience,
  startKey: string,
  event: FiringEvent,
): Enrollment => ({
  type: audience.type,
  where: undefined,
  conditions: audience.conditions,
  event,
  startOf: (subject) => ({ eventId: `${startKey}:${subject.id}`, event }),
});

const CustomFields = z.record(z.string(), z.unknown());

/** Month * 100 + day of a `YYYY-MM-DD` day, as the birthday and value month-day columns hold it. */
const monthDayOf = (iso: string) => Number(iso.slice(5, 7)) * 100 + Number(iso.slice(8, 10));

/** The records whose date is `iso` (any year: its month and day), through the date's index. */
const onDate = (trigger: DateTrigger, iso: string): SQL => {
  if (trigger.field === 'birthDate' && trigger.subject === 'customer')
    return trigger.yearly
      ? sql`${customers.birthMonthDay} = ${monthDayOf(iso)}`
      : sql`${customers.birthDate} = ${iso}::date`;

  const v = valuesTable(trigger.subject);

  const day = trigger.yearly
    ? sql`${v.monthDay} = ${monthDayOf(iso)}`
    : sql`${v.dateValue} = ${iso}::date`;

  return sql`exists (select 1 from ${v} where ${v.recordId} = ${SUBJECT_TABLES[trigger.subject].id} and ${v.fieldId} = ${trigger.field} and ${v.dateValue} is not null and ${day})`;
};

/** The records whose date (moved by the offset) is today in the organisation's time zone. */
const dateEnrollment = (trigger: DateTrigger, at: string, timeZone: string): Enrollment => {
  const today = zonedDate(new Date(at), timeZone);
  // The record's date + offset = today → the record's date = today − offset.
  const iso = isoDay(addDays(today, -trigger.offsetDays));
  const day = isoDay(today);

  const payload = { field: trigger.field, offsetDays: trigger.offsetDays, day };
  const event = { type: 'date', occurredAt: at, payload };

  return {
    type: trigger.subject,
    where: onDate(trigger, iso),
    conditions: dateConditions(trigger),
    event,
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
  // The conditions are part of the query: a page holds only records that match them.
  const conditions = await automationChecker(tx, automation).where(
    enrollment.type,
    enrollment.conditions,
    { event: enrollment.event, steps: {} },
  );

  const subjects = await loadSubjects(tx, enrollment.type, and(enrollment.where, conditions), page);

  const starts = subjects.map((subject) => {
    const { eventId, event } = enrollment.startOf(subject);

    return {
      eventId,
      eventType: enrollment.event.type,
      subject: { type: enrollment.type, id: subject.id },
      event,
      loaded: subject,
    };
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

const enrollmentFor = async (tx: Db, definition: AutomationDefinition, payload: FirePayload) => {
  const { trigger } = definition;
  const at = payload.scheduledFor;

  if (trigger.kind === 'date') return dateEnrollment(trigger, at, await orgTimezone(tx));

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
  timeoutSeconds: 600,
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

    const enrollment = await enrollmentFor(tx, definition, job.payload);

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

      return withOrg(automation.orgId, async (sp) => {
        const definition = automation.activeVersion
          ? await definitionOf(sp, automation.id, automation.activeVersion)
          : null;

        if (!definition || !scheduledFor) return;

        await sp
          .update(automations)
          .set({ nextRunAt: firstRunAt(definition, await orgTimezone(sp), new Date()) })
          .where(eq(automations.id, automation.id));
        await queueFire(sp, automation, {
          automationId: automation.id,
          scheduledFor: scheduledFor.toISOString(),
        });
      }).catch((error: unknown) =>
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
      { ...chosen, where: inArray(SUBJECT_TABLES[chosen.type].id, subjects) },
      { limit: subjects.length },
    );

    // Those that don't match the audience are skipped too.
    return { started: page.started, skipped: subjects.length - page.started, continuing: false };
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
