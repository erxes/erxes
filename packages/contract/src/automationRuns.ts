import {
  ACTION_FIELD_TYPES,
  AUTOMATION_SUBJECTS,
  CONTENT_TYPES,
  RUN_STATUSES,
} from '@erxes/core-db/enums';
import { automationRunSteps, automationRuns } from '@erxes/core-db/schema';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate } from './common';

// ─── Catalog ────────────────────────────────────────────────────────────────

/**
 * One input of an action. Besides plain values: `custom_field` (one of the
 * subject's custom fields, by id), `lead_stage` (a lead stage, by id),
 * `recipients` (`subject` = the record's own email, or addresses).
 */
export const ActionField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(ACTION_FIELD_TYPES),
  required: z.boolean().default(false),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  /** The key of a `custom_field` input: this value takes that field's type (a date, a choice …). */
  sameTypeAs: z.string().optional(),
});

export type ActionField = z.infer<typeof ActionField>;

export const ActionInfo = z.object({
  type: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  source: z.string(),
  /** Needs a customer or company as the run's subject. */
  subject: z.enum(AUTOMATION_SUBJECTS).nullable(),
  fields: z.array(ActionField),
});

export type ActionInfo = z.infer<typeof ActionInfo>;

// ─── Runs ───────────────────────────────────────────────────────────────────

export const RunStatus = z.enum(RUN_STATUSES);

const int = () => z.int();

export const AutomationRun = createSelectSchema(automationRuns, {
  id: Id,
  automationId: Id,
  version: int,
  waitingUntil: isoDate,
  startedAt: isoDate,
  finishedAt: isoDate,
})
  .pick({
    id: true,
    automationId: true,
    version: true,
    eventId: true,
    eventType: true,
    status: true,
    error: true,
    waitingUntil: true,
    startedAt: true,
    finishedAt: true,
  })
  .extend({
    subject: z.object({ type: z.enum(CONTENT_TYPES), id: Id }).nullable(),
    /** Left early because the automation's goal was met. */
    goalReached: z.boolean(),
  });

export type AutomationRun = z.infer<typeof AutomationRun>;

export const RunStep = createSelectSchema(automationRunSteps, {
  id: Id,
  input: () => z.unknown(),
  output: () => z.unknown(),
  attempt: int,
  startedAt: isoDate,
  finishedAt: isoDate,
}).pick({
  id: true,
  stepId: true,
  type: true,
  status: true,
  input: true,
  output: true,
  error: true,
  attempt: true,
  startedAt: true,
  finishedAt: true,
});

export type RunStep = z.infer<typeof RunStep>;
