import {
  type DataFieldCondition,
  dataFields,
  type Db,
  type DataFieldSettings,
} from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { type DataFieldRow, fieldsOf } from './definitions';
import { assertRoles } from './fieldAccess';
import { recordChanges } from './valueHistory';

/**
 * What every write to a record's values ends with, in its transaction: rules that depend on
 * the record's other values (`requiredWhen`), then the record's value history.
 */

type Values = Record<string, unknown>;

/** No value: null, blank text, an empty list, or a composite with every part empty. */
const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') return true;

  if (Array.isArray(value)) return value.length === 0;

  return typeof value === 'object' && Object.values(value).every(isEmptyValue);
};

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** `value` matches `wanted`; a list matches when one of its items does. */
const matches = (value: unknown, wanted: unknown) =>
  Array.isArray(value) ? value.some((item) => same(item, wanted)) : same(value, wanted);

/**
 * Whether a record's values meet a condition on one of its fields. One on a field that's no
 * longer active (no key in `values`) never holds.
 */
const conditionHolds = (condition: DataFieldCondition, values: Values) => {
  if (!(condition.field in values)) return false;

  const value = values[condition.field] ?? null;

  switch (condition.operator) {
    case 'isNotEmpty':
      return !isEmptyValue(value);
    case 'eq':
      return matches(value, condition.value);
    case 'neq':
      return !matches(value, condition.value);
    case 'in':
      return (
        Array.isArray(condition.value) && condition.value.some((wanted) => matches(value, wanted))
      );
  }
};

/** 400 INVALID_INPUT for each field its `requiredWhen` makes required and the record leaves empty. */
const assertRequiredWhen = (fields: DataFieldRow[], values: Values) => {
  const issues = fields.flatMap((field) => {
    const rule = field.settings.requiredWhen;

    return rule && conditionHolds(rule, values) && isEmptyValue(values[field.key])
      ? [
          {
            path: ['values', field.key],
            message: `${field.label} is required while ${rule.field} is set this way`,
          },
        ]
      : [];
  });

  if (issues.length) throw fail('INVALID_INPUT', 'Some values are not valid', { issues });
};

/**
 * Checks the record's values after a write and records what it changed (`before` null: a new
 * record). `after` is every value, the caller's hidden fields included.
 */
export const afterWrite = async (
  client: Db,
  input: {
    recordType: string;
    recordId: string;
    fields: DataFieldRow[];
    before: Values | null;
    after: Values;
  },
) => {
  assertRequiredWhen(input.fields, input.after);
  await recordChanges(client, input);
};

const CONDITIONS = ['visibleWhen', 'requiredWhen'] as const;

/** Conditions on a renamed field follow it to its new key. */
export const renameInConditions = (client: Db, recordType: string, from: string, to: string) =>
  inOrder(CONDITIONS, (setting) =>
    client
      .update(dataFields)
      .set({
        settings: sql`jsonb_set(${dataFields.settings}, ${`{${setting},field}`}::text[], to_jsonb(${to}::text))`,
      })
      .where(
        and(
          eq(dataFields.recordType, recordType),
          sql`${dataFields.settings} -> ${setting} ->> 'field' = ${from}`,
        ),
      ),
  );

/**
 * 400 INVALID_INPUT unless each condition (`visibleWhen`, `requiredWhen`) names another active
 * field of the record type; 400 INVALID_REFERENCE for a role `visibleTo` or `editableBy` names
 * that the organisation lacks.
 */
export const assertSettings = async (
  client: Db,
  field: { recordType: string; key: string; settings: DataFieldSettings },
) => {
  await assertRoles(client, field.settings);
  await assertConditions(client, field);
};

const assertConditions = async (
  client: Db,
  field: { recordType: string; key: string; settings: DataFieldSettings },
) => {
  const named = CONDITIONS.flatMap((setting) => {
    const condition = field.settings[setting];

    return condition ? [{ setting, key: condition.field }] : [];
  });

  if (!named.length) return;

  const keys = new Set((await fieldsOf(client, field.recordType)).map((row) => row.key));

  const issues = named
    .filter(({ key }) => key === field.key || !keys.has(key))
    .map(({ setting, key }) => ({
      path: ['settings', setting, 'field'],
      message: `${key} is not another field of this record type`,
    }));

  if (issues.length) throw fail('INVALID_INPUT', 'A condition names no other field', { issues });
};
