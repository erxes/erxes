import type { CustomValue, Db } from '@erxes/core-db';
import { companies } from '@erxes/core-db';
import { arrayContains, eq, getTableColumns, or, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { customFieldsColumn } from '~/modules/fields/fieldValues';
import { tagIdsColumn } from '~/modules/tags/tagLinks';

export type CompanyRow = Omit<typeof companies.$inferSelect, 'searchText' | 'visibleTo'> & {
  tagIds: string[];
  customFields: Record<string, CustomValue>;
};

export const inOrg = (id: string) => eq(companies.id, id);

/** Companies with their tag ids and custom field values. */
export const selectCompanies = (client: Db) => {
  // `visibleTo` is the database's own (row level security): it never leaves it.
  const { searchText: _searchText, visibleTo: _visibleTo, ...columns } = getTableColumns(companies);

  return client
    .select({
      ...columns,
      tagIds: tagIdsColumn('company', companies.id),
      customFields: customFieldsColumn('company', companies.id),
    })
    .from(companies);
};

/** A company by id; with `followMerges`, an id merged into another company resolves to it. */
export const findCompany = async (client: Db, id: string, followMerges = false) => {
  const [row] = await selectCompanies(client)
    .where(
      followMerges ? or(eq(companies.id, id), arrayContains(companies.mergedIds, [id])) : inOrg(id),
    )
    .orderBy(sql`${companies.id} = ${id} DESC`)
    .limit(1);

  if (!row) {
    throw notFound('Company');
  }

  return row;
};
