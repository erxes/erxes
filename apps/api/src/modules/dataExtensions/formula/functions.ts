import { type SQL, sql } from 'drizzle-orm';
import { FormulaError } from './parse';
import {
  as,
  clampInt,
  need,
  NULL,
  PG_TYPES,
  textOf,
  type Typed,
  unify,
  type ValueType,
} from './types';

/**
 * The functions a formula calls (`IF`, `ROUND`, `DAYS`, `CONCAT`…): each checks its arguments'
 * types and builds SQL that can't fail as the query runs.
 */

export interface Fn {
  /** Fewest and most arguments. */
  args: [number, number];
  build: (args: Typed[], at: number) => Typed;
}

const numberFn = (name: string, build: (value: SQL) => SQL): Fn => ({
  args: [1, 1],
  build: ([value = NULL], at) => {
    need(value, ['number'], at, name);

    return { sql: build(as(value, 'number')), type: 'number' };
  },
});

const textFn = (name: string, build: (value: SQL) => SQL, type: ValueType = 'text'): Fn => ({
  args: [1, 1],
  build: ([value = NULL], at) => {
    need(value, ['text'], at, name);

    return { sql: build(as(value, 'text')), type };
  },
});

const datePart = (part: string): Fn => ({
  args: [1, 1],
  build: ([value = NULL], at) => {
    need(value, ['date', 'dateTime'], at, part.toUpperCase());

    return { sql: sql`extract(${sql.raw(part)} from ${value.sql})::numeric`, type: 'number' };
  },
});

/** Several values of one type, as `word(a, b, …)`. */
const ofOneType = (name: string, word: string, refuse: ValueType[] = []): Fn => ({
  args: [name === 'COALESCE' ? 2 : 1, 20],
  build: (args, at) => {
    const type = unify(args, at, name);

    if (refuse.includes(type))
      throw new FormulaError(`${name} compares numbers, text and dates`, at);

    const list = sql.join(
      args.map((arg) => as(arg, type)),
      sql`, `,
    );

    return { sql: sql`${sql.raw(word)}(${list})`, type };
  },
});

const logic = (word: 'and' | 'or'): Fn => ({
  args: [1, 20],
  build: (args, at) => {
    for (const arg of args) need(arg, ['boolean'], at, word.toUpperCase());

    const list = sql.join(
      args.map((arg) => as(arg, 'boolean')),
      sql.raw(` ${word} `),
    );

    return { sql: sql`(${list})`, type: 'boolean' };
  },
});

const addTo = (unit: 'days' | 'months'): Fn => ({
  args: [2, 2],
  build: ([date = NULL, count = NULL], at) => {
    const name = unit === 'days' ? 'ADD_DAYS' : 'ADD_MONTHS';

    need(date, ['date', 'dateTime'], at, name);
    need(count, ['number'], at, name);

    const interval = sql`make_interval(${sql.raw(unit)} => ${clampInt(count, -100_000, 100_000)})`;
    const type = date.type === 'dateTime' ? 'dateTime' : 'date';

    return { sql: sql`(${as(date, type)} + ${interval})::${PG_TYPES[type]}`, type };
  },
});

/** The first or last `count` characters. */
const slice = (word: 'left' | 'right'): Fn => ({
  args: [2, 2],
  build: ([text = NULL, count = NULL], at) => {
    need(text, ['text'], at, word.toUpperCase());
    need(count, ['number'], at, word.toUpperCase());

    return {
      sql: sql`${sql.raw(word)}(${as(text, 'text')}, ${clampInt(count, 0, 10_000)})`,
      type: 'text',
    };
  },
});

export const FUNCTIONS: Record<string, Fn> = {
  IF: {
    args: [2, 3],
    build: ([test = NULL, then = NULL, otherwise = NULL], at) => {
      need(test, ['boolean'], at, 'IF');

      const type = unify([then, otherwise], at, 'IF');

      return {
        sql: sql`(case when ${as(test, 'boolean')} then ${as(then, type)} else ${as(otherwise, type)} end)`,
        type,
      };
    },
  },
  AND: logic('and'),
  OR: logic('or'),
  NOT: {
    args: [1, 1],
    build: ([value = NULL], at) => {
      need(value, ['boolean'], at, 'NOT');

      return { sql: sql`(not ${as(value, 'boolean')})`, type: 'boolean' };
    },
  },
  ROUND: {
    args: [1, 2],
    build: ([value = NULL, places], at) => {
      need(value, ['number'], at, 'ROUND');

      const digits = places ? clampInt(places, 0, 10) : sql`0`;

      return { sql: sql`round(${as(value, 'number')}, ${digits})`, type: 'number' };
    },
  },
  FLOOR: numberFn('FLOOR', (value) => sql`floor(${value})`),
  CEIL: numberFn('CEIL', (value) => sql`ceil(${value})`),
  ABS: numberFn('ABS', (value) => sql`abs(${value})`),
  SQRT: numberFn('SQRT', (value) => sql`(case when ${value} >= 0 then sqrt(${value}) end)`),
  MIN: ofOneType('MIN', 'least', ['boolean']),
  MAX: ofOneType('MAX', 'greatest', ['boolean']),
  COALESCE: ofOneType('COALESCE', 'coalesce'),
  DAYS: {
    args: [2, 2],
    build: ([from = NULL, to = NULL], at) => {
      need(from, ['date', 'dateTime'], at, 'DAYS');
      need(to, ['date', 'dateTime'], at, 'DAYS');

      return { sql: sql`((${to.sql})::date - (${from.sql})::date)::numeric`, type: 'number' };
    },
  },
  TODAY: { args: [0, 0], build: () => ({ sql: sql`current_date`, type: 'date' }) },
  NOW: { args: [0, 0], build: () => ({ sql: sql`now()`, type: 'dateTime' }) },
  ADD_DAYS: addTo('days'),
  ADD_MONTHS: addTo('months'),
  YEAR: datePart('year'),
  MONTH: datePart('month'),
  DAY: datePart('day'),
  WEEKDAY: datePart('isodow'),
  CONCAT: {
    args: [1, 20],
    build: (args) => ({ sql: sql`concat(${sql.join(args.map(textOf), sql`, `)})`, type: 'text' }),
  },
  TEXT: { args: [1, 1], build: ([value = NULL]) => ({ sql: textOf(value), type: 'text' }) },
  NUMBER: textFn(
    'NUMBER',
    (value) =>
      sql`(case when trim(${value}) ~ '^-?[0-9]+(\\.[0-9]+)?$' then trim(${value})::numeric end)`,
    'number',
  ),
  LEN: textFn('LEN', (value) => sql`char_length(${value})::numeric`, 'number'),
  UPPER: textFn('UPPER', (value) => sql`upper(${value})`),
  LOWER: textFn('LOWER', (value) => sql`lower(${value})`),
  TRIM: textFn('TRIM', (value) => sql`trim(${value})`),
  LEFT: slice('left'),
  RIGHT: slice('right'),
  CONTAINS: {
    args: [2, 2],
    build: ([text = NULL, part = NULL], at) => {
      need(text, ['text'], at, 'CONTAINS');
      need(part, ['text'], at, 'CONTAINS');

      return {
        sql: sql`(strpos(lower(${as(text, 'text')}), lower(${as(part, 'text')})) > 0)`,
        type: 'boolean',
      };
    },
  },
  ISEMPTY: {
    args: [1, 1],
    build: ([value = NULL]) => {
      const blank = value.type === 'text' ? sql` or ${value.sql} = ''` : sql``;

      return { sql: sql`(${value.sql} is null${blank})`, type: 'boolean' };
    },
  },
};
