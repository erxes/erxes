import { DATA_EXTENSION_VISIBLE_OPERATORS } from '@erxes/core-db/dataExtensionEnums';
import { CONDITION_MATCHES } from '@erxes/core-db/enums';
import { z } from 'zod';

/**
 * When a field shows (`visibleWhen`, `hiddenWhen`) or is required (`requiredWhen`), by the
 * record's other values: one rule, or several that must all or any one hold. The API checks
 * them on every write and web's forms with the same code.
 */

/** A field's key: camelCase, or the snake_case code a plugin's field keeps. */
export const DataExtensionFieldKey = z
  .string()
  .regex(/^[a-z][a-zA-Z0-9_]{0,49}$/, 'letters, digits and _, starting with a lower case letter');

/** One rule: another field of the record (its key), how it compares, and with what. */
export const DataExtensionRule = z.object({
  field: DataExtensionFieldKey,
  operator: z.enum(DATA_EXTENSION_VISIBLE_OPERATORS),
  value: z.json().optional(),
});

export type DataExtensionRule = z.infer<typeof DataExtensionRule>;

/** A rule, or rules that must all (`all`) or any one (`any`) hold. */
export const DataExtensionCondition = z.union([
  DataExtensionRule,
  z.object({
    match: z.enum(CONDITION_MATCHES),
    rules: z.array(DataExtensionRule).min(1).max(10),
  }),
]);

export type DataExtensionCondition = z.infer<typeof DataExtensionCondition>;

/** The rules of a condition, whichever form it takes. */
export const rulesOf = (condition: DataExtensionCondition): DataExtensionRule[] =>
  'rules' in condition ? condition.rules : [condition];

type Values = Record<string, unknown>;

/** No value: null, blank text, an empty list, or a composite with every part empty. */
export const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') return true;

  if (Array.isArray(value)) return value.length === 0;

  return typeof value === 'object' && Object.values(value).every(isEmptyValue);
};

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** A value's items: a list's, or the value alone. */
const itemsOf = (value: unknown): unknown[] => (Array.isArray(value) ? value : [value]);

/** `value` matches `wanted`; a list matches when one of its items does. */
const matches = (value: unknown, wanted: unknown) =>
  itemsOf(value).some((item) => same(item, wanted));

/** Text a value holds, for `contains`: a composite's parts too. */
const textsOf = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];

  if (typeof value === 'number' || typeof value === 'boolean') return [String(value)];

  if (value && typeof value === 'object') return Object.values(value).flatMap(textsOf);

  return [];
};

/** -1, 0 or 1 for two numbers, or two texts (ISO dates sort as text); null when they don't compare. */
const order = (a: unknown, b: unknown) => {
  if (typeof a === 'number' && typeof b === 'number') return Math.sign(a - b);

  if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0;

  return null;
};

const ruleHolds = (rule: DataExtensionRule, values: Values) => {
  // A rule on a field that's no longer active (no key in `values`) never holds.
  if (!(rule.field in values)) return false;

  const value = values[rule.field] ?? null;

  switch (rule.operator) {
    case 'isNotEmpty':
      return !isEmptyValue(value);
    case 'isEmpty':
      return isEmptyValue(value);
    case 'eq':
      return matches(value, rule.value);
    case 'neq':
      return !matches(value, rule.value);
    case 'in':
      return Array.isArray(rule.value) && rule.value.some((wanted) => matches(value, wanted));
    case 'contains': {
      const wanted = textsOf(rule.value).join(' ').toLowerCase();

      return textsOf(value).some((text) => text.toLowerCase().includes(wanted));
    }

    case 'greaterThan':
      return itemsOf(value).some((item) => order(item, rule.value) === 1);
    case 'lessThan':
      return itemsOf(value).some((item) => order(item, rule.value) === -1);
  }
};

/** Whether a record's values (by field key) meet a condition. */
export const conditionHolds = (condition: DataExtensionCondition, values: Values) => {
  const rules = rulesOf(condition);
  const holds = (rule: DataExtensionRule) => ruleHolds(rule, values);

  return 'match' in condition && condition.match === 'any' ? rules.some(holds) : rules.every(holds);
};

/** Whether a field shows, given the record's values: `visibleWhen` holds and `hiddenWhen` doesn't. */
export const fieldShows = (
  settings: { visibleWhen?: DataExtensionCondition; hiddenWhen?: DataExtensionCondition },
  values: Values,
) =>
  (!settings.visibleWhen || conditionHolds(settings.visibleWhen, values)) &&
  !(settings.hiddenWhen && conditionHolds(settings.hiddenWhen, values));

/**
 * Whether a field needs a value, given the record's values: `required` (where the write or
 * form asks for the field, `asked`) or `requiredWhen` holds, and only while the field shows:
 * not `hidden`, `visibleWhen` holds and `hiddenWhen` doesn't.
 */
export const fieldRequired = (
  settings: {
    hidden?: boolean;
    required?: boolean;
    requiredWhen?: DataExtensionCondition;
    visibleWhen?: DataExtensionCondition;
    hiddenWhen?: DataExtensionCondition;
  },
  values: Values,
  asked = true,
) =>
  !settings.hidden &&
  fieldShows(settings, values) &&
  ((asked && Boolean(settings.required)) ||
    Boolean(settings.requiredWhen && conditionHolds(settings.requiredWhen, values)));
