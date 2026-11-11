import { oc } from '@orpc/contract';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, Id } from './common';

// ─── Definition ─────────────────────────────────────────────────────────────

/** Where a condition or template reads from: `event.payload.amount`, `subject.primaryEmail`, `steps.s2.output.id`. */
export const ContextPath = z
  .string()
  .trim()
  .regex(/^(event|subject|steps|run)(\.[A-Za-z0-9_-]+)*$/, 'a path like subject.primaryEmail');

export const CONDITION_OPERATORS = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'contains',
  'not_contains',
  'starts_with',
  'in',
  'not_in',
  'exists',
  'not_exists',
] as const;
export const ConditionOperator = z.enum(CONDITION_OPERATORS);

export const ConditionRule = z.object({
  path: ContextPath,
  op: ConditionOperator,
  value: z.unknown().optional(),
});
export type ConditionRule = z.infer<typeof ConditionRule>;

export interface ConditionGroup {
  match: 'all' | 'any';
  rules: (ConditionRule | ConditionGroup)[];
}

/** Rules (or nested groups) that must all, or any, hold. */
export const ConditionGroup: z.ZodType<ConditionGroup> = z.lazy(() =>
  z.object({
    match: z.enum(['all', 'any']),
    rules: z.array(z.union([ConditionRule, ConditionGroup])).max(50),
  }),
);

const StepId = z.string().regex(/^[a-z0-9]{1,24}$/i, 'letters and digits');

/**
 * Action input: values, or text with `{{subject.firstName}}`-style
 * placeholders filled from the run's context when the step runs.
 */
export const ActionInput = z.record(z.string().max(60), z.unknown()).refine((value) => JSON.stringify(value).length <= 20_000, 'at most 20 KB');

export type AutomationStep =
  | { id: string; type: 'action'; action: string; input: Record<string, unknown>; label?: string }
  | { id: string; type: 'delay'; amount?: number; unit?: 'minutes' | 'hours' | 'days'; until?: string; label?: string }
  | { id: string; type: 'branch'; conditions: ConditionGroup; then: AutomationStep[]; else: AutomationStep[]; label?: string }
  | { id: string; type: 'stop'; label?: string };

export const AutomationStep: z.ZodType<AutomationStep> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({
      id: StepId,
      type: z.literal('action'),
      action: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/),
      input: ActionInput,
      label: z.string().trim().max(100).optional(),
    }),
    z.object({
      id: StepId,
      type: z.literal('delay'),
      amount: z.number().int().min(1).max(10_000).optional(),
      unit: z.enum(['minutes', 'hours', 'days']).optional(),
      /** A date to wait until (template allowed), instead of an amount. */
      until: z.string().max(200).optional(),
      label: z.string().trim().max(100).optional(),
    }),
    z.object({
      id: StepId,
      type: z.literal('branch'),
      conditions: ConditionGroup,
      then: z.array(AutomationStep).max(100),
      else: z.array(AutomationStep).max(100),
      label: z.string().trim().max(100).optional(),
    }),
    z.object({ id: StepId, type: z.literal('stop'), label: z.string().trim().max(100).optional() }),
  ]) as z.ZodType<AutomationStep>,
);

export const AutomationTrigger = z.object({
  /** An event type: `core.customer.created`, `hr.leave.approved`. */
  event: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/),
  conditions: ConditionGroup.optional(),
});

/**
 * When the same customer or company may run through again:
 * every time, only once ever, or once a day.
 */
export const Reentry = z.enum(['always', 'once', 'daily']);

export const AutomationDefinition = z.object({
  trigger: AutomationTrigger,
  steps: z.array(AutomationStep).min(1).max(100),
  reentry: Reentry.default('always'),
});
export type AutomationDefinition = z.infer<typeof AutomationDefinition>;

export const AutomationStatus = z.enum(['draft', 'active', 'paused']);

