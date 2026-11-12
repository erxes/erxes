import { and, or, type SQL } from 'drizzle-orm';

/** `and` of conditions that are all present: always a condition (drizzle's `and` may be undefined). */
export const allOf = (first: SQL, ...rest: SQL[]): SQL => and(first, ...rest) ?? first;

/** `or` of conditions that are all present: always a condition. */
export const anyOf = (first: SQL, ...rest: SQL[]): SQL => or(first, ...rest) ?? first;
