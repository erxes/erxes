import { z } from 'zod';
import { Id } from './common';

// ─── Catalog ────────────────────────────────────────────────────────────────

/**
 * One input of an action. Besides plain values: `custom_field` (one of the
 * subject's custom fields, by id), `lead_stage` (a lead stage, by id),
 * `recipients` (`subject` = the record's own email, or addresses).
 */
export const ActionField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum([
    'text',
    'longtext',
    'number',
    'boolean',
    'date',
    'select',
    'members',
    'tags',
    'json',
    'custom_field',
    'lead_stage',
    'recipients',
  ]),
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
  subject: z.enum(['customer', 'company', 'any']).nullable(),
  fields: z.array(ActionField),
});

export type ActionInfo = z.infer<typeof ActionInfo>;

// ─── Runs ───────────────────────────────────────────────────────────────────

export const RunStatus = z.enum(['running', 'waiting', 'succeeded', 'failed', 'cancelled']);

export const AutomationRun = z.object({
  id: Id,
  automationId: Id,
  version: z.int(),
  eventId: z.string(),
  eventType: z.string(),
  subject: z.object({ type: z.enum(['customer', 'company']), id: Id }).nullable(),
  status: RunStatus,
  /** Left early because the automation's goal was met. */
  goalReached: z.boolean(),
  error: z.string().nullable(),
  waitingUntil: z.iso.datetime().nullable(),
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime().nullable(),
});

export type AutomationRun = z.infer<typeof AutomationRun>;

export const RunStep = z.object({
  id: Id,
  stepId: z.string(),
  type: z.string(),
  status: z.enum(['succeeded', 'failed', 'skipped']),
  input: z.unknown().nullable(),
  output: z.unknown().nullable(),
  error: z.string().nullable(),
  attempt: z.int(),
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime(),
});

export type RunStep = z.infer<typeof RunStep>;
