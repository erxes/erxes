import { timestamp } from 'drizzle-orm/pg-core';

/** Records that tags and custom fields attach to. */
export const CONTENT_TYPES = ['customer', 'company'] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

/** A custom field value: text, number, date (`YYYY-MM-DD`), yes/no or several options. */
export type CustomValue = string | number | boolean | string[];

export const createdAt = () =>
  timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull();

export const updatedAt = () =>
  timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull();
