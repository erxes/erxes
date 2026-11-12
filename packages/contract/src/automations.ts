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
  /** Dates relative to now; the value is `{ amount, unit }` (days, weeks, months). */
  'within_last',
  'more_than_ago',
  'within_next',
  /** The day and month fall within the next `amount` days (birthdays, anniversaries), whatever the year. */
  'anniversary_within',
] as const;
export const ConditionOperator = z.enum(CONDITION_OPERATORS);

/** The value of a relative-date rule: "within the last 30 days". */
export const RelativeAmount = z.object({ amount: z.number().int().min(0).max(3650), unit: z.enum(['days', 'weeks', 'months']).default('days') });
export type RelativeAmount = z.infer<typeof RelativeAmount>;

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
const Label = z.string().trim().max(100).optional();
const Duration = { amount: z.number().int().min(1).max(10_000), unit: z.enum(['minutes', 'hours', 'days']) };

/**
 * Action input: values, or text with `{{subject.firstName}}`-style
 * placeholders (with filters: `{{subject.firstName | default: "there"}}`)
 * filled from the run's context when the step runs.
 */
export const ActionInput = z.record(z.string().max(60), z.unknown()).refine((value) => JSON.stringify(value).length <= 20_000, 'at most 20 KB');

export type AutomationStep =
  | { id: string; type: 'action'; action: string; input: Record<string, unknown>; label?: string }
  | { id: string; type: 'delay'; amount?: number; unit?: 'minutes' | 'hours' | 'days'; until?: string; label?: string }
  | {
      id: string;
      type: 'wait_for';
      /** The event to wait for, about the same customer or company. */
      event: string;
      conditions?: ConditionGroup;
      /** Give up after this long (the step's output says `matched: false`). */
      amount: number;
      unit: 'minutes' | 'hours' | 'days';
      label?: string;
    }
  | { id: string; type: 'branch'; conditions: ConditionGroup; then: AutomationStep[]; else: AutomationStep[]; label?: string }
  | {
      id: string;
      type: 'switch';
      /** The first case whose conditions hold runs; otherwise `otherwise`. */
      cases: { label?: string; conditions: ConditionGroup; steps: AutomationStep[] }[];
      otherwise: AutomationStep[];
      label?: string;
    }
  | {
      id: string;
      type: 'split';
      /** A/B: each run takes one path at random, by weight (a run always gets the same path). */
      paths: { label?: string; weight: number; steps: AutomationStep[] }[];
      label?: string;
    }
  | { id: string; type: 'stop'; label?: string };

export const AutomationStep: z.ZodType<AutomationStep> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({
      id: StepId,
      type: z.literal('action'),
      action: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/),
      input: ActionInput,
      label: Label,
    }),
    z.object({
      id: StepId,
      type: z.literal('delay'),
      amount: z.number().int().min(1).max(10_000).optional(),
      unit: z.enum(['minutes', 'hours', 'days']).optional(),
      /** A date to wait until (template allowed), instead of an amount. */
      until: z.string().max(200).optional(),
      label: Label,
    }),
    z.object({
      id: StepId,
      type: z.literal('wait_for'),
      event: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/),
      conditions: ConditionGroup.optional(),
      ...Duration,
      label: Label,
    }),
    z.object({
      id: StepId,
      type: z.literal('branch'),
      conditions: ConditionGroup,
      then: z.array(AutomationStep).max(100),
      else: z.array(AutomationStep).max(100),
      label: Label,
    }),
    z.object({
      id: StepId,
      type: z.literal('switch'),
      cases: z
        .array(z.object({ label: Label, conditions: ConditionGroup, steps: z.array(AutomationStep).max(100) }))
        .min(1)
        .max(10),
      otherwise: z.array(AutomationStep).max(100),
      label: Label,
    }),
    z.object({
      id: StepId,
      type: z.literal('split'),
      paths: z
        .array(z.object({ label: Label, weight: z.number().int().min(1).max(100), steps: z.array(AutomationStep).max(100) }))
        .min(2)
        .max(5),
      label: Label,
    }),
    z.object({ id: StepId, type: z.literal('stop'), label: Label }),
  ]) as z.ZodType<AutomationStep>,
);

/** `HH:MM`, 24-hour. */
const TimeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:MM');
/** An IANA time zone (`Asia/Ulaanbaatar`). */
const TimeZone = z
  .string()
  .max(60)
  .refine((zone) => {
    try {
      new Intl.DateTimeFormat('en', { timeZone: zone });

      return true;
    } catch {
      return false;
    }
  }, 'a time zone like Asia/Ulaanbaatar');

/** Which records a scheduled or manual run goes through: none (one run), or each matching customer/company. */
export const Audience = z.object({
  type: z.enum(['customer', 'company']),
  /** Conditions on `subject.*`; empty: every record (at most 10,000 a run). */
  conditions: ConditionGroup.optional(),
});
export type Audience = z.infer<typeof Audience>;

