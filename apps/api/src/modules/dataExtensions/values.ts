import { dataExtensionValueSchema } from '@erxes/core-contract';
import { caller, type Db } from '@erxes/core-db';
import { callerCan } from '~/http/access';
import { fail } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { columnsWithValues } from './codec';
import { type FieldColumn, pluginOf } from './columns';
import type { DataFieldRow } from './definitions';
import { assertEditable } from './fieldAccess';
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

/** Types whose values erxes gives (the next number, a formula's result): never written. */
const GIVEN_TYPES: ReadonlySet<string> = new Set(['autoNumber', 'formula', 'rollup']);

/** Whether the caller may change a read-only field: a data model manager, or the plugin itself. */
const mayChangeReadOnly = () => caller().type === 'plugin' || callerCan('properties.manage');

/** Whether the caller is this plugin, which alone writes the fields its manifest declares. */
const isCallingPlugin = (plugin: string) => {
  const who = caller();

  return who.type === 'plugin' && who.plugin === plugin;
};

const idsIn = (value: unknown) =>
  (Array.isArray(value) ? value : [value]).filter((id) => typeof id === 'string');

/** Where in the input a field's value is: `values.<key>`, or `patch.<field id>` for a plugin's check. */
export type ValuePath = (field: Pick<DataFieldRow, 'id' | 'key'>) => (string | number)[];

export const byKeyPath: ValuePath = (field) => ['values', field.key];

const checkOne = (field: DataFieldRow, value: unknown, issues: Issue[], at: ValuePath) => {
  const parsed = dataExtensionValueSchema(field).safeParse(value);

  if (!parsed.success) {
    issues.push(
      ...parsed.error.issues.map((issue) => ({
        path: [...at(field), ...issue.path.filter((part) => typeof part !== 'symbol')],
        message: issue.message,
      })),
    );

    return undefined;
  }

  return parsed.data;
};

/**
 * Whether a relation value is kept where this write can't set it: on the linked records, when
 * they hold the link and either side is a plugin's. Core writes neither a plugin's records nor
 * a link a plugin's record holds.
 */
const keptElsewhere = (field: DataFieldRow, sides: Map<string, RelationSide>) => {
  const side = sides.get(field.id);

  return Boolean(side && !side.holds && (side.other.plugin || pluginOf(field.recordType)));
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
 * Checks `input` (values by key) against the record type's active fields: unknown keys,
 * values of the wrong shape and links kept on the linked records answer 400 INVALID_INPUT
 * with an issue per value (at `at`); a read-only field 403 NOT_ALLOWED; an id of no record
 * 400 INVALID_REFERENCE. Required fields are checked once the record's values are known
 * (`assertRequired`), since a field needs a value only while it shows.
 */
export const prepareValues = async (
  client: Db,
  fields: DataFieldRow[],
  sides: Map<string, RelationSide>,
  input: Record<string, unknown>,
  creating: boolean,
  at: ValuePath = byKeyPath,
): Promise<PreparedValues> => {
  const byKey = new Map(fields.map((field) => [field.key, field]));
  const given = creating ? withDefaults(fields, input) : input;
  const issues: Issue[] = [];
  const values: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(given)) {
    const field = byKey.get(key);

    if (!field) {
      issues.push({ path: ['values', key], message: 'No active field has this key' });
    } else if (GIVEN_TYPES.has(field.type)) {
      issues.push({ path: at(field), message: `${field.label} is worked out, not written` });
    } else if (keptElsewhere(field, sides)) {
      issues.push({ path: at(field), message: `${field.label} is kept on the linked records` });
    } else if (field.settings.readOnly && key in input && !mayChangeReadOnly()) {
      throw fail('NOT_ALLOWED', `${field.label} is read-only`);
    } else if (field.plugin && key in input && !isCallingPlugin(field.plugin)) {
      throw fail('PLUGIN_FIELD', `${field.plugin} writes ${field.label}`, {
        fieldId: field.id,
        plugin: field.plugin,
      });
    } else {
      if (key in input) assertEditable(field);
      values[key] = checkOne(field, value, issues, at);
    }
  }

  if (issues.length) throw fail('INVALID_INPUT', 'Some values are not valid', { issues });

  await inOrder(Object.entries(values), async ([key, value]) => {
    const field = byKey.get(key);
    const target = field?.type === 'member' ? 'core.member' : field?.relation?.targetRecordType;

    if (field && target) {
      await assertRecordsExist(client, target, idsIn(value), at(field).join('.'));
    }
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
