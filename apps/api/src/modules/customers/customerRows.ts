import type { Db } from '@erxes/core-db';
import { customers } from '@erxes/core-db';
import { arrayContains, eq, getTableColumns, type SQL } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { tagIdsColumn } from '~/modules/tags/tagLinks';

export type CustomerRow = Omit<typeof customers.$inferSelect, 'searchText'> & { tagIds: string[] };

export const inOrg = (id: string) => eq(customers.id, id);

/** Customers with their tag ids. */
export const selectCustomers = (client: Db) => {
  const { searchText: _searchText, ...columns } = getTableColumns(customers);

  return client
    .select({ ...columns, tagIds: tagIdsColumn('customer', customers.id) })
    .from(customers);
};

const firstCustomer = async (client: Db, where: SQL) =>
  (await selectCustomers(client).where(where).limit(1))[0];

/**
 * A customer by id; with `followMerges`, an id merged into another customer resolves to it. The id
 * is looked up first, by its key: only an id merged away reads the merged ids, which no index serves.
 */
export const findCustomer = async (client: Db, id: string, followMerges = false) => {
  const row =
    (await firstCustomer(client, inOrg(id))) ??
    (followMerges
      ? await firstCustomer(client, arrayContains(customers.mergedIds, [id]))
      : undefined);

  if (!row) {
    throw notFound('Customer');
  }

  return row;
};
