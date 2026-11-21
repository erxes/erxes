import { dataExtensionValueSchema } from '@erxes/core-contract';
import { caller, companies, customers, type Db, dataFields } from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { columnParam, columnsWithValues } from './codec';
import { activeField, type DataFieldRow, ensureTable, qualified } from './definitions';
import { PLUGIN_FIELD_RECORD_TYPES } from './pluginFieldSync';

/**
 * A plugin writes the values of the fields its manifest declares on customers and companies,
 * by their codes. Quiet on purpose: these are facts the plugin works out (a customer's total
 * spent), so no history entry, event, audit row or notification, which would come on every order.
 */

type PluginValue = { recordId: string; code: string; value: number | string | string[] | null };

const isBlank = (value: PluginValue['value']) =>
  value === null || value === '' || (Array.isArray(value) && !value.length);

/** A select's value for the text a plugin sent: an option's value, or its label. */
const optionValue = (field: DataFieldRow, text: string) =>
  field.options.find((option) => option.value === text || option.label === text)?.value ?? text;

/** The value as the field keeps it; 400 INVALID_FIELD_VALUE when it doesn't fit. */
const checked = (field: DataFieldRow, item: PluginValue) => {
  if (isBlank(item.value)) return null;

  const value =
    field.type === 'select' && typeof item.value === 'string'
      ? optionValue(field, item.value)
      : field.type === 'multiSelect' && Array.isArray(item.value)
        ? item.value.map((text) => optionValue(field, text))
        : item.value;

  const parsed = dataExtensionValueSchema(field).safeParse(value);

  if (!parsed.success) {
    throw fail('INVALID_FIELD_VALUE', `${JSON.stringify(item.value)} doesn't fit ${field.label}`, {
      fieldId: item.code,
    });
  }

  return parsed.data;
};

type Write = { recordId: string; field: DataFieldRow; value: unknown };

/** Writes by what `keyOf` says of each, in first-seen order. */
const grouped = (writes: Write[], keyOf: (write: Write) => string) => {
  const groups = new Map<string, Write[]>();

  for (const write of writes)
    groups.set(keyOf(write), [...(groups.get(keyOf(write)) ?? []), write]);

  return groups;
};

/** Upserts the values of records that set the same fields, in one statement. */
const upsert = (client: Db, table: string, writes: Write[]) => {
  const fields = [...new Map(writes.map((write) => [write.field.id, write.field])).values()];
  const byRecord = grouped(writes, (write) => write.recordId);

  const columns = fields.flatMap((field) =>
    columnsWithValues(field, null).map(({ column }) => column),
  );

  const names = columns.map((column) => sql`${sql.identifier(column.name)}`);

  const rows = [...byRecord].map(([recordId, set]) => {
    const params = fields.flatMap((field) =>
      columnsWithValues(field, set.find((write) => write.field.id === field.id)?.value ?? null).map(
        ({ column, value }) => columnParam(column, value),
      ),
    );

    return sql`(${recordId}, ${sql.join(params, sql`, `)})`;
  });

  return client.execute(
    sql`insert into ${qualified(table)} (record_id, ${sql.join(names, sql`, `)})
      values ${sql.join(rows, sql`, `)}
      on conflict (record_id) do update set ${sql.join(
        [...names.map((name) => sql`${name} = excluded.${name}`), sql`updated_at = now()`],
        sql`, `,
      )}`,
  );
};

/**
 * Writes values of the calling plugin's own fields, by the manifest's codes; the last value of
 * a record's field wins. Records this organisation doesn't have are skipped. 400 INVALID_FIELD
 * for a code the manifest doesn't declare (or a field it dropped).
 */
export const setPluginDataValues = async (
  client: Db,
  input: { contentType: keyof typeof PLUGIN_FIELD_RECORD_TYPES; values: PluginValue[] },
) => {
  const { plugin } = caller('plugin');
  const recordType = PLUGIN_FIELD_RECORD_TYPES[input.contentType];
  const codes = [...new Set(input.values.map((item) => item.code))];

  const owned = await client
    .select()
    .from(dataFields)
    .where(
      and(
        eq(dataFields.recordType, recordType),
        eq(dataFields.plugin, plugin),
        inArray(dataFields.key, codes),
        activeField,
      ),
    )
    // A manifest sync can't retype a field while values are written against it.
    .for('share');

  const byCode = new Map(owned.map((field) => [field.key, field]));
  const records = input.contentType === 'customer' ? customers : companies;
  const ids = [...new Set(input.values.map((item) => item.recordId))];

  const found = new Set(
    (await client.select({ id: records.id }).from(records).where(inArray(records.id, ids))).map(
      (row) => row.id,
    ),
  );

  const latest = new Map<string, Write>();

  for (const item of input.values) {
    const field = byCode.get(item.code);

    if (!field) {
      throw fail(
        'INVALID_FIELD',
        `The ${plugin} manifest declares no ${recordType} field “${item.code}”`,
        {
          fieldId: item.code,
        },
      );
    }

    if (found.has(item.recordId)) {
      latest.set(`${item.recordId} ${field.id}`, {
        recordId: item.recordId,
        field,
        value: checked(field, item),
      });
    }
  }

  const writes = [...latest.values()];

  if (writes.length) {
    const table = await ensureTable(client, recordType);

    const fieldsOfRecord = new Map(
      [...grouped(writes, (write) => write.recordId)].map(([recordId, set]) => [
        recordId,
        set
          .map((write) => write.field.id)
          .toSorted()
          .join(','),
      ]),
    );

    // Records that set the same fields go in one statement each.
    await inOrder(
      [...grouped(writes, (write) => fieldsOfRecord.get(write.recordId) ?? '').values()],
      (batch) => upsert(client, table, batch),
    );
  }

  return { written: writes.length, skipped: ids.filter((id) => !found.has(id)) };
};
