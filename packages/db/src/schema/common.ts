import type {
  CONDITION_MATCHES,
  CONDITION_OPERATORS,
  CONTENT_TYPES,
  FIELD_CONTENT_TYPES,
} from '../enums';
import { timestamp } from 'drizzle-orm/pg-core';

export type ContentType = (typeof CONTENT_TYPES)[number];

export type FieldContentType = (typeof FIELD_CONTENT_TYPES)[number];

/** A plugin's own record type, `<plugin>.<type>` (`operation.task`). */
export type PluginRecordType = `${string}.${string}`;

/**
 * What custom fields are defined for: core's records, whose values core keeps, or a plugin's
 * own record type, whose values the plugin keeps.
 */
export type PropertyContentType = FieldContentType | PluginRecordType;

/** A custom field value: text, number, date (`YYYY-MM-DD`), yes/no or several options. */
export type CustomValue = string | number | boolean | string[];

export type ConditionOperator = (typeof CONDITION_OPERATORS)[number];

/** One rule of the condition language that view filters and automations store. */
export interface ConditionRule {
  /** `event.payload.amount`, `subject.primaryEmail`, `steps.s2.output.id`. */
  path: string;
  op: ConditionOperator;
  value?: unknown;
  /**
   * On a relation (`subject.related.<plugin>.<relation>.<measure>`): only the related rows that
   * match, their fields at `subject.<field>` ("deals whose stage is Won").
   */
  where?: ConditionGroup;
}

/** Rules (or nested groups) that must all, or any, hold. */
export interface ConditionGroup {
  match: (typeof CONDITION_MATCHES)[number];
  rules: (ConditionRule | ConditionGroup)[];
}

export const createdAt = () =>
  timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull();

export const updatedAt = () =>
  timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull();
