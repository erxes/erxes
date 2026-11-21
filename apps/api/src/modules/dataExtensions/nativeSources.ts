import {
  CORE_NATIVE_FIELDS,
  CUSTOM_OBJECT_NATIVE_FIELDS,
  currencyDigits,
} from '@erxes/core-contract';
import { type Db, type DataResultType, organizations } from '@erxes/core-db';
import { type SQL, sql } from 'drizzle-orm';
import {
  columnFits,
  pluginViewColumns,
  pluginViewKey,
  type ViewColumns,
} from '~/modules/plugins/pluginViews';
import {
  type ObjectsPlugin,
  objectsPlugins,
  type PluginObject,
} from '~/modules/recordTypes/recordTypes.service';
import { snake } from './columns';
import { customKeyOf } from './definitions';

/**
 * Where a record type's own fields are read: core's tables, a custom object's own table, a
 * plugin's view. Formulas and rollups read them by key (`{firstName}`, `{amount}`). A plugin's
 * view also has its records' Data Extensions values, in `custom_fields`.
 */

interface NativeColumn {
  type: DataResultType;
  /** The value, over the source's row alias. */
  read: (row: SQL) => SQL;
}

export interface NativeSource {
  /**
   * The table or view to join; null for a custom object, whose own table has them. A plugin's
   * rows always have `custom_fields`, empty when its view has none.
   */
  from: SQL | null;
  /** Its column of record ids. */
  id: string;
  columns: Map<string, NativeColumn>;
}

const RESULT: Record<string, DataResultType> = {
  text: 'text',
  select: 'text',
  member: 'text',
  product: 'text',
  number: 'number',
  boolean: 'boolean',
  date: 'date',
  dateTime: 'dateTime',
};

const at = (row: SQL, column: string) => sql`${row}.${sql.identifier(column)}`;

/** Currencies whose amounts don't have 2 decimals, so a minor-unit amount divides right. */
const ODD_DIGITS = Intl.supportedValuesOf('currency')
  .map((code) => [code, currencyDigits(code)] as const)
  .filter(([, digits]) => digits !== 2);

/** A minor-unit amount in its currency's major unit: 1250 USD cents → 12.5. */
const majorUnits = (amount: SQL, currency: SQL) =>
  sql`(${amount}::numeric / power(10, case ${currency} ${sql.join(
    ODD_DIGITS.map(([code, digits]) => sql`when ${code} then ${digits}`),
    sql` `,
  )} else 2 end))`;

const CORE_TABLES: Record<string, string> = {
  'core.customer': 'core_customers',
  'core.company': 'core_companies',
  'core.product': 'core_products',
  'core.member': 'core_users',
};

const coreSource = (recordType: string): NativeSource | null => {
  const table = CORE_TABLES[recordType];
  const fields = CORE_NATIVE_FIELDS[recordType];

  if (!table || !fields) return null;

  const columns = new Map(
    fields.map(({ key, type }): [string, NativeColumn] => [
      key,
      {
        type: RESULT[type] ?? 'text',
        read:
          recordType === 'core.product' && key === 'price'
            ? (row) => majorUnits(at(row, 'price'), at(row, 'currency'))
            : (row) => at(row, snake(key)),
      },
    ]),
  );

  return { from: sql`${sql.identifier(table)}`, id: 'id', columns };
};

const customSource = (): NativeSource => ({
  from: null,
  id: 'id',
  columns: new Map(
    CUSTOM_OBJECT_NATIVE_FIELDS.map(({ key, type }): [string, NativeColumn] => [
      key,
      { type: RESULT[type] ?? 'text', read: (row) => at(row, snake(key)) },
    ]),
  ),
});

/** What a plugin view's date column is: a date, or a date and time. */
const dateKind = (columns: ViewColumns, key: string): DataResultType =>
  columns.get(key)?.type === 'date' ? 'date' : 'dateTime';

