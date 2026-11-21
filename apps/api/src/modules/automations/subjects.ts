import { companies, customers, type Db } from '@erxes/core-db';
import { getTableName, type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { valuesByRecord } from '~/modules/dataExtensions/hostValues.service';
import { customFieldsColumn } from '~/modules/fields/fieldValues';
import { tagIdsColumn } from '~/modules/tags/tagLinks';
import type { SubjectType } from '~/modules/views/filterFields';

export type { SubjectType };

/** Records enrolled from an audience a page (one job) at a time. */
export const SUBJECT_PAGE = 500;

/**
 * Each record type's table. Queries name the tables themselves (no alias), so a condition the
 * list filter compiles (`"core_customers"."id" = …`) applies as it is.
 */
export const SUBJECT_TABLES = { customer: customers, company: companies } as const;

/** Each record type's Data Extensions record type. */
const DATA_TYPES = { customer: 'core.customer', company: 'core.company' } as const;

export const isSubjectType = (type: string | null | undefined): type is SubjectType =>
  type === 'customer' || type === 'company';

const Row = z.looseObject({ id: z.string() });

const camelCase = (key: string) => key.replace(/_([a-z])/g, (_match, c: string) => c.toUpperCase());

/** A record as templates read it: any of its columns by path. */
export type Subject = Record<string, unknown> & { id: string; type: SubjectType };

/** A row as templates read it: camelCase, dates as ISO strings, no internals. */
const toSubject = (row: z.infer<typeof Row>, type: SubjectType): Subject => ({
  ...Object.fromEntries(
    Object.entries(row)
      .filter(([column]) => column !== 'org_id' && column !== 'search_text')
      .map(([column, value]) => [
        camelCase(column),
        value instanceof Date ? value.toISOString() : value,
      ]),
  ),
  id: row.id,
  type,
});

/**
 * Records of a type as templates see them (`subject.*`, with `tagIds`, `customFields` and the
 * Data Extensions values under `data`), in
 * id order: `where` is a condition on the type's table, `after` continues from a page's last id.
 */
export const loadSubjects = async (
  tx: Db,
  type: SubjectType,
  where: SQL | undefined,
  page: { after?: string; limit?: number } = {},
) => {
  const table = SUBJECT_TABLES[type];
  const name = sql.identifier(getTableName(table));

  const result = await tx.execute(sql`
    select ${name}.*, ${tagIdsColumn(type, table.id).sql} as tag_ids,
      ${customFieldsColumn(type, table.id)} as custom_fields
    from ${table}
    where ${where ?? sql`true`} ${page.after ? sql`and ${table.id} > ${page.after}` : sql``}
    order by ${table.id}
    limit ${page.limit ?? SUBJECT_PAGE}
  `);

  const subjects = result.rows.map((row) => toSubject(Row.parse(row), type));

  const values = await valuesByRecord(
    tx,
    DATA_TYPES[type],
    subjects.map((subject) => subject.id),
  );

  // Data Extensions values by field key: `subject.data.<key>`.
  return subjects.map((subject) => ({ ...subject, data: values.get(subject.id) ?? {} }));
};

/** The record a run is about, as templates read it. */
export const subjectOf = async (tx: Db, type: string | null, id: string | null) => {
  if (!isSubjectType(type) || !id) return null;

  const [subject] = await loadSubjects(tx, type, sql`${SUBJECT_TABLES[type].id} = ${id}`, {
    limit: 1,
  });

  return subject ?? null;
};
