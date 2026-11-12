import type { ConditionGroup, ConditionRule } from '@erxes/core-contract';

/** A value at a dotted path (`subject.customFields.abc`), or undefined. */
export const valueAt = (context: Record<string, unknown>, path: string): unknown =>
  path.split('.').reduce<unknown>((current, key) => {
    if (current === null || current === undefined) return undefined;

    if (Array.isArray(current) && /^\d+$/.test(key)) return current[Number(key)];

    return typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  }, context);

const isEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

const asNumber = (value: unknown) => {
  if (typeof value === 'number') return value;

  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value)))
    return Number(value);

  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return Date.parse(value);

  return Number.NaN;
};

const same = (a: unknown, b: unknown) =>
  typeof a === 'string' && typeof b === 'string'
    ? a.toLowerCase() === b.toLowerCase()
    : JSON.stringify(a) === JSON.stringify(b);

const DAY = 86_400_000;

/** `{ amount, unit }` → milliseconds (months as 30 days, like the SQL side's calendar months near enough for "in the last 3 months"). */
const span = (value: unknown) => {
  const { amount, unit } = (value ?? {}) as { amount?: unknown; unit?: unknown };
  const n = typeof amount === 'number' && amount >= 0 ? amount : Number.NaN;

  return n * (unit === 'months' ? 30 * DAY : unit === 'weeks' ? 7 * DAY : DAY);
};

const asTime = (value: unknown) =>
  typeof value === 'string' || value instanceof Date ? new Date(value).getTime() : Number.NaN;

/** Days until the next time this date's day and month come round (0 = today). */
export const daysToAnniversary = (value: unknown, now = new Date()): number => {
  const date = new Date(asTime(value));

  if (Number.isNaN(date.getTime())) return Number.NaN;

  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const next = (year: number) => {
    // 29 February falls on 28 February in other years.
    const day = Math.min(
      date.getUTCDate(),
      new Date(Date.UTC(year, date.getUTCMonth() + 1, 0)).getUTCDate(),
    );

    return Date.UTC(year, date.getUTCMonth(), day);
  };

  const thisYear = next(now.getUTCFullYear());

  return Math.round(
    ((thisYear >= today ? thisYear : next(now.getUTCFullYear() + 1)) - today) / DAY,
  );
};

/** One rule. Text comparisons ignore case; numbers and dates compare by value. Never runs code. */
export const evaluateRule = (rule: ConditionRule, context: Record<string, unknown>): boolean => {
  const actual = valueAt(context, rule.path);
  const expected = rule.value;

  switch (rule.op) {
    case 'exists':
      return !isEmpty(actual);
    case 'not_exists':
      return isEmpty(actual);
    case 'eq':
      return same(actual, expected);
    case 'neq':
      return !same(actual, expected);
    case 'gt':
      return asNumber(actual) > asNumber(expected);
    case 'gte':
      return asNumber(actual) >= asNumber(expected);
    case 'lt':
      return asNumber(actual) < asNumber(expected);
    case 'lte':
      return asNumber(actual) <= asNumber(expected);
    case 'contains':
      return Array.isArray(actual)
        ? actual.some((item) => same(item, expected))
        : typeof actual === 'string' &&
            typeof expected === 'string' &&
            actual.toLowerCase().includes(expected.toLowerCase());
    case 'not_contains':
      return !evaluateRule({ ...rule, op: 'contains' }, context);
    case 'starts_with':
      return (
        typeof actual === 'string' &&
        typeof expected === 'string' &&
        actual.toLowerCase().startsWith(expected.toLowerCase())
      );
    case 'in':
      return Array.isArray(expected) && expected.some((item) => same(actual, item));
    case 'not_in':
      return !(Array.isArray(expected) && expected.some((item) => same(actual, item)));
    case 'within_last': {
      const at = asTime(actual);

      return at <= Date.now() && at >= Date.now() - span(expected);
    }

    case 'more_than_ago':
      return asTime(actual) < Date.now() - span(expected);
    case 'within_next': {
      const at = asTime(actual);

      return at >= Date.now() && at <= Date.now() + span(expected);
    }

    case 'anniversary_within':
      return daysToAnniversary(actual) <= span(expected) / DAY;
    default:
      return false;
  }
};

export const evaluateGroup = (
  group: ConditionGroup | undefined,
  context: Record<string, unknown>,
): boolean => {
  if (!group || !group.rules.length) return true;

  const results = group.rules.map((rule) =>
    'match' in rule ? evaluateGroup(rule, context) : evaluateRule(rule, context),
  );

  return group.match === 'all' ? results.every(Boolean) : results.some(Boolean);
};
