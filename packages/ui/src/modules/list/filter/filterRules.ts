import { z } from 'zod';
import {
  isRule,
  type RelativeAmount,
  type TConditionGroup,
  type TConditionRule,
} from '../../conditions/conditions';
import type { TListFilterField } from '../ListFilter';

/** One thing the list's filter requires: a rule, or a group of rules (from the advanced filter). */
export type FilterPart = TConditionRule | TConditionGroup;

type Operator = TConditionRule['op'];

/** The list's filter as parts that must all hold; an "any" group of several rules is one part. */
export const partsOf = (group: TConditionGroup | null): FilterPart[] =>
  !group ? [] : group.match === 'all' || group.rules.length < 2 ? group.rules : [group];

/** Parts back to the list's filter: null when there are none. */
export const groupOf = (parts: FilterPart[]): TConditionGroup | null =>
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
const MENU_OPS: Record<TListFilterField['type'], readonly Operator[]> = {
  select: ['in', 'eq'],
  member: ['in', 'eq'],
  tags: ['in', 'eq'],
  boolean: ['eq'],
  date: ['within_last', 'more_than_ago', 'within_next', 'exists', 'not_exists'],
  number: NUMBER_OPS,
  text: ['contains'],
};

/** Whether the menu can show and edit this rule. */
export const inMenu = (rule: TConditionRule, field: TListFilterField | undefined) =>
  !!field && MENU_OPS[field.type].includes(rule.op);

/** Fields with one value at a time (a choice, a yes/no, a date range): picking again changes it rather than adding one. */
const SINGLE = new Set<TListFilterField['type']>(['select', 'member', 'tags', 'boolean', 'date']);

/** Which part the menu of `field` changes: the one being edited, else its existing single rule, else a new one. */
export const targetOf = (parts: FilterPart[], field: TListFilterField, editing: number | null) => {
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
export const valuesOf = (rule: TConditionRule | undefined): string[] => {
  if (!rule || rule.value === undefined || rule.value === null) return [];

  return Values.safeParse(rule.op === 'in' ? rule.value : [rule.value]).data ?? [];
};

/** An "is any of" rule; null when nothing is picked. */
export const anyOf = (path: string, values: string[]): TConditionRule | null =>
  values.length ? { path, op: 'in', value: values } : null;

const days = (amount: number) => ({ amount, unit: 'days' as const });

const months = (amount: number) => ({ amount, unit: 'months' as const });

/**
 * Date filters in one pick, on the relative operators (they stay current in a saved view);
 * `label` is the English for the `views` namespace's `filter.date.<key>`.
 */
export const DATE_PRESETS: { key: string; label: string; op: Operator; value?: RelativeAmount }[] =
  [
    { key: 'past-day', label: 'Past day', op: 'within_last', value: days(1) },
    { key: 'past-week', label: 'Past 7 days', op: 'within_last', value: days(7) },
    { key: 'past-month', label: 'Past 30 days', op: 'within_last', value: days(30) },
    { key: 'past-quarter', label: 'Past 3 months', op: 'within_last', value: months(3) },
    { key: 'past-year', label: 'Past year', op: 'within_last', value: months(12) },
    { key: 'older-month', label: 'More than 30 days ago', op: 'more_than_ago', value: days(30) },
    { key: 'older-year', label: 'More than a year ago', op: 'more_than_ago', value: months(12) },
    { key: 'next-week', label: 'Next 7 days', op: 'within_next', value: days(7) },
    { key: 'next-month', label: 'Next 30 days', op: 'within_next', value: days(30) },
    { key: 'set', label: 'Is set', op: 'exists' },
    { key: 'empty', label: 'Is empty', op: 'not_exists' },
  ];

/** The preset a rule is, if any. */
export const presetOf = (rule: TConditionRule | undefined) =>
  rule &&
  DATE_PRESETS.find(
    (preset) =>
      preset.op === rule.op && JSON.stringify(preset.value) === JSON.stringify(rule.value),
  );
