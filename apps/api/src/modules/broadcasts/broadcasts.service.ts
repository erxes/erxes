import type { BroadcastStats, CursorQuery } from '@erxes/core-contract';
import {
  type BroadcastStatus,
  broadcastRecipients,
  broadcastSchedules,
  broadcasts,
  callerUserId,
  customers,
  type Db,
  type EmailNode,
  newId,
  organizations,
} from '@erxes/core-db';
import { and, eq, getTableColumns, ilike, inArray, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { containsPattern, keysetPage } from '~/lib/keyset';
import { mailRoute, requireMailConnection } from '~/modules/email/mailConnections';
import { isVerifiedReplyTo, requireReplyTo } from '~/modules/email/replyTos.service';
import { isAllowedFrom, requireDelivery, requireFromAddress } from '~/modules/email/sender';
import { canDeliverSms } from '~/modules/sms/sms';
import { assertAttachments } from './attachments';
import { type Audience, audienceWhere, estimateAudience } from './audience';
import { contentColumns } from './emailBody';
import { assertPlaceholders, type PlaceholderValues } from './placeholders';

type BroadcastRow = typeof broadcasts.$inferSelect;

/**
 * The outer broadcast's id, table and all: in a one-table select Drizzle
 * writes `${broadcasts.id}` as a bare `"id"`, which inside the subquery would
 * be the recipient's own.
 */
export const outerId = sql`${broadcasts}.${sql.identifier('id')}`;

/** A broadcast's recipients counted by what became of them, in one subquery per broadcast. */
const stats = sql<BroadcastStats>`(select json_build_object(
    'queued', count(*) filter (where r.status = 'queued'),
    'sending', count(*) filter (where r.status = 'sending'),
    'sent', count(*) filter (where r.status = 'sent'),
    'failed', count(*) filter (where r.status = 'failed'),
    'skipped', count(*) filter (where r.status = 'skipped'),
    'opened', count(r.opened_at),
    'clicked', count(r.clicked_at),
    'unsubscribed', count(r.unsubscribed_at))
  from ${broadcastRecipients} r where r.broadcast_id = ${outerId})`;

/** A recurring broadcast's next run, while its schedule is active. */
const nextRunAt = sql<Date | null>`(select s.next_run_at from ${broadcastSchedules} s
  where s.broadcast_id = ${outerId})`.mapWith(broadcastSchedules.nextRunAt);

const selectBroadcasts = (client: Db) =>
  client.select({ ...getTableColumns(broadcasts), stats, nextRunAt }).from(broadcasts);

export const getBroadcast = async (client: Db, id: string) => {
  const [row] = await selectBroadcasts(client).where(eq(broadcasts.id, id)).limit(1);

  if (!row) throw notFound('Broadcast');

  return row;
};

/** When a broadcast went out, or goes: null for a draft with no schedule. */
const goesAt = sql`coalesce(${broadcasts.startedAt}, ${broadcasts.scheduledAt})`;

export const listBroadcasts = (
  client: Db,
  query: CursorQuery & {
    status?: BroadcastStatus;
    channel?: BroadcastRow['channel'];
    search?: string;
    parentId?: string;
    from?: string;
    to?: string;
  },
) =>
  keysetPage(
    client,
    { table: broadcasts, id: broadcasts.id, createdAt: broadcasts.createdAt },
    and(
      query.status ? eq(broadcasts.status, query.status) : undefined,
      query.parentId ? eq(broadcasts.parentId, query.parentId) : undefined,
      query.channel ? eq(broadcasts.channel, query.channel) : undefined,
      query.search ? ilike(broadcasts.name, containsPattern(query.search)) : undefined,
      query.from ? sql`${goesAt} >= ${query.from}` : undefined,
      query.to ? sql`${goesAt} < ${query.to}` : undefined,
    ),
    query,
    (where, orderBy, limit) =>
      selectBroadcasts(client)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

interface Content {
  subject?: string | null;
  preheader?: string | null;
  body?: string;
  content?: EmailNode | null;
}

/** Placeholders must be ones erxes fills; the audience must compile (a view of people, a valid filter). */
const assertWritable = async (client: Db, content: Content, audience: Audience) => {
  assertPlaceholders(content.subject, content.preheader, content.body);
  await audienceWhere(client, audience);
};

export const createBroadcast = async (
  client: Db,
  input: Content &
    Audience & {
      name: string;
      channel: BroadcastRow['channel'];
      fromName?: string | null;
      fromEmail?: string | null;
      mailConnectionId?: string | null;
      replyTo?: string | null;
      attachmentIds?: string[];
    },
) => {
  const columns = await contentColumns(client, input.channel, input);

  await assertWritable(client, { ...input, ...columns }, input);
  await requireReplyTo(client, input.replyTo);
  await requireFromAddress(client, input.fromEmail);
  await requireMailConnection(client, input.mailConnectionId);
  await assertAttachments(client, input.channel, input.attachmentIds ?? []);

  const id = newId();

  await client.insert(broadcasts).values({ ...input, ...columns, id, createdBy: callerUserId() });

  return getBroadcast(client, id);
};

/**
 * Moves a broadcast from one of `from` to `to` (with `set`) in one
 * conditional update, so two members acting at once can't both move it.
 * 404 when it doesn't exist, 409 BROADCAST_STATUS when it stands elsewhere.
 */
export const moveBroadcast = async (
  client: Db,
  id: string,
  from: readonly BroadcastStatus[],
  set: Partial<typeof broadcasts.$inferInsert>,
) => {
  const moved = await client
    .update(broadcasts)
    .set({ ...set, updatedAt: new Date() })
    .where(and(eq(broadcasts.id, id), inArray(broadcasts.status, [...from])))
    .returning({ id: broadcasts.id });

  if (moved.length) return;

  const [current] = await client
    .select({ status: broadcasts.status })
    .from(broadcasts)
    .where(eq(broadcasts.id, id))
    .limit(1);

  if (!current) throw notFound('Broadcast');

  throw fail('BROADCAST_STATUS', `The broadcast is ${current.status}`, {
    status: current.status,
  });
};

/** Before sending starts; a recurring one's changes reach its later runs, not those made. */
const EDITABLE = ['draft', 'scheduled', 'recurring'] as const;

export const updateBroadcast = async (
  client: Db,
  id: string,
  changes: Content &
    Audience & {
      name?: string;
      fromName?: string | null;
      fromEmail?: string | null;
      mailConnectionId?: string | null;
      replyTo?: string | null;
      attachmentIds?: string[];
    },
) => {
  const current = await getBroadcast(client, id);
  const columns = await contentColumns(client, current.channel, changes);

  await assertWritable(
    client,
    {
      subject: changes.subject === undefined ? current.subject : changes.subject,
      preheader: changes.preheader === undefined ? current.preheader : changes.preheader,
      body: columns.body ?? current.body,
    },
    {
      viewId: changes.viewId === undefined ? current.viewId : changes.viewId,
      filter: changes.filter === undefined ? current.filter : changes.filter,
    },
  );

  if (changes.replyTo !== undefined) await requireReplyTo(client, changes.replyTo);

  if (changes.fromEmail !== undefined) await requireFromAddress(client, changes.fromEmail);

  await requireMailConnection(client, changes.mailConnectionId);

  if (changes.attachmentIds) {
    await assertAttachments(client, current.channel, changes.attachmentIds);
  }

  // A view and a filter don't go together: setting one clears the other.
  const audience = changes.viewId ? { filter: null } : changes.filter ? { viewId: null } : {};

  await moveBroadcast(client, id, EDITABLE, { ...changes, ...columns, ...audience });

  return getBroadcast(client, id);
};

/** Not while it goes out: pause or cancel first. A recurring one's runs stay. */
export const removeBroadcast = async (client: Db, id: string) => {
  const deleted = await client
    .delete(broadcasts)
    .where(
      and(
        eq(broadcasts.id, id),
        inArray(broadcasts.status, [
          'draft',
          'scheduled',
          'sent',
          'cancelled',
          'failed',
          'recurring',
        ]),
      ),
    )
    .returning({ name: broadcasts.name });

  if (deleted[0]) return deleted[0];

  const { status } = await getBroadcast(client, id);

  throw fail('BROADCAST_STATUS', `The broadcast is ${status}: cancel it first`, { status });
};

/**
 * A new draft with the source's audience and content. Run state (status, schedule, counts, times,
 * error) starts fresh; a Reply-To taken off the verified list since, a From whose domain the
 * provider no longer verifies, or a Mail service connection turned off, is dropped, so the copy
 * saves.
 */
export const duplicateBroadcast = async (client: Db, id: string) => {
  const source = await getBroadcast(client, id);
  const copy = newId();
  const { connectionId: mailConnectionId } = await mailRoute(client, source.mailConnectionId);

  const replyTo =
    source.replyTo && (await isVerifiedReplyTo(client, source.replyTo)) ? source.replyTo : null;

  const fromEmail =
    source.fromEmail && (await isAllowedFrom(client, source.fromEmail)) ? source.fromEmail : null;

  await client.insert(broadcasts).values({
    id: copy,
    name: `${source.name} (copy)`.slice(0, 120),
    channel: source.channel,
    viewId: source.viewId,
    filter: source.filter,
    subject: source.subject,
    preheader: source.preheader,
    body: source.body,
    content: source.content,
    html: source.html,
    fromName: source.fromName,
    fromEmail,
    mailConnectionId,
    replyTo,
    attachmentIds: source.attachmentIds,
    createdBy: callerUserId(),
  });

  return getBroadcast(client, copy);
};

/** What sending needs and the broadcast lacks: `subject` (email), `body` (an email's content). */
export const missingContent = (broadcast: BroadcastRow) => [
  ...(broadcast.channel === 'email' && !broadcast.subject?.trim() ? ['subject'] : []),
  ...((broadcast.channel === 'email' ? !broadcast.html : !broadcast.body.trim()) ? ['body'] : []),
];

/** 400 BROADCAST_INCOMPLETE naming what sending needs and the broadcast lacks. */
export const assertComplete = (broadcast: BroadcastRow) => {
  const missing = missingContent(broadcast);

  if (missing.length) {
    throw fail('BROADCAST_INCOMPLETE', `Add ${missing.join(' and ')} before sending`, {
      missing,
    });
  }
};

/**
 * 409 EMAIL_NOT_CONFIGURED for an email broadcast through Organization email while it would
 * only reach the log, SMS_NOT_CONFIGURED for a text one with no SMS connection in production;
 * 400 INVALID_INPUT for a Reply-To no longer verified, a From whose domain the provider no
 * longer verifies or a Mail service connection turned off; 400 BROADCAST_ATTACHMENT_UNAVAILABLE
 * when an attached file was deleted since.
 */
export const assertDeliverable = async (client: Db, broadcast: BroadcastRow) => {
  if (broadcast.channel !== 'email') {
    if (!(await canDeliverSms(client))) {
      throw fail(
        'SMS_NOT_CONFIGURED',
        'Texts can’t go out: connect CallPro or Twilio in Settings › Integrations',
      );
    }

    return;
  }

  if (broadcast.mailConnectionId) {
    await requireMailConnection(client, broadcast.mailConnectionId);
  } else {
    await requireDelivery(client);
    await requireFromAddress(client, broadcast.fromEmail);
  }

  await requireReplyTo(client, broadcast.replyTo);
  await assertAttachments(client, broadcast.channel, broadcast.attachmentIds);
};

/** 409 NO_RECIPIENTS when the audience reaches nobody on the channel now. */
export const assertReachable = async (client: Db, broadcast: BroadcastRow) => {
  const { reachable } = await estimateAudience(client, broadcast.channel, broadcast);

  if (!reachable) {
    throw fail(
      'NO_RECIPIENTS',
      `Nobody in the audience has a ${broadcast.channel === 'email' ? 'email address' : 'phone'} that can be reached`,
    );
  }
};

/** The scope's organisation's name, for `{{ organization }}` and the footer. */
export const organizationName = async (client: Db) => {
  const [organization] = await client
    .select({ name: organizations.name })
    .from(organizations)
    .limit(1);

  return organization?.name ?? 'erxes';
};

/** Placeholder values for customers, by id. */
export const valuesOf = async (client: Db, customerIds: string[], organization: string) => {
  if (!customerIds.length) return new Map<string, PlaceholderValues>();

  const rows = await client
    .select({
      id: customers.id,
      firstName: customers.firstName,
      lastName: customers.lastName,
      email: customers.primaryEmail,
      phone: customers.primaryPhone,
      code: customers.code,
      position: customers.position,
    })
    .from(customers)
    .where(inArray(customers.id, customerIds));

  return new Map(rows.map(({ id, ...values }) => [id, { ...values, organization }]));
};
