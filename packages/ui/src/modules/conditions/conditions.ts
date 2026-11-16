import { z } from 'zod';
import type { TagsQuery } from '../pickers/LookupPicker';
import type { MemberQueries } from '../pickers/members';

/*
 * Core's condition language, which automations and list filters share: rules `<path> <op>
 * <value>` in groups that must all, or any, hold. erxes-ui knows nothing of core, so it
 * declares the shape here; core's `ConditionGroup` (`@erxes/core-contract`) is the same type.
 */

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
  'within_last',
  'more_than_ago',
  'within_next',
  'anniversary_within',
] as const;

export type TConditionOperator = (typeof CONDITION_OPERATORS)[number];

/** `all`: every condition holds; `any`: one does. */
const CONDITION_MATCHES = ['all', 'any'] as const;

/** The units of a relative date's `{ amount, unit }`. */
export const RELATIVE_UNITS = ['days', 'weeks', 'months'] as const;

/** One rule of a condition: a `path`, an operator and maybe a value. */
export type TConditionRule = {
  /** `subject.primaryEmail`, `event.payload.amount`, `steps.s2.output.id`. */
  path: string;
  op: TConditionOperator;
  value?: unknown;
};

/** Rules (or nested groups) that must all, or any, hold. */
export type TConditionGroup = {
  match: (typeof CONDITION_MATCHES)[number];
  rules: (TConditionRule | TConditionGroup)[];
};

/** Core's limits, so a filter the UI accepts is one core's API accepts too. */
const MAX_RULES = 50;
const MAX_AMOUNT = 3650;

/** Groups nest as deep as the editor builds them: a group, and two levels inside it. */
const MAX_DEPTH = 3;

const ConditionRule = z.object({
  path: z
    .string()
    .trim()
    .regex(/^(event|subject|steps|run)(\.[A-Za-z0-9_-]+)*$/),
  op: z.enum(CONDITION_OPERATORS),
  value: z.unknown().optional(),
});

/** A group whose groups nest at most `depth` levels, so a crafted address can't recurse on. */
const groupOf = (depth: number): z.ZodType<TConditionGroup> =>
  z.object({
    match: z.enum(CONDITION_MATCHES),
    rules: z
      .array(depth > 1 ? z.union([ConditionRule, groupOf(depth - 1)]) : ConditionRule)
      .max(MAX_RULES),
  });

/** Parses a condition group from outside (the address); core checks the rest. */
export const ConditionGroup = groupOf(MAX_DEPTH);

/** The value of a relative-date rule: "within the last 30 days". */
export const RelativeAmount = z.object({
  amount: z.int().min(0).max(MAX_AMOUNT),
  unit: z.enum(RELATIVE_UNITS).default('days'),
});

export type RelativeAmount = z.infer<typeof RelativeAmount>;

/**
 * A field conditions can use: a record's, or an earlier step's output. `group`: where it comes
 * from, for grouping in the picker (a list's advanced filter).
 */
export type TConditionField = {
  path: string;
  label: string;
  type: string;
  options?: string[];
  group?: string;
  /** The heading to list it under instead of the group's own (a plugin's title). */
  groupLabel?: string;
  /** A money amount, stored in this currency's smallest unit and typed in its major unit. */
  currency?: string;
};

/**
 * Where `member` and `tags` values pick from. In erxes: `memberQueries` from
 * `@erxes/core-contract/client`, and web's tags query for the record type. Without one, the
 * picker has nothing to offer.
 */
export type TConditionLookups = {
  members?: MemberQueries;
  tags?: TagsQuery;
};

export const OPERATOR_LABELS: Record<TConditionOperator, string> = {
  eq: 'is',
  neq: 'is not',
  gt: 'is greater than',
  gte: 'is at least',
  lt: 'is less than',
  lte: 'is at most',
  contains: 'contains',
  not_contains: "doesn't contain",
  starts_with: 'starts with',
  in: 'is one of',
  not_in: 'is none of',
  exists: 'is set',
  not_exists: 'is empty',
  within_last: 'in the last',
  more_than_ago: 'more than … ago',
  within_next: 'in the next',
  anniversary_within: 'anniversary in the next',
};

/** Operators that make sense for a field's type. */
export const operatorsFor = (type: string | undefined) => {
  if (type === 'date') {
    return [
      'within_last',
      'more_than_ago',
      'within_next',
      'anniversary_within',
      'eq',
      'gt',
      'lt',
      'exists',
      'not_exists',
    ] as const;
  }

  if (type === 'number')
    return ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'exists', 'not_exists'] as const;

  if (type === 'tags' || type === 'list')
    return ['contains', 'not_contains', 'exists', 'not_exists'] as const;

  if (type === 'boolean') return ['eq', 'neq'] as const;

  if (type === 'select' || type === 'member')
    return ['eq', 'neq', 'in', 'not_in', 'exists', 'not_exists'] as const;

  return CONDITION_OPERATORS;
};

export const NO_VALUE = new Set<string>(['exists', 'not_exists']);

export const RELATIVE = new Set<string>([
  'within_last',
  'more_than_ago',
  'within_next',
  'anniversary_within',
]);

export const LIST_VALUE = new Set<string>(['in', 'not_in']);

/** Whether a condition entry is a rule rather than a nested group. */
export const isRule = (rule: TConditionRule | TConditionGroup): rule is TConditionRule =>
  !('match' in rule);

/** A relative date takes `{ amount, unit }`; switching to or from one resets the value. */
export const withOperator = (rule: TConditionRule, op: TConditionOperator): TConditionRule => {
  if (RELATIVE.has(op) === RELATIVE.has(rule.op)) return { ...rule, op };

  return { ...rule, op, value: RELATIVE.has(op) ? { amount: 30, unit: 'days' } : undefined };
};
