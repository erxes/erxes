import type { CustomValue, Db } from '@erxes/core-db';
import { customers } from '@erxes/core-db';
import { arrayContains, eq, getTableColumns, or, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { customFieldsColumn } from '~/modules/fields/fieldValues';
import { tagIdsColumn } from '~/modules/tags/tagLinks';

export type CustomerRow = Omit<typeof customers.$inferSelect, 'searchText'> & {
  tagIds: string[];
  customFields: Record<string, CustomValue>;
};

export const inOrg = (id: string) => eq(customers.id, id);

/** Customers with their tag ids and custom field values. */
export const selectCustomers = (client: Db) => {
  const { searchText: _searchText, ...columns } = getTableColumns(customers);

  return client
    .select({
      ...columns,
      tagIds: tagIdsColumn('customer', customers.id),
      customFields: customFieldsColumn('customer', customers.id),
    })
    .from(customers);
};

/** A customer by id; with `followMerges`, an id merged into another customer resolves to it. */
export const findCustomer = async (client: Db, id: string, followMerges = false) => {
  const [row] = await selectCustomers(client)
    .where(
      followMerges ? or(eq(customers.id, id), arrayContains(customers.mergedIds, [id])) : inOrg(id),
    )
    .orderBy(sql`${customers.id} = ${id} DESC`)
    .limit(1);

  if (!row) {
    throw notFound('Customer');
  }

  return row;
};
