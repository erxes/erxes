import {
  caller,
  companies,
  type ContentType,
  type CustomValue,
  customers,
  type Db,
  fields,
  pluginInstallations,
  type StoredPluginManifest,
} from '@erxes/core-db';
import { textArray } from '@erxes/plugin-sdk/filter';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { inOrder } from '~/lib/sequence';
import { checkValue, isEmpty } from './customValues';
import { hasOptions } from './fieldRows';
import { rowsOf, valuesTable } from './fieldValues';

type DeclaredField = NonNullable<StoredPluginManifest['fields']>[number];

/** The manifest's fields as a FROM item (`d`), each with its place in the manifest. */
const declaredRows = (declared: DeclaredField[]) =>
  sql`jsonb_to_recordset(${JSON.stringify(
    declared.map((field, order) => ({
      code: field.code,
      content_type: field.contentType,
      label: field.label,
      type: field.type,
      options: hasOptions(field.type) ? unique(field.options ?? []) : [],
      description: field.description ?? null,
      order,
    })),
  )}::jsonb) as d(code text, content_type text, label text, type text, options text[], description text, "order" int)`;

/**
 * Brings the plugin's fields in line with its manifest in every organisation the scope sees
 * that has it installed (one organisation inside `withOrg`): new ones are made, changed ones
 * take the manifest's label, type, options and description, dropped ones are archived (values
 * kept) and come back when the manifest names them again. A changed type clears the field's
 * values: they were stored for the old one, and the plugin writes them again.
 */
export const syncPluginFields = async (tx: Db, plugin: string, declared: DeclaredField[] = []) => {
  const d = declaredRows(declared);

  const retyped = (contentType: ContentType) => {
    const values = valuesTable(contentType);

    return tx.execute(sql`delete from ${values} v using ${fields} f, ${d}
      where v.field_id = f.id and f.plugin = ${plugin} and f.content_type = ${contentType}
        and d.content_type = f.content_type and d.code = f.code and d.type <> f.type`);
  };

  await retyped('customer');
  await retyped('company');

  if (declared.length)
    // Ids from SQL: one statement for every organisation, however many have the plugin.
    await tx.execute(sql`insert into ${fields}
        (id, org_id, content_type, plugin, code, label, type, options, description, "order")
      select substr(md5(random()::text || i.org_id || d.content_type || d.code), 1, 17),
        i.org_id, d.content_type, ${plugin}, d.code, d.label, d.type, d.options, d.description, d."order"
      from ${pluginInstallations} i cross join ${d}
      where i.plugin = ${plugin}
      on conflict (org_id, content_type, plugin, code) where plugin is not null do update
        set label = excluded.label, type = excluded.type, options = excluded.options,
          description = excluded.description, archived_at = null, updated_at = now()
        where (${fields}.label, ${fields}.type, ${fields}.options, ${fields}.description, ${fields}.archived_at)
          is distinct from (excluded.label, excluded.type, excluded.options, excluded.description, null)`);

  await tx.execute(sql`update ${fields} f set archived_at = now(), updated_at = now()
    where f.plugin = ${plugin} and f.archived_at is null
      and not exists (select 1 from ${d} where d.content_type = f.content_type and d.code = f.code)`);
};

type PluginValue = { recordId: string; code: string; value: CustomValue | null };

/** Rows a single insert takes at most (parameters stay well under Postgres' 65 535). */
const INSERT_BATCH = 2000;

/**
 * Writes values of the calling plugin's own fields, by the manifest's codes. Quiet on purpose:
 * these are facts the plugin computes (a customer's total spent), so no timeline entry, event,
 * audit row or notification, which would otherwise come on every order. Records this
 * organisation doesn't have are skipped; the last value of a record's field wins.
 */
export const setPluginValues = async (
  tx: Db,
  input: { contentType: ContentType; values: PluginValue[] },
) => {
  const { plugin } = caller('plugin');
  const { contentType } = input;
  const codes = unique(input.values.map((item) => item.code));

  const owned = await tx
    .select()
    .from(fields)
    .where(
      and(
        eq(fields.plugin, plugin),
        eq(fields.contentType, contentType),
        inArray(fields.code, codes),
        isNull(fields.archivedAt),
      ),
    )
    // A manifest sync can't retype a field while values are written against it.
    .for('share');

  const byCode = new Map(owned.map((field) => [field.code, field]));
  const records = contentType === 'customer' ? customers : companies;
  const ids = unique(input.values.map((item) => item.recordId));

  const found = new Set(
    (await tx.select({ id: records.id }).from(records).where(inArray(records.id, ids))).map(
      (row) => row.id,
    ),
  );

  const latest = new Map<
    string,
    { recordId: string; fieldId: string; rows: ReturnType<typeof rowsOf> }
  >();

  for (const item of input.values) {
    const field = byCode.get(item.code);

    if (!field)
      throw fail(
        'INVALID_FIELD',
        `The ${plugin} manifest declares no ${contentType} field "${item.code}"`,
        { fieldId: item.code },
      );

    if (!found.has(item.recordId)) continue;

    const value = item.value === null || isEmpty(item.value) ? null : checkValue(field, item.value);
    const base = { recordId: item.recordId, fieldId: field.id };

    latest.set(`${item.recordId} ${field.id}`, {
      ...base,
      rows: value === null || isEmpty(value) ? [] : rowsOf(base, field.type, value),
    });
  }

  const writes = [...latest.values()];

  if (writes.length) {
    const values = valuesTable(contentType);

    await tx.execute(sql`delete from ${values}
      where (record_id, field_id) in (select * from unnest(${textArray(writes.map((write) => write.recordId))}, ${textArray(writes.map((write) => write.fieldId))}))`);

    const rows = writes.flatMap((write) => write.rows);

    const batches = Array.from({ length: Math.ceil(rows.length / INSERT_BATCH) }, (_, index) =>
      rows.slice(index * INSERT_BATCH, (index + 1) * INSERT_BATCH),
    );

    await inOrder(batches, (batch) => tx.insert(values).values(batch));
  }

  return { written: writes.length, skipped: ids.filter((id) => !found.has(id)) };
};
