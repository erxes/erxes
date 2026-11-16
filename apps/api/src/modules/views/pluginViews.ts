import type { ViewListType } from '@erxes/core-contract';
import { companies, customers, type Db, views } from '@erxes/core-db';
import { and, asc, eq, getTableColumns, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { companyListWhere } from '~/modules/companies/companyList';
import { customerListWhere } from '~/modules/customers/customerList';

/**
 * The team's shared views of a list, for a plugin (`views:read`): the ones a plugin may use as
 * segments. A member's own views stay theirs.
 */
export const listSharedViews = async (client: Db, recordType: ViewListType) => ({
  data: await wholeList((limit) =>
    client
      .select({ ...getTableColumns(views), editable: sql<boolean>`false` })
      .from(views)
      .where(and(eq(views.recordType, recordType), eq(views.shared, true)))
      .orderBy(asc(sql`lower(${views.name})`))
      .limit(limit),
  ),
});

/**
 * The records among `recordIds` the view's filter and search match now: its list's own query
 * (`customerListWhere`, `companyListWhere`), narrowed to the ids. Only a shared view decides:
 * a member's own one may change at any time, unseen by the team.
 */
export const viewMatches = async (
  client: Db,
  { viewId, recordIds }: { viewId: string; recordIds: string[] },
) => {
  const [view] = await client.select().from(views).where(eq(views.id, viewId)).limit(1);

  if (!view) throw notFound('View');

  if (!view.shared)
    throw fail(
      'VIEW_NOT_SHARED',
      "Only views shared with the team can be used: this one is a member's own",
    );

  const query = {
    filter: view.filter,
    search: view.search ?? undefined,
    ids: recordIds,
  };

  switch (view.recordType) {
    case 'customer':
    case 'lead': {
      const where = await customerListWhere(client, {
        ...query,
        state: view.recordType === 'lead' ? 'lead' : 'customer',
      });

      const rows = await client.select({ id: customers.id }).from(customers).where(where);

      return { recordIds: rows.map((row) => row.id) };
    }

    case 'company':
    case 'company_lead': {
      const where = await companyListWhere(client, {
        ...query,
        state: view.recordType === 'company_lead' ? 'lead' : 'customer',
      });

      const rows = await client.select({ id: companies.id }).from(companies).where(where);

      return { recordIds: rows.map((row) => row.id) };
    }

    default:
      throw fail(
        'INVALID_TYPE',
        `Only customer, lead and company views can be matched; this one is of ${view.recordType}`,
      );
  }
};
