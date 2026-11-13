import type { CONDITION_OPERATORS, CONTENT_TYPES, FIELD_CONTENT_TYPES } from '../enums';
import { timestamp } from 'drizzle-orm/pg-core';

export type ContentType = (typeof CONTENT_TYPES)[number];

export type FieldContentType = (typeof FIELD_CONTENT_TYPES)[number];

/** A custom field value: text, number, date (`YYYY-MM-DD`), yes/no or several options. */
export type CustomValue = string | number | boolean | string[];

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
