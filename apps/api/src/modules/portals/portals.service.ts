import type { coreContract } from '@erxes/core-contract';
import {
  caller,
  CUSTOMER_ADDRESS_KINDS,
  customerAccounts,
  customerLogins,
  customerSessions,
  type Db,
  integrationConnections,
  newId,
  portalPlugins,
  portals,
} from '@erxes/core-db';
import { and, asc, eq, getTableColumns, gt, inArray, isNull, ne, sql } from 'drizzle-orm';
import type { InferContractRouterInputs } from '@orpc/contract';
import { fail, notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { unknownPortal } from '~/modules/customerAuth/customerPortals';
import { PORTAL_CONNECTIONS } from './portalConnections';

type Inputs = InferContractRouterInputs<typeof coreContract>['portals'];

/** The plugin calling (`save`, `attach` and `detach` are plugins' only). */
const callingPlugin = () => {
  const who = caller();

  if (who.type !== 'plugin') throw new Error('portal records are saved by plugins');

  return who.plugin;
};

/** Portals with their plugins and how many accounts each has. */
const portalRows = (client: Db) => {
  const accounts = client
    .select({ portalId: customerAccounts.portalId, total: sql<number>`count(*)`.as('total') })
    .from(customerAccounts)
    .groupBy(customerAccounts.portalId)
    .as('accounts');

  return client
    .select({
      ...getTableColumns(portals),
      plugins: sql<
        string[]
      >`coalesce((select array_agg(${portalPlugins.plugin} order by ${portalPlugins.plugin}) from ${portalPlugins} where ${portalPlugins.portalId} = ${portals.id}), '{}')`,
      accounts: sql<number>`coalesce(${accounts.total}, 0)::int`,
    })
    .from(portals)
    .leftJoin(accounts, eq(accounts.portalId, portals.id));
};

export const listPortals = async (client: Db) => ({
  data: await wholeList((limit) =>
    portalRows(client).orderBy(asc(portals.name), asc(portals.id)).limit(limit),
  ),
});

export const getPortal = async (client: Db, id: string) => {
  const [row] = await portalRows(client).where(eq(portals.id, id)).limit(1);

  if (!row) throw notFound('Portal');

  return row;
};

type PortalFields = Partial<Omit<Inputs['update'], 'id'>>;

/** 400 UNKNOWN_CONNECTION unless each connection given is the organisation's, of its integration. */
const checkConnections = async (client: Db, fields: PortalFields) => {
  const given = PORTAL_CONNECTIONS.flatMap(([column, key]) => {
    const id = fields[column];

    return id ? [{ id, key }] : [];
  });

  if (!given.length) return;

  const found = await client
    .select({ id: integrationConnections.id, key: integrationConnections.key })
    .from(integrationConnections)
    .where(
      inArray(
        integrationConnections.id,
        given.map(({ id }) => id),
      ),
    );

  const wrong = given.find(({ id, key }) => !found.some((row) => row.id === id && row.key === key));

  if (wrong) throw fail('UNKNOWN_CONNECTION', `Pick one of your ${wrong.key} connections`);
};

export const createPortal = async (client: Db, input: Inputs['create']) => {
  await checkConnections(client, input);

  const [row] = await client
    .insert(portals)
    .values({ id: newId(), ...input })
    .returning();

  if (!row) throw new Error('the portal was not saved');

  return row;
};

export const updatePortal = async (client: Db, { id, ...changes }: Inputs['update']) => {
  await checkConnections(client, changes);

  const [row] = await client
    .update(portals)
    .set({ ...changes, updatedAt: sql`now()` })
    .where(eq(portals.id, id))
    .returning();

  if (!row) throw notFound('Portal');

  return row;
};

/** Deletes a portal with its accounts, sessions and server keys; its customers stay. */
export const removePortal = async (client: Db, id: string) => {
  const [row] = await client
    .delete(portals)
    .where(eq(portals.id, id))
    .returning({ id: portals.id, name: portals.name });

  if (!row) throw notFound('Portal');

  return row;
};

/** The portal one of the calling plugin's records is on, if any. */
const portalOfRecord = (client: Db, plugin: string, recordId: string) =>
  client
    .select({ portalId: portalPlugins.portalId })
    .from(portalPlugins)
    .where(and(eq(portalPlugins.plugin, plugin), eq(portalPlugins.recordId, recordId)))
    .limit(1)
    .then(([row]) => row?.portalId);

/** The portal a record runs (a content site): made and attached the first time, renamed after. */
export const savePortal = async (client: Db, { recordId, name, origins }: Inputs['save']) => {
  const plugin = callingPlugin();
  const current = await portalOfRecord(client, plugin, recordId);

  if (current) return updatePortal(client, { id: current, name, origins });

  const portal = await createPortal(client, { name, origins });

  await client.insert(portalPlugins).values({ portalId: portal.id, plugin, recordId });

  return portal;
};

/**
 * Puts one of the calling plugin's records on a portal: off the portal it was on, in place of
 * the plugin's record there before.
 */
export const attachPortal = async (client: Db, { id, recordId }: Inputs['attach']) => {
  const plugin = callingPlugin();

  const [portal] = await client
    .select({ id: portals.id })
    .from(portals)
    .where(eq(portals.id, id))
    .limit(1);

  if (!portal) throw notFound('Portal');

  await client
    .delete(portalPlugins)
    .where(
      and(
        eq(portalPlugins.plugin, plugin),
        eq(portalPlugins.recordId, recordId),
        ne(portalPlugins.portalId, id),
      ),
    );

  const [row] = await client
    .insert(portalPlugins)
    .values({ portalId: id, plugin, recordId })
    .onConflictDoUpdate({
      target: [portalPlugins.portalId, portalPlugins.plugin],
      set: { recordId, createdAt: sql`now()` },
    })
    .returning();

  if (!row) throw new Error('the record was not attached');

  return row;
};

/** Takes one of the calling plugin's records off its portal; the portal and its accounts stay. */
export const detachPortal = async (client: Db, recordId: string) => {
  const [row] = await client
    .delete(portalPlugins)
    .where(and(eq(portalPlugins.plugin, callingPlugin()), eq(portalPlugins.recordId, recordId)))
    .returning();

  if (!row) throw unknownPortal();

  return row;
};

/** Accounts as staff see them: the portal's name, the logins and the live sessions. */
const accountRows = (client: Db) =>
  client
    .select({
      ...getTableColumns(customerAccounts),
      portalName: portals.name,
      logins: sql<
        string[]
      >`coalesce((select array_agg(case when ${inArray(customerLogins.kind, [...CUSTOMER_ADDRESS_KINDS])} then ${customerLogins.value} else ${customerLogins.kind} end order by ${customerLogins.createdAt}) from ${customerLogins} where ${customerLogins.accountId} = ${customerAccounts.id}), '{}')`,
      sessions: sql<number>`(select count(*)::int from ${customerSessions} where ${and(
        eq(customerSessions.accountId, customerAccounts.id),
        isNull(customerSessions.revokedAt),
        gt(customerSessions.expiresAt, sql`now()`),
      )})`,
    })
    .from(customerAccounts)
    .innerJoin(portals, eq(portals.id, customerAccounts.portalId));

/** A customer's accounts, one per portal, newest first. */
export const listCustomerAccounts = async (client: Db, customerId: string) => ({
  data: await wholeList((limit) =>
    accountRows(client)
      .where(eq(customerAccounts.customerId, customerId))
      .orderBy(sql`${customerAccounts.createdAt} desc`, asc(customerAccounts.id))
      .limit(limit),
  ),
});
