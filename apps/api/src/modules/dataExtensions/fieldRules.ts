import { dataExtensionValueSchema, type RecordType } from '@erxes/core-contract';
import {
  caller,
  type Db,
  type DataFieldOption,
  type DataFieldSettings,
  dataFields,
} from '@erxes/core-db';
import { count, eq, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { listRecordTypes } from '~/modules/recordTypes/recordTypes.service';
import { isComputed, pluginOf } from './columns';
import { customKeyOf, FIELDS_MAX, activeObject } from './definitions';
import { UNIQUE_TYPES } from './unique';

/** What a field's definition must hold before it is saved. */

type FieldDefinition = {
  type: (typeof dataFields.$inferSelect)['type'];
  options: DataFieldOption[];
  settings: DataFieldSettings;
};

const invalid = (path: string, message: string) =>
  fail('INVALID_INPUT', message, { issues: [{ path: path.split('.'), message }] });

/** Throws 400 INVALID_INPUT when options or settings don't suit the type. */
export const assertFieldDefinition = (field: FieldDefinition) => {
  const choosing = field.type === 'select' || field.type === 'multiSelect';

  if (field.type === 'formula' && !field.settings.formula) {
    throw invalid('settings.formula', 'A formula field needs its formula');
  }

  if (field.type === 'rollup' && !field.settings.rollup) {
    throw invalid('settings.rollup', 'A rollup field needs its relation and how it sums up');
  }

  const given = field.type === 'autoNumber' || isComputed(field.type);
  const { required, unique } = field.settings;

  if (given && (required || unique || field.settings.defaultValue !== undefined)) {
    throw invalid(
      'settings',
      'erxes gives this field’s values: it takes no required, unique or default',
    );
  }

  if (choosing && !field.options.length) throw invalid('options', 'A select needs options');

  if (!choosing && field.options.length) throw invalid('options', 'Only selects have options');

  if (field.settings.unique && !UNIQUE_TYPES.has(field.type)) {
    throw invalid('settings.unique', 'Only text, email, phone, url and number fields are unique');
  }

  const { min, max } = field.settings;

  if (min !== undefined && max !== undefined && min > max) {
    throw invalid('settings.min', 'The minimum is above the maximum');
  }

  const { defaultValue } = field.settings;

  if (
    defaultValue !== undefined &&
    !dataExtensionValueSchema({ ...field, relation: null }).safeParse(defaultValue).success
  ) {
    throw invalid('settings.defaultValue', 'The default is not a value of this field');
  }
};

/**
 * 400 INVALID_INPUT for an auto number or a unique field on a plugin's record type: the plugin
 * keeps the values, so core sees no other record's to number or compare with.
 */
export const assertPluginKeeps = (
  recordType: string,
  field: Pick<FieldDefinition, 'type' | 'settings'>,
) => {
  const plugin = pluginOf(recordType);

  if (!plugin) return;

  if (field.type === 'autoNumber') {
    throw invalid('type', `${plugin} keeps these records’ values, so core can't number them`);
  }

  if (field.settings.unique) {
    throw invalid('settings.unique', `${plugin} keeps these records’ values, so none is unique`);
  }
};

/**
 * A record type fields may be added to: core's, an installed plugin's, or an active custom
 * object. 400 INVALID_REFERENCE for any other.
 */
export const extendableType = async (
  client: Db,
  recordType: string,
  field = 'recordType',
): Promise<RecordType> => {
  const key = customKeyOf(recordType);

  if (key) await activeObject(client, key);

  const found = (await listRecordTypes(client)).find((type) => type.type === recordType);

  if (!found) throw fail('INVALID_REFERENCE', `${recordType} is not a record type here`, { field });

  return found;
};

/** Throws 400 LIMIT_EXCEEDED when the record type has its most fields. */
export const assertRoom = async (client: Db, recordType: string, adding = 1) => {
  const [counted] = await client
    .select({ total: count() })
    .from(dataFields)
    .where(eq(dataFields.recordType, recordType));

  if ((counted?.total ?? 0) + adding > FIELDS_MAX) {
    throw fail('LIMIT_EXCEEDED', `A record type has at most ${FIELDS_MAX} fields`);
  }
};

/** 403 PLUGIN_FIELD for a field a plugin declared: only its manifest changes it. */
export const assertMemberField = (field: { id: string; label: string; plugin: string | null }) => {
  if (field.plugin) {
    throw fail('PLUGIN_FIELD', `${field.label} is ${field.plugin}’s: its manifest changes it`, {
      fieldId: field.id,
      plugin: field.plugin,
    });
  }
};

/**
 * A plugin reads the fields of its own record types, and the shared product catalog's with
 * `products:read` (to show the values products carry).
 */
export const assertPluginReads = (recordType: string) => {
  const who = caller();

  if (who.type !== 'plugin' || recordType.startsWith(`${who.plugin}.`)) return;

  if (recordType === 'core.product' && who.scopes.includes('products:read')) return;

  throw fail('NOT_ALLOWED', 'Plugins read the fields of their own record types and of products');
};

/** The next position at the end of a record type's fields. */
export const nextPosition = async (client: Db, recordType: string) => {
  const [row] = await client
    .select({ next: sql<number>`coalesce(max(${dataFields.position}) + 1, 0)::int` })
    .from(dataFields)
    .where(eq(dataFields.recordType, recordType));

  return row?.next ?? 0;
};

/** The columns a record type's fields have, archived ones too. */
export const takenColumns = async (client: Db, recordType: string) =>
  new Set(
    (
      await client
        .select({ column: dataFields.column })
        .from(dataFields)
        .where(eq(dataFields.recordType, recordType))
    ).flatMap((row) => (row.column ? [row.column] : [])),
  );
