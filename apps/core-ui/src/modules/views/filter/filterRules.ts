import type {
  ConditionGroup,
  ConditionRule,
  FilterField,
  RelativeAmount,
} from '@erxes/core-contract';
import { z } from 'zod';
import { isRule } from '~/modules/automations/builder/conditionOperators';

/** One thing the list's filter requires: a rule, or a group of rules (from the advanced filter). */
export type FilterPart = ConditionRule | ConditionGroup;

type Operator = ConditionRule['op'];

/** The list's filter as parts that must all hold; an "any" group of several rules is one part. */
export const partsOf = (group: ConditionGroup | null): FilterPart[] =>
  !group ? [] : group.match === 'all' || group.rules.length < 2 ? group.rules : [group];

/** Parts back to the list's filter: null when there are none. */
export const groupOf = (parts: FilterPart[]): ConditionGroup | null =>
  parts.length ? { match: 'all', rules: parts } : null;

const same = (a: FilterPart, b: FilterPart) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Replaces the part at `index`, appends when `index` is null, removes when
 * `next` is null. Parts stay distinct: a part already there isn't added twice.
 */
export const withPart = (parts: FilterPart[], index: number | null, next: FilterPart | null) => {
  if (next && parts.some((part, at) => at !== index && same(part, next))) {
    return index === null ? parts : parts.filter((_, at) => at !== index);
  }

  if (index === null) return next ? [...parts, next] : parts;

  return next
    ? parts.map((part, at) => (at === index ? next : part))
    : parts.filter((_, at) => at !== index);
};

/** Comparisons of a number, as the menu writes them. */
export const NUMBER_OPS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'] as const;

export const NUMBER_SYMBOLS: Record<(typeof NUMBER_OPS)[number], string> = {
  eq: '=',
  neq: '≠',
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
};

/** The operators the filter menu shows and edits for each kind of field; other rules open the advanced filter. */
const MENU_OPS: Record<FilterField['type'], readonly Operator[]> = {
  select: ['in', 'eq'],
  member: ['in', 'eq'],
  tags: ['in', 'eq'],
  boolean: ['eq'],
  date: ['within_last', 'more_than_ago', 'within_next', 'exists', 'not_exists'],
  number: NUMBER_OPS,
  text: ['contains'],
};

/** Whether the menu can show and edit this rule. */
export const inMenu = (rule: ConditionRule, field: FilterField | undefined) =>
  !!field && MENU_OPS[field.type].includes(rule.op);

/** Fields with one value at a time (a choice, a yes/no, a date range): picking again changes it rather than adding one. */
const SINGLE = new Set<FilterField['type']>(['select', 'member', 'tags', 'boolean', 'date']);

/** Which part the menu of `field` changes: the one being edited, else its existing single rule, else a new one. */
export const targetOf = (parts: FilterPart[], field: FilterField, editing: number | null) => {
  if (editing !== null) return editing;

  if (!SINGLE.has(field.type)) return null;

  const index = parts.findIndex(
    (part) => isRule(part) && part.path === field.path && inMenu(part, field),
  );

  return index < 0 ? null : index;
};

const Values = z.array(z.union([z.string(), z.number()]).transform(String));

/**
 * The values a rule picks: the list of "is any of", or the one of "is". A value that isn't text or
 * numbers (a date range, a relative amount) picks nothing.
 */
export const valuesOf = (rule: ConditionRule | undefined): string[] => {
  if (!rule || rule.value === undefined || rule.value === null) return [];

  return Values.safeParse(rule.op === 'in' ? rule.value : [rule.value]).data ?? [];
};

/** Picks or unpicks a value of an "is any of" rule; null when nothing is left picked. */
export const toggled = (path: string, current: string[], value: string): ConditionRule | null => {
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  return next.length ? { path, op: 'in', value: next } : null;
};

const days = (amount: number) => ({ amount, unit: 'days' as const });

const months = (amount: number) => ({ amount, unit: 'months' as const });

/** Date filters in one pick, on the relative operators (they stay current in a saved view). */
export const DATE_PRESETS: { key: string; op: Operator; value?: RelativeAmount }[] = [
  { key: 'past-day', op: 'within_last', value: days(1) },
  { key: 'past-week', op: 'within_last', value: days(7) },
  { key: 'past-month', op: 'within_last', value: days(30) },
  { key: 'past-quarter', op: 'within_last', value: months(3) },
  { key: 'past-year', op: 'within_last', value: months(12) },
  { key: 'older-month', op: 'more_than_ago', value: days(30) },
  { key: 'older-year', op: 'more_than_ago', value: months(12) },
  { key: 'next-week', op: 'within_next', value: days(7) },
  { key: 'next-month', op: 'within_next', value: days(30) },
  { key: 'set', op: 'exists' },
  { key: 'empty', op: 'not_exists' },
];

/** The preset a rule is, if any. */
export const presetOf = (rule: ConditionRule | undefined) =>
  rule &&
  DATE_PRESETS.find(
    (preset) =>
      preset.op === rule.op && JSON.stringify(preset.value) === JSON.stringify(rule.value),
  );
