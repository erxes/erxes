import type { Db } from '@erxes/core-db';
import { type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { customFieldsColumn } from '~/modules/fields/fieldValues';

/** Records enrolled from an audience a page (one job) at a time. */
export const SUBJECT_PAGE = 500;

const TABLES = {
  customer: { table: 'core_customers', tags: 'core_customer_tags', key: 'customer_id' },
  company: { table: 'core_companies', tags: 'core_company_tags', key: 'company_id' },
} as const;

export type SubjectType = keyof typeof TABLES;

const isSubjectType = (type: string | null): type is SubjectType =>
  type === 'customer' || type === 'company';

const Row = z.looseObject({ id: z.string() });

const camelCase = (key: string) => key.replace(/_([a-z])/g, (_match, c: string) => c.toUpperCase());

/** A record as templates and conditions read it: any of its columns by path. */
export type Subject = Record<string, unknown> & { id: string; type: SubjectType };

/** A row as templates and conditions read it: camelCase, dates as ISO strings, no internals. */
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
 * Records of a type as conditions see them (`subject.*`, with `tagIds` and
 * `customFields`), in id order: `after` continues from a page's last id.
 */
export const loadSubjects = async (
  tx: Db,
  type: SubjectType,
  where: SQL = sql`true`,
  page: { after?: string; limit?: number } = {},
) => {
  const { table, tags, key } = TABLES[type];

  const result = await tx.execute(sql`
    select r.*,
      coalesce((select array_agg(t.tag_id) from ${sql.identifier(tags)} t where t.org_id = r.org_id and t.${sql.identifier(key)} = r.id), '{}') as tag_ids,
      ${customFieldsColumn(type, sql`r.id`)} as custom_fields
    from ${sql.identifier(table)} r
    where ${where} ${page.after ? sql`and r.id > ${page.after}` : sql``}
    order by r.id
    limit ${page.limit ?? SUBJECT_PAGE}
  `);

  return result.rows.map((row) => toSubject(Row.parse(row), type));
};

/** The record a run is about, as templates and conditions read it. */
export const subjectOf = async (tx: Db, type: string | null, id: string | null) => {
  if (!isSubjectType(type) || !id) return null;

  const [subject] = await loadSubjects(tx, type, sql`r.id = ${id}`, { limit: 1 });

  return subject ?? null;
};
