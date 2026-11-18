import { dataExtensionValueSchema } from '@erxes/core-contract';
import { caller, type Db } from '@erxes/core-db';
import { callerCan } from '~/http/access';
import { fail } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { columnsWithValues } from './codec';
import type { FieldColumn } from './columns';
import type { DataFieldRow } from './definitions';
import { assertRecordsExist } from './references';
import type { RelationSide } from './relationValues';

/**
 * A write's values, checked against their fields: what the API checks on every write, so no
 * client can skip a rule its form applies.
 */

type Issue = { path: (string | number)[]; message: string };

/** Values that go in the record's own row, and relation values kept elsewhere. */
export interface PreparedValues {
  own: { column: FieldColumn; value: unknown }[];
  outside: { side: RelationSide; value: unknown }[];
  /** The checked values by key, for the search text and the audit entry. */
  values: Record<string, unknown>;
}

/** Whether the caller may change a read-only field: a data model manager, or the plugin itself. */
const mayChangeReadOnly = () => caller().type === 'plugin' || callerCan('properties.manage');

const idsIn = (value: unknown) =>
  (Array.isArray(value) ? value : [value]).filter((id) => typeof id === 'string');

const checkOne = (field: DataFieldRow, value: unknown, issues: Issue[]) => {
  const parsed = dataExtensionValueSchema(field).safeParse(value);

  if (!parsed.success) {
    issues.push(
      ...parsed.error.issues.map((issue) => ({
        path: ['values', field.key, ...issue.path.filter((part) => typeof part !== 'symbol')],
        message: issue.message,
      })),
    );

    return undefined;
  }

  if (parsed.data === null && field.settings.required) {
    issues.push({ path: ['values', field.key], message: `${field.label} is required` });
  }

  return parsed.data;
};

/** The values a new record starts with: each field's default where the input leaves it out. */
const withDefaults = (fields: DataFieldRow[], input: Record<string, unknown>) => ({
  ...Object.fromEntries(
    fields.flatMap((field) =>
      field.settings.defaultValue === undefined ? [] : [[field.key, field.settings.defaultValue]],
    ),
  ),
  ...input,
});

/**
 * Checks `input` against the record type's active fields: unknown keys, values of the wrong
 * shape and cleared required fields answer 400 INVALID_INPUT with an issue per value; a
 * read-only field 403 NOT_ALLOWED; an id of no record 400 INVALID_REFERENCE.
 */
export const prepareValues = async (
  client: Db,
  fields: DataFieldRow[],
  sides: Map<string, RelationSide>,
  input: Record<string, unknown>,
  creating: boolean,
): Promise<PreparedValues> => {
  const byKey = new Map(fields.map((field) => [field.key, field]));
  const given = creating ? withDefaults(fields, input) : input;
  const issues: Issue[] = [];
  const values: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(given)) {
    const field = byKey.get(key);

    if (!field) {
      issues.push({ path: ['values', key], message: 'No active field has this key' });
    } else if (field.settings.readOnly && key in input && !mayChangeReadOnly()) {
      throw fail('NOT_ALLOWED', `${field.label} is read-only`);
    } else {
      values[key] = checkOne(field, value, issues);
    }
  }

  if (creating) {
    for (const field of fields) {
      if (
        field.settings.required &&
        (values[field.key] ?? null) === null &&
        !(field.key in given)
      ) {
        issues.push({ path: ['values', field.key], message: `${field.label} is required` });
      }
    }
  }

  if (issues.length) throw fail('INVALID_INPUT', 'Some values are not valid', { issues });

  await inOrder(Object.entries(values), async ([key, value]) => {
    const field = byKey.get(key);
    const target = field?.type === 'member' ? 'core.member' : field?.relation?.targetRecordType;

    if (target) await assertRecordsExist(client, target, idsIn(value), `values.${key}`);
  });

  const chosen = fields.filter((field) => field.key in values);

  return {
    own: chosen.flatMap((field) => columnsWithValues(field, values[field.key] ?? null)),
    outside: chosen.flatMap((field) => {
      const side = sides.get(field.id);

      return side && !side.holds ? [{ side, value: values[field.key] ?? null }] : [];
    }),
    values,
  };
};
