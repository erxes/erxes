import type { ConditionRule } from '@erxes/core-contract';
import { type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';

/** A filter that doesn't fit its fields: 400 `INVALID_FILTER`. */
export const invalid = (message: string) => fail('INVALID_FILTER', message);

/** A text array parameter (a JS array in a template becomes a list of parameters, not one array). */
export const textArray = (values: string[]) =>
  sql`array[${sql.join(
    values.map((value) => sql`${value}`),
    sql`, `,
  )}]::text[]`;

export const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export const text = (value: unknown) => {
  if (typeof value !== 'string' && typeof value !== 'number')
    throw invalid('A text value is needed');

  return String(value);
};

export const list = (value: unknown) => {
  if (!Array.isArray(value) || !value.length) throw invalid('Choose at least one value');

  return value.map(text);
};

export const number = (value: unknown) => {
  const n = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(n)) throw invalid('A number is needed');

  return n;
};

/** `{ amount, unit }` of the relative date rules; anything else has no amount. */
const Span = z.object({ amount: z.unknown(), unit: z.unknown() }).partial();

const spanOf = (value: unknown) => Span.safeParse(value).data ?? {};

const interval = (value: unknown): SQL => {
  const { amount, unit } = spanOf(value);
  const n = number(amount);

  if (n < 0 || n > 3650) throw invalid('Between 0 and 3650');

  return unit === 'months'
    ? sql`make_interval(months => ${n}::int)`
    : unit === 'weeks'
      ? sql`make_interval(weeks => ${n}::int)`
      : sql`make_interval(days => ${n}::int)`;
};

/** Negative ops on a relation or a custom field: "none where …" rather than "one where not …". */
export const NEGATIVE: Partial<Record<ConditionRule['op'], ConditionRule['op']>> = {
  neq: 'eq',
  not_contains: 'contains',
  not_in: 'in',
  not_exists: 'exists',
};

export const COMPARE: Partial<Record<ConditionRule['op'], string>> = {
  eq: '=',
  neq: '<>',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
};

/** Month * 100 + day, as the stored birthday and the value index compute it. */
const monthDayOf = (day: SQL) =>
  sql`((extract(month from ${day}) * 100 + extract(day from ${day}))::smallint)`;

/** "Within the next n days, any year", over a month-day expression; the window may run past 31 December. */
const anniversary = (monthDay: SQL, value: unknown) => {
  const days = number(spanOf(value).amount);

  if (days < 0 || days > 366) throw invalid('Between 0 and 366 days');

  const from = monthDayOf(sql`current_date`);
  const to = monthDayOf(sql`(current_date + ${days}::int)`);

  return sql`(case when ${to} >= ${from} then ${monthDay} between ${from} and ${to} else (${monthDay} >= ${from} or ${monthDay} <= ${to}) end)`;
};

/** Date rules. Day-only values compare with days, so an index on them applies. */
export const compileDate = (
  x: SQL,
  op: ConditionRule['op'],
  value: unknown,
  dateOnly: boolean,
  monthDay?: SQL,
): SQL | undefined => {
  const today = dateOnly ? sql`current_date` : sql`now()`;

  const shift = (sign: '+' | '-') =>
    dateOnly
      ? sql`(current_date ${sql.raw(sign)} ${interval(value)})::date`
      : sql`now() ${sql.raw(sign)} ${interval(value)}`;

  // A day compares with the column as it is, so its index applies: on a timestamp, "on D" is
  // from D's start to the next day's, "after D" from the next day's start. The bounds are cast to
  // the column's type: a date-to-timestamp comparison isn't leakproof, and row level security
  // keeps such a condition out of the index.
  const cast = sql.raw(dateOnly ? 'date' : 'timestamptz');
  const start = () => sql`${text(value)}::date::${cast}`;
  const end = () => sql`(${text(value)}::date + 1)::${cast}`;

  const on = () =>
    dateOnly ? sql`${x} = ${start()}` : sql`(${x} >= ${start()} and ${x} < ${end()})`;

  switch (op) {
    case 'eq':
      return on();

    case 'neq':
      return sql`(${x} is null or not ${on()})`;

    case 'lt':
      return sql`${x} < ${start()}`;

    case 'gte':
      return sql`${x} >= ${start()}`;

    case 'lte':
      return dateOnly ? sql`${x} <= ${start()}` : sql`${x} < ${end()}`;

    case 'gt':
      return dateOnly ? sql`${x} > ${start()}` : sql`${x} >= ${end()}`;

    case 'within_last':
      return sql`(${x} <= ${today} and ${x} >= ${shift('-')})`;

    case 'more_than_ago':
      return sql`${x} < ${shift('-')}`;

    case 'within_next':
      return sql`(${x} >= ${today} and ${x} <= ${shift('+')})`;

    case 'anniversary_within':
      return sql`(${x} is not null and ${anniversary(monthDay ?? monthDayOf(x), value)})`;

    default:
      return undefined;
  }
};
