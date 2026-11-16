import type { ConditionGroup } from '@erxes/core-contract';
import {
  type BroadcastChannel,
  broadcastRecipients,
  customers,
  type Db,
  suppressions,
  views,
} from '@erxes/core-db';
import { and, asc, count, eq, gt, inArray, isNotNull, not, type SQL, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { repeatWhile } from '~/lib/sequence';
import { customerListWhere } from '~/modules/customers/customerList';

/** Who a broadcast is for: a saved customer view, a filter of its own, or (neither) everyone. */
export interface Audience {
  viewId?: string | null;
  filter?: ConditionGroup | null;
}

/** The view must be one of the customer or lead lists; its list, filter and search apply. */
const viewQuery = async (client: Db, viewId: string) => {
  const [view] = await client
    .select({ recordType: views.recordType, filter: views.filter, search: views.search })
    .from(views)
    .where(eq(views.id, viewId))
    .limit(1);

  if (!view) throw notFound('View');

  if (view.recordType !== 'customer' && view.recordType !== 'lead') {
    throw fail('INVALID_TYPE', 'A broadcast goes to a view of customers or leads');
  }

  return { state: view.recordType, filter: view.filter, search: view.search ?? undefined };
};

/** The customers an audience matches, as one condition on `core_customers`. */
export const audienceWhere = async (client: Db, audience: Audience) =>
  audience.viewId
    ? customerListWhere(client, await viewQuery(client, audience.viewId))
    : customerListWhere(client, { filter: audience.filter });

/** The address a customer gets the channel at. */
const addressOf = (channel: BroadcastChannel): SQL<string | null> =>
  channel === 'email' ? sql`lower(${customers.primaryEmail})` : sql`${customers.primaryPhone}`;

/** The address is suppressed on the channel. */
const isSuppressed = (channel: BroadcastChannel, address: SQL | string) =>
  sql`exists (select 1 from ${suppressions} where ${suppressions.channel} = ${channel} and ${suppressions.address} = ${address})`;

/** How many customers an audience matches, and how many of them the channel reaches. */
export const estimateAudience = async (
  client: Db,
  channel: BroadcastChannel,
  audience: Audience,
) => {
  const address = addressOf(channel);
  const suppressed = isSuppressed(channel, address);

  const [counts] = await client
    .select({
      matched: count(),
      noAddress: sql<number>`count(*) filter (where ${address} is null)`.mapWith(Number),
      suppressed:
        sql<number>`count(*) filter (where ${address} is not null and ${suppressed})`.mapWith(
          Number,
        ),
      reachable: sql<number>`count(distinct ${address}) filter (where not ${suppressed})`.mapWith(
        Number,
      ),
    })
    .from(customers)
    .where(await audienceWhere(client, audience));

  return counts ?? { matched: 0, noAddress: 0, suppressed: 0, reachable: 0 };
};

/** The first customer of the audience with an address on the channel, for a preview. */
export const firstOfAudience = async (
  client: Db,
  channel: BroadcastChannel,
  audience: Audience,
) => {
  const [first] = await client
    .select({ id: customers.id })
    .from(customers)
    .where(and(await audienceWhere(client, audience), isNotNull(addressOf(channel))))
    .orderBy(asc(customers.id))
    .limit(1);

  return first?.id ?? null;
};

const ENROL_BATCH = 5000;

/** At most this many batches: 5 million customers. */
const ENROL_ROUNDS = 1000;

/**
 * Freezes the audience into the broadcast's recipients, a batch of customers
 * at a time, one row per address (the first customer holding it); customers
 * without an address and suppressed addresses are left out. Returns the
 * number of recipients.
 */
export const enrolAudience = async (
  client: Db,
  broadcast: { id: string; channel: BroadcastChannel } & Audience,
) => {
  const where = await audienceWhere(client, broadcast);
  const address = addressOf(broadcast.channel);
  let after = '';

  await repeatWhile(ENROL_ROUNDS, async () => {
    const batch = await client
      .select({ id: customers.id, address })
      .from(customers)
      .where(and(where, gt(customers.id, after)))
      .orderBy(asc(customers.id))
      .limit(ENROL_BATCH);

    const last = batch.at(-1);

    if (!last) return false;

    after = last.id;

    const ids = batch.filter((row) => row.address).map((row) => row.id);

    // One statement per batch; the unique address index keeps the first customer holding it.
    if (ids.length) {
      await client.execute(sql`
        insert into ${broadcastRecipients} (id, broadcast_id, customer_id, address)
        select substr(replace(gen_random_uuid()::text, '-', ''), 1, 17), ${broadcast.id}, ${customers.id}, ${address}
        from ${customers}
        where ${and(inArray(customers.id, ids), not(isSuppressed(broadcast.channel, address)))}
        order by ${customers.id}
        on conflict do nothing`);
    }

    return batch.length === ENROL_BATCH;
  });

  const [enrolled] = await client
    .select({ total: count() })
    .from(broadcastRecipients)
    .where(eq(broadcastRecipients.broadcastId, broadcast.id));

  return enrolled?.total ?? 0;
};
