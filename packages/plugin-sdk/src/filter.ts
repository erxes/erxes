/**
 * A list's filter bar (erxes-ui's `ListFilter`) as SQL, the way core compiles its own lists:
 *
 *   const FIELDS = {
 *     'subject.name': { type: 'text', expr: tickets.name },
 *     'subject.assigneeIds': { type: 'member', expr: tickets.assigneeIds, array: true },
 *     'subject.tagIds': { type: 'tags', expr: tickets.tagIds },
 *     'subject.createdAt': { type: 'date', expr: tickets.createdAt },
 *   } satisfies FilterFields;
 *
 *   input: z.object({ filter: FilterParam.optional() }),
 *   .where(compileFilter(FIELDS, input.filter, { me: member.userId }))
 *
 * A rule on a path `fields` lacks, or with an operator or value its field can't take, throws
 * core's 400 `INVALID_FILTER`.
 */
import {
  type ConditionGroup,
  type ConditionRule,
  ERRORS,
  type FilterField,
  RecordFilter,
} from '@erxes/core-contract';
import { ORPCError } from '@orpc/client';
import { and, type Column, inArray, not, or, type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';

/** A filter that doesn't fit its fields: core's 400 `INVALID_FILTER`. */
export const invalidFilter = (message: string) =>
  new ORPCError('INVALID_FILTER', { status: ERRORS.INVALID_FILTER.status, message });

/** One field a list can be filtered by, as `ListFilter`'s field `type` says it compares. */
export interface FilterColumn {
  /** `member`, `customer`, `company` and `product` hold ids of those records; "me" is a member. */
  type: FilterField['type'];
  /** The value as SQL: a column, or an expression over the list's table. */
  expr: Column | SQL;
  /** Named in errors; the path when absent. */
  label?: string;
  /** A `text[]` column, such as members or tag ids: "is" means "has". `tags` always is one. */
  array?: boolean;
  /** Only a day, no time: dates compare as dates, so an index on them applies. */
  dateOnly?: boolean;
  /** Text with a trigram index: "is" is an ILIKE without wildcards, so the index serves it. */
  trigram?: boolean;
  /** "Anniversary within" reads this month * 100 + day expression (a stored birthday's). */
  monthDay?: SQL;
}

/** The fields a list can be filtered by, keyed by the rules' paths (`subject.<name>`). */
export type FilterFields = Record<string, FilterColumn>;

/** "Me" in a member rule: the member asking, if a member is. */
export interface FilterContext {
  me?: string | null;
}

/** A list's `filter` query parameter: the condition group as JSON. */
export const FilterParam: z.ZodType<ConditionGroup, string> = z
  .string()
  .transform((text, context) => {
    try {
      const parsed: unknown = JSON.parse(text);

      return parsed;
    } catch {
      context.addIssue({ code: 'custom', message: 'filter is not JSON' });

      return z.NEVER;
    }
  })
  .pipe(RecordFilter);

/** A text array parameter (a JS array in a template becomes a list of parameters, not one array). */
export const textArray = (values: string[]) =>
  sql`array[${sql.join(
    values.map((value) => sql`${value}`),
    sql`, `,
  )}]::text[]`;

/** A LIKE pattern's text, where `%`, `_` and `\` match themselves. */
export const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export const text = (value: unknown) => {
  if (typeof value !== 'string' && typeof value !== 'number')
    throw invalidFilter('A text value is needed');

  return String(value);
};

export const list = (value: unknown) => {
  if (!Array.isArray(value) || !value.length) throw invalidFilter('Choose at least one value');

  return value.map(text);
};

export const number = (value: unknown) => {
  const n = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(n)) throw invalidFilter('A number is needed');

  return n;
};

/** `{ amount, unit }` of the relative date rules; anything else has no amount. */
const Span = z.object({ amount: z.unknown(), unit: z.unknown() }).partial();

const spanOf = (value: unknown) => Span.safeParse(value).data ?? {};