export const Automation = z.object({
  id: Id,
  name: z.string(),
  description: z.string().nullable(),
  status: AutomationStatus,
  definition: AutomationDefinition,
  /** The version runs start with (null until first activated). */
  activeVersion: z.number().int().nullable(),
  activatedBy: z.string().nullable(),
  stats: z.object({ running: z.number().int(), succeeded: z.number().int(), failed: z.number().int() }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Automation = z.infer<typeof Automation>;

// ─── Catalog ────────────────────────────────────────────────────────────────

export const ActionField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(['text', 'longtext', 'number', 'boolean', 'date', 'select', 'members', 'tags', 'json']),
  required: z.boolean().default(false),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  description: z.string().optional(),
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
  version: z.number().int(),
  eventId: z.string(),
  eventType: z.string(),
  subject: z.object({ type: z.enum(['customer', 'company']), id: Id }).nullable(),
  status: RunStatus,
  error: z.string().nullable(),
  waitingUntil: z.string().datetime().nullable(),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().nullable(),
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
  attempt: z.number().int(),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime(),
});
export type RunStep = z.infer<typeof RunStep>;

const Fields = {
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  definition: AutomationDefinition,
};

/**
 * Automations: when an event happens (and its conditions hold), run steps —
 * actions from core and plugins, delays and branches — for its customer or
 * company. Every run and step is logged.
 */
export const automationsContract = {
  catalog: oc
    .route({ method: 'GET', path: '/automations/catalog', summary: "Triggers (event types) and actions: core's and installed plugins'" })
    .output(
      z.object({
        triggers: z.array(z.object({ type: z.string(), label: z.string(), source: z.string(), subject: z.enum(['customer', 'company']).nullable() })),
        actions: z.array(ActionInfo),
      }),
    ),
  list: oc
    .route({ method: 'GET', path: '/automations' })
    .input(z.object({ status: AutomationStatus.optional() }))
    .output(z.object({ data: z.array(Automation) })),
  get: oc.route({ method: 'GET', path: '/automations/{id}' }).input(z.object({ id: Id })).output(Automation),
  create: oc.route({ method: 'POST', path: '/automations', successStatus: 201 }).input(z.object(Fields)).output(Automation),
  update: oc
    .route({ method: 'PATCH', path: '/automations/{id}', summary: 'Change an automation; an active one publishes a new version (runs in progress keep theirs)' })
    .input(z.object({ id: Id, name: Fields.name.optional(), description: Fields.description, definition: Fields.definition.optional() }))
    .output(Automation),
  activate: oc
    .route({ method: 'POST', path: '/automations/{id}/activate', summary: 'Check and turn on (as the member, whose permissions its actions use)' })
    .input(z.object({ id: Id }))
    .output(Automation),
  pause: oc.route({ method: 'POST', path: '/automations/{id}/pause' }).input(z.object({ id: Id })).output(Automation),
  remove: oc.route({ method: 'DELETE', path: '/automations/{id}' }).input(z.object({ id: Id })).output(z.object({ ok: z.literal(true) })),
  runs: oc
    .route({ method: 'GET', path: '/automations/{id}/runs' })
    .input(CursorQuery.extend({ id: Id, status: RunStatus.optional() }))
    .output(cursorPageOf(AutomationRun)),
  run: oc
    .route({ method: 'GET', path: '/automations/runs/{runId}' })
    .input(z.object({ runId: Id }))
    .output(z.object({ run: AutomationRun, steps: z.array(RunStep) })),
  retryRun: oc
    .route({ method: 'POST', path: '/automations/runs/{runId}/retry', summary: 'Continue a failed run from the step that failed' })
    .input(z.object({ runId: Id }))
    .output(AutomationRun),
  cancelRun: oc
    .route({ method: 'POST', path: '/automations/runs/{runId}/cancel', summary: 'Stop a running or waiting run' })
    .input(z.object({ runId: Id }))
    .output(AutomationRun),
};
