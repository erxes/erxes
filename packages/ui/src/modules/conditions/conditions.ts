import type { ElementType } from 'react';
import { z } from 'zod';
import type { TagsQuery } from '../pickers/LookupPicker';
import type { MemberQueries } from '../pickers/members';

/*
 * Core's condition language, which automations and list filters share: rules `<path> <op>
 * <value>` in groups that must all, or any, hold. erxes-ui knows nothing of core, so it
 * declares the shape here; core's `ConditionGroup` (`@erxes/core-contract`) is the same type.
 * How the editors edit rules is in `filterRule.ts`.
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

/** A choice of a `select` field: what the rule holds, and what the picker shows. */
export type TFieldOption = { value: string; label: string };

/**
 * A field conditions can use: a record's, or an earlier step's output. The picker lists fields
 * under their `group`'s heading: `groupLabel` when the field brings one (a plugin's name), else
 * the group's own name.
 */
export type TConditionField = {
  path: string;
  label: string;
  type: string;
  /** A `select`'s choices. */
  options?: TFieldOption[];
  group?: string;
  /** The heading of the field's group, instead of the group's own name. */
  groupLabel?: string;
  /** Instead of the type's icon. */
  icon?: ElementType;
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
