import { valueAt } from './conditions';

const WHOLE = /^\{\{\s*([^{}]+?)\s*\}\}$/;
const PART = /\{\{\s*([^{}]+?)\s*\}\}/g;
const ALLOWED_ROOTS = new Set(['event', 'subject', 'steps', 'run']);

const lookup = (context: Record<string, unknown>, path: string) =>
  ALLOWED_ROOTS.has(path.split('.')[0] ?? '') ? valueAt(context, path) : undefined;

/** `name: "arg"` or `name: 3` or `name`. */
const parseFilter = (raw: string) => {
  const match = /^([a-z_]+)\s*(?::\s*(?:"([^"]*)"|'([^']*)'|(-?\d+(?:\.\d+)?)))?$/.exec(raw.trim());

  const name = match?.[1];

  if (!match || !name) return null;

  return {
    name,
    arg: match[2] ?? match[3] ?? (match[4] !== undefined ? Number(match[4]) : undefined),
  };
};

const asDate = (value: unknown) => {
  const date = value instanceof Date ? value : new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date;
};

const pad = (value: number) => String(value).padStart(2, '0');

const formatDate = (date: Date, pattern: string) =>
  pattern
    .replace('YYYY', String(date.getUTCFullYear()))
    .replace('MM', pad(date.getUTCMonth() + 1))
    .replace('DD', pad(date.getUTCDate()))
    .replace('HH', pad(date.getUTCHours()))
    .replace('mm', pad(date.getUTCMinutes()));

/**
 * Filters a placeholder can apply, left to right. Only these: nothing is
 * ever evaluated as code.
 */
const FILTERS: Record<string, (value: unknown, arg: string | number | undefined) => unknown> = {
  default: (value, arg) =>
    value === undefined || value === null || value === '' ? (arg ?? '') : value,
  upper: (value) => (typeof value === 'string' ? value.toUpperCase() : value),
  lower: (value) => (typeof value === 'string' ? value.toLowerCase() : value),
  capitalize: (value) =>
    typeof value === 'string' && value ? value.charAt(0).toUpperCase() + value.slice(1) : value,
  trim: (value) => (typeof value === 'string' ? value.trim() : value),
  truncate: (value, arg) =>
    typeof value === 'string' && typeof arg === 'number' && value.length > arg
      ? `${value.slice(0, arg)}…`
      : value,
  number: (value) =>
    value === null || value === undefined || value === '' ? value : Number(value),
  round: (value, arg) => {
    const number = Number(value);
    const digits = typeof arg === 'number' ? arg : 0;

    return Number.isFinite(number) ? Number(number.toFixed(digits)) : value;
  },
  add_days: (value, arg) => {
    const date = asDate(value);

    return date ? new Date(date.getTime() + Number(arg ?? 0) * 86_400_000).toISOString() : value;
  },
  add_hours: (value, arg) => {
    const date = asDate(value);

    return date ? new Date(date.getTime() + Number(arg ?? 0) * 3_600_000).toISOString() : value;
  },
  date: (value, arg) => {
    const date = asDate(value);

    return date ? formatDate(date, typeof arg === 'string' ? arg : 'YYYY-MM-DD') : value;
  },
  join: (value, arg) =>
    Array.isArray(value) ? value.join(typeof arg === 'string' ? arg : ', ') : value,
  count: (value) =>
    Array.isArray(value) ? value.length : value === undefined || value === null ? 0 : 1,
  first: (value) => {
    if (!Array.isArray(value)) return value;

    const items: unknown[] = value;

    return items[0];
  },
  json: (value) => JSON.stringify(value),
};

/** `subject.firstName | default: "there" | upper` → its value. Unknown filters are a mistake, reported. */
const evaluateExpression = (expression: string, context: Record<string, unknown>) => {
  const [path = '', ...filters] = expression.split('|');
  const name = path.trim();
  // `now` is the moment the step runs.
  let value: unknown = name === 'now' ? new Date().toISOString() : lookup(context, name);

  for (const raw of filters) {
    const filter = parseFilter(raw);
    const apply = filter ? FILTERS[filter.name] : undefined;

    if (!filter || !apply) throw new Error(`Unknown filter "${raw.trim()}" in {{${expression}}}`);

    value = apply(value, filter.arg);
  }

  return value;
};

/**
 * Fills `{{path | filter}}` placeholders from the run's context. A string that
 * is only one placeholder becomes that value as it is (a number stays a
 * number, a list a list); inside text, values are written out; missing ones
 * are empty.
 */
export const render = (value: unknown, context: Record<string, unknown>): unknown => {
  if (typeof value === 'string') {
    const whole = WHOLE.exec(value)?.[1];

    if (whole) return evaluateExpression(whole, context) ?? null;

    return value.replace(PART, (_match, expression: string) => {
      const found = evaluateExpression(expression, context);

      if (found === undefined || found === null) return '';

      if (typeof found === 'string') return found;

      return typeof found === 'number' || typeof found === 'boolean'
        ? String(found)
        : JSON.stringify(found);
    });
  }

  if (Array.isArray(value)) return value.map((item) => render(item, context));

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, render(item, context)]),
    );
  }

  return value;
};