/** Why core can't read a plugin object's records from its view at all, or null when it can. */
const readProblem = (object: PluginObject, columns: ViewColumns | undefined) => {
  if (!object.view) return `${object.label} name no view for core to read`;

  if (!columns?.size) return `The plugin's view ${object.view} isn't ready for core to read`;

  if (columns.get('id')?.category !== 'S') return `${object.view} has no id column`;

  const wrong = object.fields?.find((field) => !columnFits(columns.get(field.key), field));

  return wrong ? `${object.view} has no ${wrong.type} column ${wrong.key}` : null;
};

/** Whether a view has the `custom_fields` map its records' Data Extensions values are in. */
const hasCustomFields = (columns: ViewColumns | undefined) =>
  columns?.get('custom_fields')?.type === 'jsonb';

/**
 * Why a plugin object's own fields, or the values of the fields members added (`extended`),
 * can't be read: its view isn't the plugin's, isn't granted to core, or lacks a column. Null
 * when they can, or when there is nothing to read.
 */
export const viewProblem = (
  object: PluginObject,
  columns: ViewColumns | undefined,
  extended: boolean,
) => {
  if (!object.fields?.length && !extended) return null;

  const problem = readProblem(object, columns);

  if (problem || !extended || hasCustomFields(columns)) return problem;

  return `${object.view} has no jsonb column custom_fields for the fields added here`;
};

/** The view's rows, with an empty `custom_fields` when the view has no jsonb one. */
const viewRows = (view: string, columns: ViewColumns) => {
  if (hasCustomFields(columns)) return sql`${sql.identifier(view)}`;

  const others = [...columns.keys()]
    .filter((name) => name !== 'custom_fields')
    .map((name) => sql`${sql.identifier(name)}`);

  return sql`(select ${sql.join(others, sql`, `)}, null::jsonb as custom_fields from ${sql.identifier(view)})`;
};

const pluginSource = (
  object: PluginObject,
  columns: ViewColumns,
  currency: string,
): NativeSource | null => {
  if (!object.view || readProblem(object, columns)) return null;

  return {
    from: viewRows(object.view, columns),
    id: 'id',
    columns: new Map(
      (object.fields ?? []).map((field): [string, NativeColumn] => {
        const type =
          field.type === 'date' ? dateKind(columns, field.key) : (RESULT[field.type] ?? 'text');

        const read = (row: SQL) => {
          const value = at(row, field.key);

          if (field.array) return sql`array_to_string(${value}, ', ')`;

          return field.money ? majorUnits(value, sql`${currency}::text`) : value;
        };

        return [field.key, { type: field.array ? 'text' : type, read }];
      }),
    ),
  };
};

/** Each object of these plugins, with its view's columns. */
export const pluginObjectViews = async (client: Db, owners: ObjectsPlugin[]) => {
  const objects = owners.flatMap(({ plugin, objects: list, connected }) =>
    list.map((object) => ({ plugin, object, connected })),
  );

  const views = await pluginViewColumns(
    client,
    objects.flatMap(({ plugin, object }) => (object.view ? [{ plugin, view: object.view }] : [])),
  );

  return objects.map((entry) => ({
    ...entry,
    columns: entry.object.view
      ? views.get(pluginViewKey({ plugin: entry.plugin, view: entry.object.view }))
      : undefined,
  }));
};

/** Every record type's own-field source, loaded once per request where formulas are read. */
export const nativeSources = async (client: Db) => {
  const objects = await pluginObjectViews(client, await objectsPlugins(client));

  const currency = objects.some(({ object }) => object.fields?.some((field) => field.money))
    ? ((await client.select({ currency: organizations.currency }).from(organizations))[0]
        ?.currency ?? 'USD')
    : 'USD';

  const plugins = new Map<string, NativeSource>(
    objects.flatMap(({ object, columns, connected }) => {
      const source = connected && columns ? pluginSource(object, columns, currency) : null;

      return source ? [[object.type, source] as const] : [];
    }),
  );

  return (recordType: string): NativeSource | null =>
    customKeyOf(recordType)
      ? customSource()
      : (coreSource(recordType) ?? plugins.get(recordType) ?? null);
};

export type NativeSources = Awaited<ReturnType<typeof nativeSources>>;
