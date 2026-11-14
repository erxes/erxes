import { companies, customerCompanies, type Db } from '@erxes/core-db';
import { asc, eq, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { notFound } from '~/http/errors';
import { findCustomer } from './customerRows';

export const assertCompany = async (client: Db, companyId: string) => {
  const [company] = await client
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) {
    throw notFound('Company');
  }
};

/**
 * A link as selected, nested under `link`. Drizzle makes a nested object null when its first
 * column is null, so a column that is never null comes first.
 */
export const linkColumns = {
  createdAt: customerCompanies.createdAt,
  role: customerCompanies.role,
  isPrimaryContact: customerCompanies.isPrimaryContact,
  endedAt: customerCompanies.endedAt,
};

/** Current links first (main contact first), then former ones; oldest first within each. */
export const linkOrder = [
  sql`${customerCompanies.endedAt} IS NOT NULL`,
  sql`${customerCompanies.isPrimaryContact} DESC`,
  asc(customerCompanies.createdAt),
];

export const customerCompaniesOf = async (client: Db, id: string) => {
  await findCustomer(client, id);

  return {
    data: await wholeList((limit) =>
      client
        .select({
          id: companies.id,
          primaryName: companies.primaryName,
          avatarUrl: companies.avatarUrl,
          website: companies.website,
          link: linkColumns,
        })
        .from(customerCompanies)
        .innerJoin(companies, eq(companies.id, customerCompanies.companyId))
        .where(eq(customerCompanies.customerId, id))
        .orderBy(...linkOrder)
        .limit(limit),
    ),
  };
};