const interval = (value: unknown): SQL => {
  const { amount, unit } = spanOf(value);
  const n = number(amount);

  if (n < 0 || n > 3650) throw invalidFilter('Between 0 and 3650');

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
const monthDayOf = (day: SQL | Column) =>
  sql`((extract(month from ${day}) * 100 + extract(day from ${day}))::smallint)`;

/** A month-day worked out once per query (a subquery), not once per row. */
const once = (bound: SQL) => sql`(select (${bound})::smallint)`;

/**
 * "Within the next n days, any year", over a month-day expression; the window may run past 31
 * December. Two ranges whose bounds depend only on today: from today to the window's end (or to
 * 31 December when it wraps), and from 1 January to the window's end when it wraps (empty when
 * it doesn't). Plain ranges let an index on the month-day serve them, and each bound is a
 * subquery, worked out once per query instead of once per row.
 */
const anniversary = (monthDay: SQL, value: unknown) => {
  const days = number(spanOf(value).amount);

  if (days < 0 || days > 366) throw invalidFilter('Between 0 and 366 days');

  const from = monthDayOf(sql`current_date`);
  const to = monthDayOf(sql`(current_date + ${days}::int)`);
  const wraps = sql`${to} < ${from}`;

  return sql`(${monthDay} between ${once(from)} and ${once(sql`case when ${wraps} then 1231 else ${to} end`)}
    or ${monthDay} between 101::smallint and ${once(sql`case when ${wraps} then ${to} else 0 end`)})`;
};

/** Date rules. Day-only values compare with days, so an index on them applies. */
export const compileDate = (
  x: SQL | Column,
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

/** A `text[]` column: "is" and "contains" mean it has the value, "is any of" that it has one of them. */
const compileArray = (
  x: SQL | Column,
  values: (value: unknown) => string[],
  rule: ConditionRule,
) => {
  switch (rule.op) {
    case 'eq':
    case 'contains':
      return sql`${x} @> ${textArray(values(rule.value))}`;

    case 'neq':
    case 'not_contains':
      return sql`not (${x} @> ${textArray(values(rule.value))})`;

    case 'in':
      return sql`${x} && ${textArray(list(rule.value).flatMap(values))}`;

    case 'not_in':
      return sql`not (${x} && ${textArray(list(rule.value).flatMap(values))})`;

    default:
      return undefined;
  }
};

/** A member id; "me" is the member asking. */
const memberId = (value: unknown, { me }: FilterContext) => {
  if (value !== 'me') return text(value);

  if (!me) throw invalidFilter('“me” is a member; this caller is not one');

  return me;
};

const ID_TYPES = new Set<FilterColumn['type']>(['member', 'customer', 'company', 'product']);

/** The fields whose values are record ids: a member's, customer's, company's or product's. */
const isId = (field: FilterColumn) => ID_TYPES.has(field.type);

/** A rule's value as an id of `field`'s records; only a member field reads "me". */
const idOf = (field: FilterColumn, value: unknown, context: FilterContext) =>
  field.type === 'member' ? memberId(value, context) : text(value);

const compileId = (field: FilterColumn, rule: ConditionRule, context: FilterContext) => {
  const x = field.expr;
  const id = (value: unknown) => idOf(field, value, context);

  switch (rule.op) {
    case 'eq':
      return sql`${x} = ${id(rule.value)}`;

    case 'neq':
      return sql`(${x} is null or ${x} <> ${id(rule.value)})`;

    case 'in':
      return inArray(sql`${x}`, list(rule.value).map(id));

    case 'not_in':
      return sql`(${x} is null or not ${inArray(sql`${x}`, list(rule.value).map(id))})`;

    default:
      return undefined;
  }
};

/** A rule's list of values, lower-cased, as a `text[]` parameter. */
export const lowerList = (value: unknown) =>
  textArray(list(value).map((item) => item.toLowerCase()));

const compileText = (field: FilterColumn, rule: ConditionRule) => {
  const x = field.expr;

  // With a trigram index, "is" as a wildcard-free ILIKE uses it; otherwise lower() = lower().
  const is = (value: string) =>
    field.trigram ? sql`${x} ilike ${escapeLike(value)}` : sql`lower(${x}) = lower(${value})`;

  switch (rule.op) {
    case 'eq':
      return is(text(rule.value));

    case 'neq':
      return sql`(${x} is null or not ${is(text(rule.value))})`;

    case 'contains':
      return sql`${x} ilike ${`%${escapeLike(text(rule.value))}%`}`;

    case 'not_contains':
      return sql`(${x} is null or ${x} not ilike ${`%${escapeLike(text(rule.value))}%`})`;

    case 'starts_with':
      return sql`${x} ilike ${`${escapeLike(text(rule.value))}%`}`;

    case 'in':
      return sql`lower(${x}) = any(${lowerList(rule.value)})`;

    case 'not_in':
      return sql`(${x} is null or not (lower(${x}) = any(${lowerList(rule.value)})))`;

    default:
      return undefined;
  }
};

const compileNumber = (x: SQL | Column, rule: ConditionRule) => {
  if (rule.op === 'neq') return sql`(${x} is null or ${x} <> ${number(rule.value)})`;

  const compare = COMPARE[rule.op];

  return compare ? sql`${x} ${sql.raw(compare)} ${number(rule.value)}` : undefined;
};

const compileBoolean = (x: SQL | Column, rule: ConditionRule) => {
  if (rule.op !== 'eq') return undefined;

  return rule.value === true || rule.value === 'true' ? sql`${x} is true` : sql`${x} is not true`;
};

const isArray = (field: FilterColumn) => field.array === true || field.type === 'tags';

/** One rule on one field, or `INVALID_FILTER` when the field can't take its operator or value. */
export const compileColumn = (
  field: FilterColumn,
  path: string,
  rule: ConditionRule,
  context: FilterContext = {},
): SQL => {
  const x = field.expr;
  const { op } = rule;

  if (op === 'exists')
    return isArray(field)
      ? sql`cardinality(${x}) > 0`
      : field.type === 'text'
        ? sql`coalesce(${x}, '') <> ''`
        : sql`${x} is not null`;

  if (op === 'not_exists')
    return not(compileColumn(field, path, { ...rule, op: 'exists' }, context));

  const compiled = isArray(field)
    ? compileArray(x, (value) => [idOf(field, value, context)], rule)
    : field.type === 'number'
      ? compileNumber(x, rule)
      : field.type === 'date'
        ? compileDate(x, op, rule.value, Boolean(field.dateOnly), field.monthDay)
        : isId(field)
          ? compileId(field, rule, context)
          : field.type === 'boolean'
            ? compileBoolean(x, rule)
            : field.type === 'select' || field.type === 'text'
              ? compileText(field, rule)
              : undefined;

  if (!compiled) throw invalidFilter(`“${field.label ?? path}” can't use “${op}”`);

  return compiled;
};

/** A condition group as SQL, each rule through `compileRule`: all of its rules, or any. */
export const compileGroup = (
  group: ConditionGroup,
  compileRule: (rule: ConditionRule) => SQL,
  depth = 1,
): SQL | undefined => {
  if (depth > 3) throw invalidFilter('At most three levels of groups');

  const parts = group.rules
    .map((rule) =>
      'match' in rule ? compileGroup(rule, compileRule, depth + 1) : compileRule(rule),
    )
    .filter((part): part is SQL => Boolean(part));

  if (!parts.length) return undefined;

  return group.match === 'all' ? and(...parts) : or(...parts);
};

/** A list's filter as one SQL condition on its table, or undefined when it has no rules. */
export const compileFilter = (
  fields: FilterFields,
  filter: ConditionGroup | null | undefined,
  context: FilterContext = {},
) =>
  filter
    ? compileGroup(filter, (rule) => {
        const field = fields[rule.path];

        if (!field) throw invalidFilter(`Unknown field: ${rule.path}`);

        if (rule.where)
          throw invalidFilter(`“${field.label ?? rule.path}” has no related records to narrow`);

        return compileColumn(field, rule.path, rule, context);
      })
    : undefined;
