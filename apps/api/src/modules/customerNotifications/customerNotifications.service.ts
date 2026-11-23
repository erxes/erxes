import type { CustomerNotificationInput, MarkReadInput } from '@erxes/core-contract';
import {
  caller,
  customerAccounts,
  customerNotifications,
  customers,
  type Db,
  newId,
  organizations,
  requestOrgId,
  sourceOf,
  websites,
} from '@erxes/core-db';
import { and, asc, count, eq, exists, gt, inArray, isNotNull, isNull, or, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { assertPluginNamespace } from '~/lib/guards';
import { keysetPage } from '~/lib/keyset';
import { deleteInBatches, repeatWhile } from '~/lib/sequence';
import { logger } from '~/logger';
import { sendEmail } from '~/modules/email/email';
import { canDeliverEmail } from '~/modules/email/sender';
import { unknownWebsite } from '~/modules/customerAuth/customerWebsites';
import { sendSms } from '~/modules/sms/sms';

const log = logger.child({ component: 'customer-notifications' });

/** The signed-in customer's own notifications: their website's, and those for every website. */
const mine = () => {
  const { customerId, websiteId } = caller('customer');

  return and(
    eq(customerNotifications.customerId, customerId),
    or(isNull(customerNotifications.websiteId), eq(customerNotifications.websiteId, websiteId)),
  );
};

/** Every customer with an account on the website, or on any website. */
const signedUp = (websiteId: string | undefined) =>
  exists(
    sql`(select 1 from ${customerAccounts} where ${and(
      eq(customerAccounts.customerId, customers.id),
      websiteId ? eq(customerAccounts.websiteId, websiteId) : undefined,
    )})`,
  );

type Input = CustomerNotificationInput;

/** The website a notification is for: one of the sending plugin's. */
const websiteOf = async (client: Db, source: string, websiteId: string | undefined) => {
  if (!websiteId) return null;

  const [website] = await client
    .select({ id: websites.id, origins: websites.origins })
    .from(websites)
    .where(and(eq(websites.id, websiteId), eq(websites.plugin, source)))
    .limit(1);

  if (!website) throw unknownWebsite();

  return website;
};

/** The row every recipient gets, without its id and customer. */
const rowOf = (source: string, input: Input) => ({
  websiteId: input.websiteId ?? null,
  source,
  kind: input.kind,
  title: input.title,
  body: input.body ?? null,
  link: input.link ?? null,
  entityType: input.entityType ?? null,
  entityId: input.entityId ?? null,
  data: input.data ?? {},
  channels: input.channels,
  dedupeKey: input.dedupeKey ?? null,
});

const EVERYONE_BATCH = 1000;

/** At most this many customers get one broadcast. */
const EVERYONE_ROUNDS = 1000;

/** Every signed-up customer, a batch of them at a time by id; inbox only. */
const notifyEveryone = async (client: Db, source: string, input: Input) => {
  const row = rowOf(source, input);

  let after = '';
  let seen = 0;
  let created = 0;

  await repeatWhile(EVERYONE_ROUNDS, async () => {
    const batch = await client
      .select({ id: customers.id })
      .from(customers)
      .where(and(signedUp(input.websiteId), gt(customers.id, after)))
      .orderBy(asc(customers.id))
      .limit(EVERYONE_BATCH);

    if (!batch.length) return false;

    const inserted = await client
      .insert(customerNotifications)
      .values(batch.map(({ id }) => ({ ...row, id: newId(), customerId: id })))
      .onConflictDoNothing()
      .returning({ id: customerNotifications.id });

    after = batch.at(-1)?.id ?? after;
    seen += batch.length;
    created += inserted.length;

    return batch.length === EVERYONE_BATCH;
  });

  return { created, skipped: seen - created };
};

/** Emails and texts the customers who got it anew, where they have an address. */
const deliver = async (
  client: Db,
  input: Input,
  origin: string | null,
  created: { id: string; email: string | null; phone: string | null }[],
) => {
  if (!input.channels.length || !created.length) return;

  const orgId = requestOrgId();

  const [org] = await client.select({ name: organizations.name }).from(organizations).limit(1);

  const organization = org?.name ?? 'erxes';
  const link = origin && input.link ? `${origin}${input.link}` : null;
  const body = input.body ?? null;

  // Email that would only reach the log is skipped; the inbox and other channels still get it.
  const wantsEmail = input.channels.includes('email');
  const emailing = wantsEmail && (await canDeliverEmail(client));

  if (wantsEmail && !emailing)
    log.warn(
      { orgId, kind: input.kind },
      'customer notification not emailed: sending isn’t set up',
    );

  if (emailing) {
    await sendEmail(
      client,
      orgId,
      created.flatMap(({ id, email }) =>
        email
          ? [
              {
                customerId: id,
                to: email,
                template: 'customer_notification' as const,
                data: { organization, title: input.title, body, link },
              },
            ]
          : [],
      ),
      { source: 'customer' },
    );
  }

  if (input.channels.includes('sms')) {
    const text = [input.title, body, link].filter(Boolean).join('\n');

    await sendSms(
      client,
      orgId,
      created.flatMap(({ phone }) => (phone ? [{ to: phone, text }] : [])),
    );
  }
};

/**
 * A plugin notifies customers (decision 45): one inbox row per customer and,
 * with `channels`, an email or text to their primary address. Unknown ids
 * are an error. With a `dedupeKey`, a retry creates and sends nothing.
 */
export const notifyCustomers = async (client: Db, input: Input) => {
  const source = sourceOf(caller());

  assertPluginNamespace(source, input.kind);

  const website = await websiteOf(client, source, input.websiteId);

  if (input.everyone) return notifyEveryone(client, source, input);

  const wanted = unique(input.customerIds ?? []);

  const recipients = await client
    .select({ id: customers.id, email: customers.primaryEmail, phone: customers.primaryPhone })
    .from(customers)
    .where(inArray(customers.id, wanted));

  if (recipients.length !== wanted.length) {
    throw fail('INVALID_RECIPIENT', 'Some recipients are not customers of this organisation');
  }

  const contacts = new Map(recipients.map((row) => [row.id, row]));
  const row = rowOf(source, input);

  const inserted = await client
    .insert(customerNotifications)
    .values(recipients.map(({ id }) => ({ ...row, id: newId(), customerId: id })))
    .onConflictDoNothing()
    .returning({ customerId: customerNotifications.customerId });

  await deliver(
    client,
    input,
    website?.origins[0] ?? null,
    inserted.flatMap(({ customerId }) => contacts.get(customerId) ?? []),
  );

  return { created: inserted.length, skipped: recipients.length - inserted.length };
};

export const listCustomerNotifications = (
  client: Db,
  query: Parameters<typeof keysetPage>[3] & { unread?: boolean; source?: string },
) =>
  keysetPage(
    client,
    {
      table: customerNotifications,
      id: customerNotifications.id,
      createdAt: customerNotifications.createdAt,
      scope: mine(),
    },
    and(
      query.unread === true ? isNull(customerNotifications.readAt) : undefined,
      query.unread === false ? isNotNull(customerNotifications.readAt) : undefined,
      query.source ? eq(customerNotifications.source, query.source) : undefined,
    ),
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(customerNotifications)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

export const customerUnreadCount = async (client: Db, source?: string) => {
  const [row] = await client
    .select({ count: count() })
    .from(customerNotifications)
    .where(
      and(
        mine(),
        isNull(customerNotifications.readAt),
        source ? eq(customerNotifications.source, source) : undefined,
      ),
    );

  return { count: row?.count ?? 0 };
};

export const markCustomerNotificationsRead = async (client: Db, input: MarkReadInput) => {
  if (input.ids && !input.ids.length) return { updated: 0 };

  const result = await client
    .update(customerNotifications)
    .set({ readAt: input.read ? sql`now()` : null })
    .where(
      and(
        mine(),
        input.ids ? inArray(customerNotifications.id, unique(input.ids)) : undefined,
        input.source ? eq(customerNotifications.source, input.source) : undefined,
        input.read ? isNull(customerNotifications.readAt) : isNotNull(customerNotifications.readAt),
      ),
    );

  return { updated: result.rowCount ?? 0 };
};

const PRUNE_BATCH = 5000;

/** Deletes read customer notifications past the retention period (all organisations). */
export const pruneCustomerNotifications = (client: Db, days: number) =>
  deleteInBatches(200, PRUNE_BATCH, () =>
    client.execute(sql`
      delete from ${customerNotifications} where id in (
        select id from ${customerNotifications}
        where read_at is not null and read_at < now() - make_interval(days => ${days})
        limit ${PRUNE_BATCH}
      )
    `),
  );
