import type { SearchHit, SearchType } from '@erxes/core-contract';
import {
  companies,
  customers,
  type Db,
  orgUnits,
  orgUnitTypes,
  products,
  users,
} from '@erxes/core-db';
import { and, desc, eq, type SQL, sql } from 'drizzle-orm';
import { callerCan } from '~/http/access';
import { inOrder } from '~/lib/sequence';
import { companyListWhere } from '~/modules/companies/companyList';
import { customerListWhere } from '~/modules/customers/customerList';
import { productSearch } from '~/modules/products/productList';
import { reachable } from '~/modules/units/unitRows';
import { bestMatchFirst, unitsMatching } from '~/modules/units/unitTree';
import { userSearch } from '~/modules/users/users.service';

/** The first non-empty of the values, as SQL text. */
const firstOf = (...values: SQL[]) =>
  sql<string>`coalesce(${sql.join(
    values.map((value) => sql`nullif(trim(${value}), '')`),
    sql`, `,
  )}, '')`;

/** One type's matches, newest first, as hits. */
type Finder = (client: Db, q: string, limit: number) => Promise<SearchHit[]>;

const people: Finder = async (client, q, limit) =>
  client
    .select({
      type: sql<SearchType>`'customer'`,
      id: customers.id,
      title: firstOf(
        sql`concat_ws(' ', ${customers.firstName}, ${customers.middleName}, ${customers.lastName})`,
        sql`${customers.primaryEmail}`,
        sql`${customers.primaryPhone}`,
        sql`${customers.code}`,
      ),
      subtitle: sql<
        string | null
      >`nullif(concat_ws(' · ', ${customers.primaryEmail}, ${customers.primaryPhone}, case when ${customers.state} = 'lead' then 'Lead' end), '')`,
    })
    .from(customers)
    .where(await customerListWhere(client, { search: q }))
    .orderBy(desc(customers.createdAt))
    .limit(limit);

const companyHits: Finder = async (client, q, limit) =>
  client
    .select({
      type: sql<SearchType>`'company'`,
      id: companies.id,
      title: companies.primaryName,
      subtitle: sql<
        string | null
      >`nullif(concat_ws(' · ', ${companies.primaryEmail}, ${companies.primaryPhone}, ${companies.code}), '')`,
    })
    .from(companies)
    .where(await companyListWhere(client, { search: q }))
    .orderBy(desc(companies.createdAt))
    .limit(limit);

const productHits: Finder = (client, q, limit) =>
  client
    .select({
      type: sql<SearchType>`'product'`,
      id: products.id,
      title: products.name,
      subtitle: products.code,
    })
    .from(products)
    .where(and(eq(products.status, 'active'), productSearch(q)))
    .orderBy(desc(products.createdAt))
    .limit(limit);

const memberHits: Finder = (client, q, limit) =>
  client
    .select({
      type: sql<SearchType>`'member'`,
      id: users.id,
      title: firstOf(sql`${users.fullName}`, sql`${users.email}`, sql`${users.username}`),
      subtitle: users.email,
    })
    .from(users)
    .where(userSearch(q))
    .orderBy(desc(users.createdAt))
    .limit(limit);

const unitHits: Finder = (client, q, limit) => {
  const matched = unitsMatching(client, q);

  return client
    .select({
      type: sql<SearchType>`'unit'`,
      id: orgUnits.id,
      title: orgUnits.name,
      subtitle: sql<
        string | null
      >`concat_ws(' · ', (select ${orgUnitTypes.name} from ${orgUnitTypes} where ${orgUnitTypes.id} = ${orgUnits.typeId}), ${orgUnits.code})`,
    })
    .from(matched)
    .innerJoin(orgUnits, eq(orgUnits.id, matched.id))
    .where(reachable(false))
    .orderBy(...bestMatchFirst(matched))
    .limit(limit);
};

/** What each type searches, and the permission a member needs to see it (none: every member). */
const FINDERS: Record<SearchType, { find: Finder; needs?: string }> = {
  customer: { find: people, needs: 'contacts.view' },
  company: { find: companyHits, needs: 'contacts.view' },
  product: { find: productHits },
  member: { find: memberHits, needs: 'team.view' },
  unit: { find: unitHits },
};

/** The types this member may search: a group they can't open stays out, as old erxes did. */
const visibleTypes = (type?: SearchType) =>
  Object.entries(FINDERS).flatMap(([name, finder]) =>
    (!type || name === type) && (!finder.needs || callerCan(finder.needs)) ? [finder] : [],
  );

/** The first `limit` matches of each type, in the order of `SEARCH_RECORD_TYPES`. */
export const searchRecords = async (
  client: Db,
  input: { q: string; type?: SearchType; limit: number },
) => {
  const data: SearchHit[] = [];

  // The request's one transaction runs one query at a time.
  await inOrder(visibleTypes(input.type), async ({ find }) => {
    data.push(...(await find(client, input.q, input.limit)));
  });

  return { data };
};