export const AutomationTrigger = z.discriminatedUnion('kind', [
  /** When an event happens (`core.customer.created`, `hr.leave.approved`). */
  z.object({
    kind: z.literal('event'),
    event: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/),
    conditions: ConditionGroup.optional(),
  }),
  /** On a schedule: every hour, day, week (on weekdays) or month (on a day), at a time, in a time zone. */
  z.object({
    kind: z.literal('schedule'),
    every: z.enum(['hour', 'day', 'week', 'month']),
    at: TimeOfDay.default('09:00'),
    /** 1 = Monday … 7 = Sunday (week). */
    weekdays: z.array(z.number().int().min(1).max(7)).max(7).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    timezone: TimeZone.default('Asia/Ulaanbaatar'),
    audience: Audience.optional(),
  }),
  /** Around a date on each record: "3 days before contract end", "on the birthday" (every year). */
  z.object({
    kind: z.literal('date'),
    subject: z.enum(['customer', 'company']),
    /** `birthDate` or a date custom field's id. */
    field: z.string().min(1).max(64),
    /** Days after (positive) or before (negative) the date. */
    offsetDays: z.number().int().min(-365).max(365).default(0),
    /** Every year on the day (birthdays, anniversaries). */
    yearly: z.boolean().default(false),
    at: TimeOfDay.default('09:00'),
    timezone: TimeZone.default('Asia/Ulaanbaatar'),
    conditions: ConditionGroup.optional(),
  }),
  /** Started by a member: on chosen records, or on every record that matches. */
  z.object({ kind: z.literal('manual'), audience: Audience.optional() }),
]);
export type AutomationTrigger = z.infer<typeof AutomationTrigger>;

/**
 * When the same customer or company may run through again:
 * every time, only once ever, or once a day.
 */
export const Reentry = z.enum(['always', 'once', 'daily']);

/** Before an older shape: `{ event, conditions }` was the only trigger. */
const LegacyTrigger = z
  .object({ event: z.string(), conditions: ConditionGroup.optional() })
  .transform((trigger) => ({ kind: 'event' as const, ...trigger }));

export const AutomationDefinition = z.object({
  trigger: z.union([AutomationTrigger, LegacyTrigger]),
  steps: z.array(AutomationStep).min(1).max(100),
  reentry: Reentry.default('always'),
  /** Once these hold, the record leaves the automation (checked before each step and while waiting). */
  goal: ConditionGroup.optional(),
  /** At most this many runs start an hour (beyond it, events are skipped and counted). */
  maxRunsPerHour: z.number().int().min(1).max(100_000).optional(),
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
  version: z.number().int(),
  eventId: z.string(),
  eventType: z.string(),
  subject: z.object({ type: z.enum(['customer', 'company']), id: Id }).nullable(),
  status: RunStatus,
  /** Left early because the automation's goal was met. */
  goalReached: z.boolean(),
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
        triggers: z.array(
          z.object({
            type: z.string(),
            label: z.string(),
            /** A line on what it is, for pickers. */
            description: z.string().nullable().optional(),
            source: z.string(),
            subject: z.enum(['customer', 'company']).nullable(),
          }),
        ),
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
  start: oc
    .route({
      method: 'POST',
      path: '/automations/{id}/start',
      summary: 'Run a manual (or any) automation now: on the given records, or on its audience',
    })
    .input(z.object({ id: Id, subjects: z.array(Id).max(1000).optional() }))
    .output(z.object({ started: z.number().int(), skipped: z.number().int() })),
  test: oc
    .route({
      method: 'POST',
      path: '/automations/{id}/test',
      summary: 'Dry run of the working copy: what each step would do for a record (nothing is changed)',
    })
    .input(
      z.object({
        id: Id,
        subject: z.object({ type: z.enum(['customer', 'company']), id: Id }).optional(),
        /** Event fields for the trigger (type, payload); defaults to the trigger's event. */
        payload: z.record(z.unknown()).optional(),
        /** Pretend waits for events end with the event happening. */
        assumeEventHappens: z.boolean().default(false),
      }),
    )
    .output(
      z.object({
        triggerMatches: z.boolean(),
        goalMetAtStart: z.boolean(),
        trace: z.array(
          z.object({
            stepId: z.string(),
            type: z.string(),
            outcome: z.string(),
            input: z.unknown().nullable(),
            problem: z.string().nullable(),
          }),
        ),
      }),
    ),
  stats: oc
    .route({ method: 'GET', path: '/automations/{id}/stats', summary: 'How runs went, overall and step by step (last 30 days)' })
    .input(z.object({ id: Id }))
    .output(
      z.object({
        runs: z.object({ total: z.number().int(), running: z.number().int(), succeeded: z.number().int(), failed: z.number().int(), cancelled: z.number().int(), goalReached: z.number().int() }),
        steps: z.array(z.object({ stepId: z.string(), succeeded: z.number().int(), failed: z.number().int(), skipped: z.number().int() })),
        skippedByLimit: z.number().int(),
      }),
    ),
  versions: oc
    .route({ method: 'GET', path: '/automations/{id}/versions', summary: 'Published versions, newest first' })
    .input(z.object({ id: Id }))
    .output(z.object({ data: z.array(z.object({ version: z.number().int(), publishedBy: z.string().nullable(), createdAt: z.string().datetime(), definition: AutomationDefinition })) })),
  restoreVersion: oc
    .route({ method: 'POST', path: '/automations/{id}/versions/{version}/restore', summary: 'Make an older version the working copy (and publish it if the automation is on)' })
    .input(z.object({ id: Id, version: z.coerce.number().int().min(1) }))
    .output(Automation),
  templates: oc
    .route({ method: 'GET', path: '/automations/templates', summary: 'Ready-made automations to start from' })
    .output(z.object({ data: z.array(z.object({ id: z.string(), name: z.string(), description: z.string(), definition: AutomationDefinition })) })),
  fields: oc
    .route({ method: 'GET', path: '/automations/fields', summary: 'Paths conditions and placeholders can use, with their types (custom fields included)' })
    .input(z.object({ subject: z.enum(['customer', 'company']).optional() }))
    .output(
      z.object({
        data: z.array(z.object({ path: z.string(), label: z.string(), type: z.enum(['text', 'number', 'date', 'boolean', 'list', 'member', 'tags', 'select']), options: z.array(z.string()).optional() })),
      }),
    ),
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
