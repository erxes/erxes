import { conditionHolds, fieldRequired, isEmptyValue, rulesOf } from '@erxes/core-contract';
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
import { byKeyPath, type ValuePath } from './values';

/**
 * What every write to a record's values ends with, in its transaction: rules that depend on
 * the record's other values (`requiredWhen`), then the record's value history.
 */

type Values = Record<string, unknown>;

/** Which fields a write asks for, so their `required` holds. */
export type Asked = (field: DataFieldRow) => boolean;

/**
 * A write asks for the fields it names (`keys`); with `onCreate`, a new record's also those
 * its create form shows (`showInCreate`).
 */
export const askedBy = (keys: Iterable<string>, onCreate = false): Asked => {
  const named = new Set(keys);

  return (field) => named.has(field.key) || (onCreate && field.settings.showInCreate !== false);
};

const requiredMessage = (field: DataFieldRow, values: Values) => {
  const rule = field.settings.requiredWhen;

  return rule && conditionHolds(rule, values)
    ? `${field.label} is required while ${rulesOf(rule)
        .map((one) => one.field)
        .join(', ')} is set this way`
    : `${field.label} is required`;
};

/**
 * 400 INVALID_INPUT for each field the record leaves empty while it needs a value: `required`
 * where the write asks for it, or `requiredWhen` holds, and only while the field shows (as old
 * custom properties' `isRequired`). A plugin's field is the plugin's to fill. `values` are by
 * key, every active field's.
 */
export const assertRequired = (
  fields: DataFieldRow[],
  values: Values,
  asked: Asked,
  at: ValuePath = byKeyPath,
) => {
  const issues = fields.flatMap((field) =>
    !field.plugin &&
    isEmptyValue(values[field.key]) &&
    fieldRequired(field.settings, values, asked(field))
      ? [{ path: at(field), message: requiredMessage(field, values) }]
      : [],
  );

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
    asked: Asked;
  },
) => {
  assertRequired(input.fields, input.after, input.asked);
  await recordChanges(client, input);
};

const CONDITIONS = ['visibleWhen', 'hiddenWhen', 'requiredWhen'] as const;

const renamed = (condition: DataFieldCondition, from: string, to: string): DataFieldCondition => {
  const rename = <T extends { field: string }>(rule: T) =>
    rule.field === from ? { ...rule, field: to } : rule;

  return 'rules' in condition
    ? { ...condition, rules: condition.rules.map(rename) }
    : rename(condition);
};

const names = (settings: DataFieldSettings, key: string) =>
  CONDITIONS.some((setting) => {
    const condition = settings[setting];

    return condition ? rulesOf(condition).some((rule) => rule.field === key) : false;
  });

/** Conditions on a renamed field follow it to its new key. */
export const renameInConditions = async (
  client: Db,
  recordType: string,
  from: string,
  to: string,
) => {
  const naming = (await fieldsOf(client, recordType, true)).filter((field) =>
    names(field.settings, from),
  );

  await inOrder(naming, (field) => {
    const settings = { ...field.settings };

    for (const setting of CONDITIONS) {
      const condition = settings[setting];

      if (condition) settings[setting] = renamed(condition, from, to);
    }

    return client
      .update(dataFields)
      .set({ settings, updatedAt: sql`now()` })
      .where(and(eq(dataFields.id, field.id), eq(dataFields.recordType, recordType)));
  });
};

/**
 * 400 INVALID_INPUT unless each condition (`visibleWhen`, `hiddenWhen`, `requiredWhen`) names
 * other active fields of the record type; 400 INVALID_REFERENCE for a role `visibleTo` or
 * `editableBy` names that the organisation lacks.
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

    if (!condition) return [];

    return 'rules' in condition
      ? condition.rules.map((rule, index) => ({
          path: ['settings', setting, 'rules', index, 'field'],
          key: rule.field,
        }))
      : [{ path: ['settings', setting, 'field'], key: condition.field }];
  });

  if (!named.length) return;

  const keys = new Set((await fieldsOf(client, field.recordType)).map((row) => row.key));

  const issues = named
    .filter(({ key }) => key === field.key || !keys.has(key))
    .map(({ path, key }) => ({ path, message: `${key} is not another field of this record type` }));

  if (issues.length) throw fail('INVALID_INPUT', 'A condition names no other field', { issues });
};
