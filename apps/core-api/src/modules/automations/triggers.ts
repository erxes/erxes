import type { Audience, AutomationDefinition } from '@erxes/core-contract';
import { automations, type Db, newId, type Transaction, withSystem } from '@erxes/core-db';
import { customFieldsColumn, valuesTable } from '~/modules/fields/fieldValues';
import { and, eq, lte, sql } from 'drizzle-orm';
import { log } from '~/lib/log';
import { enqueueJob, type JobDefinition } from '~/modules/jobs/jobs';
import { evaluateGroup } from './conditions';
import { definitionOf, startRun } from './engine';
import { nextOccurrence, zonedDate } from './schedule';

type AutomationRow = typeof automations.$inferSelect;

/** At most this many records go through one scheduled or manual start. */
export const MAX_AUDIENCE = 10_000;

/** What `core_automations.trigger_event` holds: the event type, or the trigger's kind. */
export const triggerKey = (definition: AutomationDefinition) =>
  definition.trigger.kind === 'event' ? definition.trigger.event : `${definition.trigger.kind}:`;

/** When a scheduled or date trigger first fires (null for the others). */
export const firstRunAt = (definition: AutomationDefinition, now = new Date()) =>
  definition.trigger.kind === 'schedule' || definition.trigger.kind === 'date'
    ? nextOccurrence(definition.trigger, now)
    : null;

const camel = (row: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => key !== 'org_id' && key !== 'search_text')
      .map(([key, value]) => [
        key.replace(/_([a-z])/g, (_m, c: string) => c.toUpperCase()),
        value instanceof Date ? value.toISOString() : value,
      ]),
  );

/** Records of a type as conditions see them (`subject.*`), loaded in one go. */
export const loadSubjects = async (
  tx: Db,
  orgId: string,
  type: 'customer' | 'company',
  where = sql`true`,
) => {
  const table = type === 'customer' ? 'core_customers' : 'core_companies';
  const tags = type === 'customer' ? 'core_customer_tags' : 'core_company_tags';
  const result = await tx.execute<Record<string, unknown>>(sql`
    select r.*, coalesce((select array_agg(t.tag_id) from ${sql.identifier(tags)} t where t.org_id = r.org_id and ${sql.raw(`t.${type}_id`)} = r.id), '{}') as tag_ids,
      ${customFieldsColumn(type, sql`r.id`)} as custom_fields
    from ${sql.identifier(table)} r
    where r.org_id = ${orgId} and ${where}
    order by r.created_at
    limit ${MAX_AUDIENCE}
  `);

  return result.rows.map(
    (row) => ({ ...camel(row), type }) as unknown as Record<string, unknown> & { id: string },
  );
};

const enrollAudience = async (
  tx: Db,
  automation: AutomationRow,
  definition: AutomationDefinition,
  audience: Audience,
  startKey: string,
  event: Record<string, unknown>,
  ids?: string[],
) => {
  const subjects = await loadSubjects(
    tx,
    automation.orgId,
    audience.type,
    ids?.length
      ? sql`r.id in (${sql.join(
          ids.map((id) => sql`${id}`),
          sql`, `,
        )})`
      : sql`true`,
  );
  let started = 0;
  let skipped = 0;

  for (const subject of subjects) {
    if (!evaluateGroup(audience.conditions, { event, subject, steps: {} })) {
      skipped += 1;
      continue;
    }

    const run = await startRun(tx, automation, definition, {
      eventId: `${startKey}:${subject.id}`,
      eventType: event.type as string,
      subject: { type: audience.type, id: subject.id },
      event,
    });

    if (run) started += 1;
    else skipped += 1;
  }

  return { started, skipped };
};

/** The records whose date (moved by the offset) is today in the trigger's time zone. */
const dueByDate = async (
  tx: Db,
  automation: AutomationRow,
  trigger: Extract<AutomationDefinition['trigger'], { kind: 'date' }>,
  now: Date,
) => {
  const today = zonedDate(now, trigger.timezone);
  // The record's date + offset = today → the record's date = today − offset.
  const target = new Date(Date.UTC(today.year, today.month - 1, today.day - trigger.offsetDays));
  const iso = target.toISOString().slice(0, 10);
  const monthDay = iso.slice(5);
  const column =
    trigger.field === 'birthDate' && trigger.subject === 'customer'
      ? sql`r.birth_date::text`
      : sql`(select to_char(v.date_value, 'YYYY-MM-DD') from ${valuesTable(trigger.subject)} v where v.record_id = r.id and v.field_id = ${trigger.field} and v.date_value is not null limit 1)`;
  const match = trigger.yearly
    ? sql`substr(${column}, 6, 5) = ${monthDay}`
    : sql`substr(${column}, 1, 10) = ${iso}`;

  return {
    subjects: await loadSubjects(tx, automation.orgId, trigger.subject, match),
    day: `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`,
  };
};

