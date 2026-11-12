import type { CursorQuery } from '@erxes/core-contract';
import { customerCompanies, customers, type Db } from '@erxes/core-db';
import { and, eq, inArray, type SQL, sql } from 'drizzle-orm';
import type { Actor } from '~/http/auth';
import { boundedList, LIST_COUNT_CAP } from '~/lib/boundedList';
import { keysetPage } from '~/lib/keyset';
import { matchEveryWord } from '~/lib/search';
import { hasAnyTag } from '~/modules/tags/tagLinks';
import { compileRecordFilter } from '~/modules/views/recordFilter';
import { type CustomerRow, selectCustomers, toCustomerDto } from './customerRows';

interface CustomerQuery {
  search?: string;
  state?: CustomerRow['state'];
  ownerId?: string;
  tagIds?: string[];
  companyId?: string;
  leadStageId?: string;
  ids?: string[];
  filter?: string;
}

/** Customers linked to the company. */
const linkedTo = (client: Db, orgId: string, companyId: string) =>
  inArray(
    customers.id,
    client
      .select({ id: customerCompanies.customerId })
      .from(customerCompanies)
      .where(and(eq(customerCompanies.orgId, orgId), eq(customerCompanies.companyId, companyId))),
  );

/** Names, emails, phones and code, in one trigram-indexed column. */
const searchFor = (search: string) =>
  matchEveryWord(search, (pattern, phonePattern) =>
    pattern === phonePattern
      ? sql`${customers.searchText} LIKE ${pattern.toLowerCase()}`
      : sql`(${customers.searchText} LIKE ${pattern.toLowerCase()} OR ${customers.searchText} LIKE ${phonePattern.toLowerCase()})`,
  );

/** The list's conditions (filters, advanced filter, search): the list and exports use the same. */
export const customerListWhere = async (client: Db, actor: Actor, query: CustomerQuery) => {
  const filters: (SQL | undefined)[] = [
    // Advanced filter (views): leads list is customers with the lead state.
    await compileRecordFilter(
      client,
      actor,
      query.state === 'lead' ? 'lead' : 'customer',
      query.filter,
    ),
    query.state ? eq(customers.state, query.state) : undefined,
    query.ownerId ? eq(customers.ownerId, query.ownerId) : undefined,
    query.leadStageId ? eq(customers.leadStageId, query.leadStageId) : undefined,
    query.tagIds?.length ? hasAnyTag('customer', customers.id, query.tagIds) : undefined,
    query.companyId ? linkedTo(client, actor.orgId, query.companyId) : undefined,
    query.ids ? inArray(customers.id, query.ids.length ? query.ids : ['']) : undefined,
    query.search ? searchFor(query.search) : undefined,
  ];

  return and(...filters);
};

export const listCustomers = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & CustomerQuery,
) => {
  const page = await boundedList(Boolean(query.filter || query.search), async () =>
    keysetPage(
      client,
      {
        table: customers,
        id: customers.id,
        createdAt: customers.createdAt,
        scope: eq(customers.orgId, actor.orgId),
        countCap: LIST_COUNT_CAP,
      },
      await customerListWhere(client, actor, query),
      query,
      (where, orderBy, limit) =>
        selectCustomers(client)
          .where(where)
          .orderBy(...orderBy)
          .limit(limit),
    ),
  );

  return { ...page, data: page.data.map(toCustomerDto) };
};
