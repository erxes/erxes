import {
  caller,
  customerAccounts,
  customerLogins,
  customerSessions,
  type Db,
  newId,
  websites,
} from '@erxes/core-db';
import { and, asc, count, eq, getTableColumns, gt, isNull, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { unknownWebsite } from '~/modules/customerAuth/customerWebsites';

/** The plugin calling (`websites.save` and `.remove` are plugins' only). */
const callingPlugin = () => {
  const who = caller();

  if (who.type !== 'plugin') throw new Error('websites are saved by plugins');

  return who.plugin;
};

/** Websites by name, each with its accounts; a plugin sees its own. */
export const listWebsites = async (client: Db) => {
  const who = caller();

  const accounts = client
    .select({ websiteId: customerAccounts.websiteId, total: count().as('total') })
    .from(customerAccounts)
    .groupBy(customerAccounts.websiteId)
    .as('accounts');

  return {
    data: await wholeList((limit) =>
      client
        .select({
          ...getTableColumns(websites),
          accounts: sql<number>`coalesce(${accounts.total}, 0)::int`,
        })
        .from(websites)
        .leftJoin(accounts, eq(accounts.websiteId, websites.id))
        .where(who.type === 'plugin' ? eq(websites.plugin, who.plugin) : undefined)
        .orderBy(asc(websites.name), asc(websites.id))
        .limit(limit),
    ),
  };
};

/** Adds or changes the website of one of the calling plugin's records. */
export const saveWebsite = async (
  client: Db,
  input: { recordId: string; name: string; origins: string[] },
) => {
  const [row] = await client
    .insert(websites)
    .values({ id: newId(), plugin: callingPlugin(), ...input })
    .onConflictDoUpdate({
      target: [websites.orgId, websites.plugin, websites.recordId],
      set: { name: input.name, origins: input.origins, updatedAt: sql`now()` },
    })
    .returning();

  if (!row) throw new Error('the website was not saved');

  return row;
};

/** Removes the website of one of the calling plugin's records, with its accounts and sessions. */
export const removeWebsite = async (client: Db, recordId: string) => {
  const [row] = await client
    .delete(websites)
    .where(and(eq(websites.plugin, callingPlugin()), eq(websites.recordId, recordId)))
    .returning({ id: websites.id, name: websites.name });

  if (!row) throw unknownWebsite();

  return row;
};

/** Accounts as staff see them: the website's name, the logins and the live sessions. */
const accountRows = (client: Db) =>
  client
    .select({
      ...getTableColumns(customerAccounts),
      websiteName: websites.name,
      plugin: websites.plugin,
      logins: sql<
        string[]
      >`coalesce((select array_agg(${customerLogins.value} order by ${customerLogins.createdAt}) from ${customerLogins} where ${customerLogins.accountId} = ${customerAccounts.id}), '{}')`,
      sessions: sql<number>`(select count(*)::int from ${customerSessions} where ${and(
        eq(customerSessions.accountId, customerAccounts.id),
        isNull(customerSessions.revokedAt),
        gt(customerSessions.expiresAt, sql`now()`),
      )})`,
    })
    .from(customerAccounts)
    .innerJoin(websites, eq(websites.id, customerAccounts.websiteId));

/** A customer's accounts, one per website, newest first. */
export const listCustomerAccounts = async (client: Db, customerId: string) => ({
  data: await wholeList((limit) =>
    accountRows(client)
      .where(eq(customerAccounts.customerId, customerId))
      .orderBy(sql`${customerAccounts.createdAt} desc`, asc(customerAccounts.id))
      .limit(limit),
  ),
});
