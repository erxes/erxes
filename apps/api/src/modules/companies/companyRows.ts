import type { CustomValue, Db } from '@erxes/core-db';
import { companies } from '@erxes/core-db';
import { arrayContains, eq, getTableColumns, type SQL } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { customFieldsColumn } from '~/modules/fields/fieldValues';
import { tagIdsColumn } from '~/modules/tags/tagLinks';

export type CompanyRow = Omit<typeof companies.$inferSelect, 'searchText'> & {
  tagIds: string[];
  customFields: Record<string, CustomValue>;
};

export const inOrg = (id: string) => eq(companies.id, id);

/** Companies with their tag ids and custom field values. */
export const selectCompanies = (client: Db) => {
  const { searchText: _searchText, ...columns } = getTableColumns(companies);

  return client
    .select({
      ...columns,
      tagIds: tagIdsColumn('company', companies.id),
      customFields: customFieldsColumn('company', companies.id),
    })
    .from(companies);
};

const firstCompany = async (client: Db, where: SQL) =>
  (await selectCompanies(client).where(where).limit(1))[0];

/**
 * A company by id; with `followMerges`, an id merged into another company resolves to it. The id
 * is looked up first, by its key: only an id merged away reads the merged ids, which no index serves.
 */
export const findCompany = async (client: Db, id: string, followMerges = false) => {
  const row =
    (await firstCompany(client, inOrg(id))) ??
    (followMerges
      ? await firstCompany(client, arrayContains(companies.mergedIds, [id]))
      : undefined);

  if (!row) {
    throw notFound('Company');
  }

  return row;
};
