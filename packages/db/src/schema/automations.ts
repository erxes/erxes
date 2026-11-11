import { sql } from 'drizzle-orm';
import { check, foreignKey, index, integer, jsonb, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export const AUTOMATION_STATUSES = ['draft', 'active', 'paused'] as const;
export const RUN_STATUSES = ['running', 'waiting', 'succeeded', 'failed', 'cancelled'] as const;
export const RUN_STEP_STATUSES = ['succeeded', 'failed', 'skipped'] as const;

/**
 * An automation: a trigger (event type + conditions) and steps, validated by
 * the contract's `AutomationDefinition`. `definition` is the working copy;
 * activating publishes it as a numbered version runs start from.
 */
export const automations = pgTable(
  'automations',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    name: text().notNull(),
    description: text(),
    status: text({ enum: AUTOMATION_STATUSES }).default('draft').notNull(),
    definition: jsonb().$type<Record<string, unknown>>().notNull(),
    /** Copied from the definition for matching events quickly. */
    triggerEvent: text().notNull(),
    activeVersion: integer(),
    /** The member it acts as: its actions need their permissions, checked at run time. */
    activatedBy: text(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_automations_trigger_idx').on(table.orgId, table.triggerEvent).where(sql`${table.status} = 'active'`),
    uniqueIndex('core_automations_org_id_id_key').on(table.orgId, table.id),
    check('core_automations_status_check', sql`${table.status} IN ('draft', 'active', 'paused')`),
    foreignKey({ columns: [table.orgId], foreignColumns: [organizations.id], name: 'core_automations_org_id_fkey' }).onDelete('cascade'),
  ],
);

/** Published definitions: a run keeps the version it started with. */
export const automationVersions = pgTable(
  'automation_versions',
  {
    orgId: text().notNull(),
    automationId: text().notNull(),
    version: integer().notNull(),
    definition: jsonb().$type<Record<string, unknown>>().notNull(),
    publishedBy: text(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.automationId, table.version], name: 'core_automation_versions_pkey' }),
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
    orgId: text().notNull(),
    automationId: text().notNull(),
    version: integer().notNull(),
    eventId: text().notNull(),
    eventType: text().notNull(),
    subjectType: text(),
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
    startedAt: createdAt(),
    finishedAt: timestamptz(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // An event starts an automation once, however often it is processed.
    uniqueIndex('core_automation_runs_event_key').on(table.automationId, table.eventId),
    index('core_automation_runs_automation_idx').on(table.orgId, table.automationId, table.startedAt.desc()),
    index('core_automation_runs_subject_idx').on(table.automationId, table.subjectId, table.startedAt.desc()),
    uniqueIndex('core_automation_runs_org_id_id_key').on(table.orgId, table.id),
    check('core_automation_runs_status_check', sql`${table.status} IN ('running', 'waiting', 'succeeded', 'failed', 'cancelled')`),
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
    orgId: text().notNull(),
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
    check('core_automation_run_steps_status_check', sql`${table.status} IN ('succeeded', 'failed', 'skipped')`),
    foreignKey({
      columns: [table.orgId, table.runId],
      foreignColumns: [automationRuns.orgId, automationRuns.id],
      name: 'core_automation_run_steps_run_fkey',
    }).onDelete('cascade'),
  ],
);
