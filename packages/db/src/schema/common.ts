import { timestamp } from 'drizzle-orm/pg-core';

/** Records that tags and custom fields attach to. */
export const CONTENT_TYPES = ['customer', 'company'] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

/** Records custom fields attach to: contacts, and the shared product catalog. */
export const FIELD_CONTENT_TYPES = [...CONTENT_TYPES, 'product'] as const;

export type FieldContentType = (typeof FIELD_CONTENT_TYPES)[number];

/** A custom field value: text, number, date (`YYYY-MM-DD`), yes/no or several options. */
export type CustomValue = string | number | boolean | string[];

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

export type ConditionOperator = (typeof CONDITION_OPERATORS)[number];

/** One rule of the condition language that view filters and automations store. */
export interface ConditionRule {
  /** `event.payload.amount`, `subject.primaryEmail`, `steps.s2.output.id`. */
  path: string;
  op: ConditionOperator;
  value?: unknown;
}

/** Rules (or nested groups) that must all, or any, hold. */
export interface ConditionGroup {
  match: 'all' | 'any';
  rules: (ConditionRule | ConditionGroup)[];
}

export const createdAt = () =>
  timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull();

export const updatedAt = () =>
  timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull();