/** One firing of a scheduled or date trigger (`automation.fire`, atomic). */
export const fireJob: JobDefinition = {
  queue: 'automation.fire',
  atomic: true,
  leaseSeconds: 600,
  async handle(job, tx) {
    const db = tx as Transaction;
    const [automation] = await db
      .select()
      .from(automations)
      .where(eq(automations.id, job.payload.automationId as string))
      .limit(1);

    if (!automation || automation.status !== 'active' || !automation.activeVersion) return;

    const definition = await definitionOf(db, automation.id, automation.activeVersion);
    const at = String(job.payload.scheduledFor);
    const trigger = definition?.trigger;

    if (!definition || !trigger) return;

    if (trigger.kind === 'schedule') {
      const event = { type: 'schedule', occurredAt: at, payload: { every: trigger.every } };

      if (trigger.audience)
        await enrollAudience(db, automation, definition, trigger.audience, `schedule:${at}`, event);
      else
        await startRun(db, automation, definition, {
          eventId: `schedule:${at}`,
          eventType: 'schedule',
          subject: null,
          event,
        });
    } else if (trigger.kind === 'date') {
      const { subjects, day } = await dueByDate(db, automation, trigger, new Date(at));
      const event = {
        type: 'date',
        occurredAt: at,
        payload: { field: trigger.field, offsetDays: trigger.offsetDays, day },
      };

      for (const subject of subjects) {
        if (!evaluateGroup(trigger.conditions, { event, subject, steps: {} })) continue;

        await startRun(db, automation, definition, {
          eventId: `date:${day}:${subject.id}`,
          eventType: 'date',
          subject: { type: trigger.subject, id: subject.id },
          event: {
            ...event,
            payload: {
              ...event.payload,
              date:
                trigger.field === 'birthDate'
                  ? subject.birthDate
                  : (subject.customFields as Record<string, unknown> | undefined)?.[trigger.field],
            },
          },
        });
      }
    }
  },
};

/**
 * Every minute: scheduled and date automations that are due get their next
 * time set (claimed, so one server fires them) and a firing queued.
 */
export const tickAutomations = () =>
  withSystem('automations: schedule', async (tx) => {
    const due = await tx
      .select()
      .from(automations)
      .where(and(eq(automations.status, 'active'), lte(automations.nextRunAt, sql`now()`)))
      .for('update', { skipLocked: true })
      .limit(200);

    for (const automation of due) {
      const definition = automation.activeVersion
        ? await definitionOf(tx, automation.id, automation.activeVersion)
        : null;
      const scheduledFor = automation.nextRunAt!;

      if (!definition) continue;

      try {
        await tx
          .update(automations)
          .set({ nextRunAt: firstRunAt(definition, new Date()) })
          .where(eq(automations.id, automation.id));
        await enqueueJob(tx, {
          orgId: automation.orgId,
          queue: 'automation.fire',
          payload: { automationId: automation.id, scheduledFor: scheduledFor.toISOString() },
          dedupeKey: `${automation.id}:${scheduledFor.toISOString()}`,
        });
      } catch (error) {
        log.error('could not schedule an automation', { automation: automation.id, error });
      }
    }

    return due.length;
  });

/** A member starts an automation now: on the given records, or on its audience. */
export const startNow = async (
  tx: Db,
  automation: AutomationRow,
  definition: AutomationDefinition,
  subjects?: string[],
) => {
  const startKey = `manual:${newId()}`;
  const event = { type: 'manual', occurredAt: new Date().toISOString(), payload: {} };
  const audience =
    definition.trigger.kind === 'manual' || definition.trigger.kind === 'schedule'
      ? definition.trigger.audience
      : undefined;

  if (subjects?.length) {
    return enrollAudience(
      tx,
      automation,
      definition,
      audience ?? { type: 'customer' },
      startKey,
      event,
      subjects,
    );
  }

  if (audience) return enrollAudience(tx, automation, definition, audience, startKey, event);

  const run = await startRun(tx, automation, definition, {
    eventId: startKey,
    eventType: 'manual',
    subject: null,
    event,
  });

  return { started: run ? 1 : 0, skipped: run ? 0 : 1 };
};
