import {
  AUTOMATION_STATUSES,
  CONTENT_TYPES,
  FINISHED_RUN_STATUSES,
  RUN_STATUSES,
  RUN_STEP_STATUSES,
} from '../enums';
import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import type { AutomationDefinition } from '../automationDefinition';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/**
 * An automation: a trigger (event type + conditions) and steps, in the shape of
 * `AutomationDefinition` (`../automationDefinition`), which the contract checks on the way in. `definition` is the working copy;
 * activating publishes it as a numbered version runs start from.
 */
export const automations = pgTable(
  'automations',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    name: text().notNull(),
    description: text(),
    status: text({ enum: AUTOMATION_STATUSES }).default('draft').notNull(),
    definition: jsonb().$type<AutomationDefinition>().notNull(),
    /** Copied from the definition for matching events quickly (`schedule:`, `date:`, `manual` for the others). */
    triggerEvent: text().notNull(),
    /** Scheduled and date triggers: when the next tick is due. */
    nextRunAt: timestamptz(),
    /** Working state: round-robin positions per step, runs skipped by the hourly limit. */
    state: jsonb()
      .$type<{ turns?: Record<string, number>; skippedByLimit?: number }>()
      .default({})
      .notNull(),
    activeVersion: integer(),
    /** The member it acts as: its actions need their permissions, checked at run time. */
    activatedBy: text(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_automations_trigger_idx')
      .on(table.orgId, table.triggerEvent)
      .where(sql`${table.status} = 'active'`),
    index('core_automations_due_idx')
      .on(table.nextRunAt)
      .where(sql`${table.status} = 'active'`),
    uniqueIndex('core_automations_org_id_id_key').on(table.orgId, table.id),
    check('core_automations_status_check', inList(table.status, AUTOMATION_STATUSES)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_automations_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/** Published definitions: a run keeps the version it started with. */
export const automationVersions = pgTable(
  'automation_versions',
  {
    orgId: orgIdColumn(),
    automationId: text().notNull(),
    version: integer().notNull(),
    definition: jsonb().$type<AutomationDefinition>().notNull(),
    publishedBy: text(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({
      columns: [table.automationId, table.version],
      name: 'core_automation_versions_pkey',
    }),
    foreignKey({
      columns: [table.orgId, table.automationId],
      foreignColumns: [automations.orgId, automations.id],
      name: 'core_automation_versions_automation_fkey',
    }).onDelete('cascade'),
  ],
);

/** One trip of a customer or company (or none) through an automation. */
export const automationRuns = pgTable(
  'automation_runs',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    automationId: text().notNull(),
    version: integer().notNull(),
    eventId: text().notNull(),
    eventType: text().notNull(),
    subjectType: text({ enum: CONTENT_TYPES }),
    subjectId: text(),
    status: text({ enum: RUN_STATUSES }).default('running').notNull(),
    /** The next step: indexes into the step tree (`[2, "then", 0]`). */
    cursor: jsonb().$type<(number | string)[]>().default([0]).notNull(),
    /** The event, and each step's output (`steps.<id>.output`). */
    context: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    /** How deep in a chain of automations (events caused by runs) this run is. */
    depth: integer().default(0).notNull(),
    error: text(),
    waitingUntil: timestamptz(),
    /** A `wait_for` step's event: an event of this type about the subject resumes the run. */
    waitEvent: text(),
    /** The run left early: the goal was met. */
    goalReachedAt: timestamptz(),
    startedAt: createdAt(),
    finishedAt: timestamptz(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // An event starts an automation once, however often it is processed.
    uniqueIndex('core_automation_runs_event_key').on(table.automationId, table.eventId),
    index('core_automation_runs_automation_idx').on(
      table.orgId,
      table.automationId,
      table.startedAt.desc(),
    ),
    index('core_automation_runs_subject_idx').on(
      table.automationId,
      table.subjectId,
      table.startedAt.desc(),
    ),
    index('core_automation_runs_waiting_idx')
      .on(table.orgId, table.subjectId)
      .where(sql`${table.status} = 'waiting'`),
    // Finished runs whose details are still kept: pruning empties `context`, which drops them out.
    index('core_automation_runs_prunable_idx')
      .on(table.finishedAt)
      .where(
        sql`${inList(table.status, FINISHED_RUN_STATUSES)} AND ${table.context} <> '{}'::jsonb`,
      ),
    uniqueIndex('core_automation_runs_org_id_id_key').on(table.orgId, table.id),
    check('core_automation_runs_status_check', inList(table.status, RUN_STATUSES)),
    foreignKey({
      columns: [table.orgId, table.automationId],
      foreignColumns: [automations.orgId, automations.id],
      name: 'core_automation_runs_automation_fkey',
    }).onDelete('cascade'),
  ],
);

/** What each step of a run did: input, output or error. */
export const automationRunSteps = pgTable(
  'automation_run_steps',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    runId: text().notNull(),
    stepId: text().notNull(),
    type: text().notNull(),
    status: text({ enum: RUN_STEP_STATUSES }).notNull(),
    input: jsonb(),
    output: jsonb(),
    error: text(),
    attempt: integer().default(1).notNull(),
    startedAt: timestamptz().notNull(),
    finishedAt: timestamptz().defaultNow().notNull(),
  },
  (table) => [
    index('core_automation_run_steps_run_idx').on(table.runId, table.finishedAt),
    check('core_automation_run_steps_status_check', inList(table.status, RUN_STEP_STATUSES)),
    foreignKey({
      columns: [table.orgId, table.runId],
      foreignColumns: [automationRuns.orgId, automationRuns.id],
      name: 'core_automation_run_steps_run_fkey',
    }).onDelete('cascade'),
  ],
);
