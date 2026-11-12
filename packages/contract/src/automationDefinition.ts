import { z } from 'zod';

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
export const RelativeAmount = z.object({
  amount: z.number().int().min(0).max(3650),
  unit: z.enum(['days', 'weeks', 'months']).default('days'),
});

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

const Duration = {
  amount: z.number().int().min(1).max(10_000),
  unit: z.enum(['minutes', 'hours', 'days']),
};

/**
 * Action input: values, or text with `{{subject.firstName}}`-style
 * placeholders (with filters: `{{subject.firstName | default: "there"}}`)
 * filled from the run's context when the step runs.
 */
export const ActionInput = z
  .record(z.string().max(60), z.unknown())
  .refine((value) => JSON.stringify(value).length <= 20_000, 'at most 20 KB');

export type AutomationStep =
  | { id: string; type: 'action'; action: string; input: Record<string, unknown>; label?: string }
  | {
      id: string;
      type: 'delay';
      amount?: number;
      unit?: 'minutes' | 'hours' | 'days';
      until?: string;
      label?: string;
    }
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
  | {
      id: string;
      type: 'branch';
      conditions: ConditionGroup;
      then: AutomationStep[];
      else: AutomationStep[];
      label?: string;
    }
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

export const AutomationStep: z.ZodType<AutomationStep> = z.lazy(
  () =>
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
          .array(
            z.object({
              label: Label,
              conditions: ConditionGroup,
              steps: z.array(AutomationStep).max(100),
            }),
          )
          .min(1)
          .max(10),
        otherwise: z.array(AutomationStep).max(100),
        label: Label,
      }),
      z.object({
        id: StepId,
        type: z.literal('split'),
        paths: z
          .array(
            z.object({
              label: Label,
              weight: z.number().int().min(1).max(100),
              steps: z.array(AutomationStep).max(100),
            }),
          )
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
      return Boolean(new Intl.DateTimeFormat('en', { timeZone: zone }).resolvedOptions().timeZone);
    } catch {
      return false;
    }
  }, 'a time zone like Asia/Ulaanbaatar');

/** Which records a scheduled or manual run goes through: none (one run), or each matching customer/company. */
export const Audience = z.object({
  type: z.enum(['customer', 'company']),
  /** Conditions on `subject.*`; empty: every record. */
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

export const AutomationDefinition = z.object({
  trigger: AutomationTrigger,
  steps: z.array(AutomationStep).min(1).max(100),
  reentry: Reentry.default('always'),
  /** Once these hold, the record leaves the automation (checked before each step and while waiting). */
  goal: ConditionGroup.optional(),
  /** At most this many runs start an hour (beyond it, events are skipped and counted). */
  maxRunsPerHour: z.number().int().min(1).max(100_000).optional(),
});

export type AutomationDefinition = z.infer<typeof AutomationDefinition>;
