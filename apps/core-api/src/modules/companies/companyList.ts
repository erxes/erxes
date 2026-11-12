import type { CursorQuery } from '@erxes/core-contract';
import { companies, customerCompanies, customers, type Db } from '@erxes/core-db';
import { and, eq, ilike, inArray, or, type SQL, sql } from 'drizzle-orm';
import type { Actor } from '~/http/auth';
import { boundedList, LIST_COUNT_CAP } from '~/lib/boundedList';
import { keysetPage } from '~/lib/keyset';
import { matchEveryWord } from '~/lib/search';
import { linkDto, linkOrder } from '~/modules/customers/customerLinks';
import { hasAnyTag } from '~/modules/tags/tagLinks';
import { compileRecordFilter } from '~/modules/views/recordFilter';
import { findCompany, selectCompanies, toCompanyDto } from './companyRows';

interface CompanyQuery {
  search?: string;
  state?: 'lead' | 'customer';
  leadStageId?: string;
  ownerId?: string;
  tagIds?: string[];
  customerId?: string;
  ids?: string[];
  filter?: string;
}

/** Companies the customer is linked to. */
const linkedTo = (client: Db, orgId: string, customerId: string) =>
  inArray(
    companies.id,
    client
      .select({ id: customerCompanies.companyId })
      .from(customerCompanies)
      .where(and(eq(customerCompanies.orgId, orgId), eq(customerCompanies.customerId, customerId))),
  );

const searchFor = (search: string) =>
  matchEveryWord(search, (pattern, phonePattern) =>
    or(
      // Names, emails, phones and code, in one trigram-indexed column.
      sql`${companies.searchText} LIKE ${pattern.toLowerCase()}`,
      pattern === phonePattern
        ? undefined
        : sql`${companies.searchText} LIKE ${phonePattern.toLowerCase()}`,
      ilike(companies.website, pattern),
      ilike(companies.industry, pattern),
      ilike(companies.code, pattern),
    ),
  );

/** The list's conditions (filters, advanced filter, search): the list and exports use the same. */
export const companyListWhere = async (client: Db, actor: Actor, query: CompanyQuery) => {
  const filters: (SQL | undefined)[] = [
    // Company leads have their own views (and lead fields).
    await compileRecordFilter(
      client,
      actor,
      query.state === 'lead' ? 'company_lead' : 'company',
      query.filter,
    ),
    query.state ? eq(companies.state, query.state) : undefined,
    query.leadStageId ? eq(companies.leadStageId, query.leadStageId) : undefined,
    query.ownerId ? eq(companies.ownerId, query.ownerId) : undefined,
    query.tagIds?.length ? hasAnyTag('company', companies.id, query.tagIds) : undefined,
    query.customerId ? linkedTo(client, actor.orgId, query.customerId) : undefined,
    query.ids ? inArray(companies.id, query.ids.length ? query.ids : ['']) : undefined,
    query.search ? searchFor(query.search) : undefined,
  ];

  return and(...filters);
};

export const listCompanies = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & CompanyQuery,
) => {
  const page = await boundedList(Boolean(query.filter || query.search), async () =>
    keysetPage(
      client,
      {
        table: companies,
        id: companies.id,
        createdAt: companies.createdAt,
        scope: eq(companies.orgId, actor.orgId),
        countCap: LIST_COUNT_CAP,
      },
      await companyListWhere(client, actor, query),
      query,
      (where, orderBy, limit) =>
        selectCompanies(client)
          .where(where)
          .orderBy(...orderBy)
          .limit(limit),
    ),
  );

  return { ...page, data: page.data.map(toCompanyDto) };
};

/** The company's people with their links: main contact first, then current, then former. */
export const companyPeople = async (client: Db, actor: Actor, id: string) => {
  await findCompany(client, actor.orgId, id);

  const rows = await client
    .select({
      id: customers.id,
      firstName: customers.firstName,
      lastName: customers.lastName,
      primaryEmail: customers.primaryEmail,
      primaryPhone: customers.primaryPhone,
      avatarUrl: customers.avatarUrl,
      state: customers.state,
      role: customerCompanies.role,
      isPrimaryContact: customerCompanies.isPrimaryContact,
      endedAt: customerCompanies.endedAt,
      createdAt: customerCompanies.createdAt,
    })
    .from(customerCompanies)
    .innerJoin(customers, eq(customers.id, customerCompanies.customerId))
    .where(and(eq(customerCompanies.orgId, actor.orgId), eq(customerCompanies.companyId, id)))
    .orderBy(...linkOrder)
    .limit(500);

  return {
    data: rows.map(({ role, isPrimaryContact, endedAt, createdAt, ...person }) => ({
      ...person,
      link: linkDto({ role, isPrimaryContact, endedAt, createdAt }),
    })),
  };
};
