import { createHash, randomBytes } from 'node:crypto';
import { graphqlPubsub, redis } from 'erxes-api-shared/utils';
import type { ClientSession } from 'mongoose';
import type { MessagingActor } from './auth';
import { requireThread, updateThread, enabledKinds } from './conversations';
import { messagingError } from './errors';
import type { MessagingEvent } from './models';

export const messagingTopic = (
  tenant: string,
  appId: string,
  memberId: string,
) => 'frontline:messaging:wake:' + JSON.stringify([tenant, appId, memberId]);

export const recordMessagingEvent = async (
  actor: MessagingActor,
  conversationId: string,
  session: ClientSession,
  kind: MessagingEvent['kind'] = 'CHANGED',
  messageId?: string,
  includeMemberId?: string,
) => {
  const members = await actor.models.Memberships.find({
    ...actor.scope,
    conversationId,
    ...(includeMemberId
      ? { $or: [{ active: true }, { memberId: includeMemberId }] }
      : { active: true }),
  })
    .session(session)
    .sort({ memberId: 1 })
    .lean();
  const memberIds = members.map(({ memberId }) => memberId);
  if (!memberIds.length) return;
  // Ordered bulk writes preserve recipient lock order without running parallel
  // commands on a transaction session. Counters and events still commit together.
  await actor.models.Identities.bulkWrite(
    memberIds.map((memberId) => ({
      updateOne: {
        filter: { ...actor.scope, _id: memberId, active: true },
        update: { $inc: { eventSequence: 1 } },
      },
    })),
    { session, ordered: true },
  );
  const recipients = await actor.models.Identities.find({
    ...actor.scope,
    _id: { $in: memberIds },
    active: true,
  })
    .session(session)
    .sort({ _id: 1 })
    .lean();
  if (!recipients.length) return;
  await actor.models.Events.insertMany(
    recipients.map((recipient) => ({
      ...actor.scope,
      memberId: recipient._id,
      conversationId,
      kind,
      messageId,
      sequence: recipient.eventSequence,
      expiresAt: new Date(Date.now() + 30 * 86_400_000),
    })),
    { session, ordered: true },
  );
};

export const issueMessagingTicket = async (
  actor: MessagingActor,
  accessExpiresAt: number,
) => {
  const ticket = randomBytes(32).toString('base64url');
  const ttl = Math.min(300, accessExpiresAt - Math.floor(Date.now() / 1000));
  if (ttl <= 0)
    throw messagingError('Messaging access token expired', 'UNAUTHENTICATED');
  const digest = createHash('sha256').update(ticket).digest('hex');
  // The ticket only admits one subscription before its TTL. The subscription
  // it opens ends when the access token behind it expires.
  await redis.set(
    'frontline:messaging:ticket:' + digest,
    JSON.stringify({
      topic: messagingTopic(
        actor.scope.tenant,
        actor.scope.appId,
        actor.member._id,
      ),
      authorizedUntil: accessExpiresAt * 1000,
    }),
    'EX',
    ttl,
  );
  return { ticket, expiresAt: new Date(Date.now() + ttl * 1000) };
};

export const syncMessaging = async (
  actor: MessagingActor,
  after: number,
  first: number,
) => {
  if (
    !Number.isSafeInteger(after) ||
    after < 0 ||
    after > actor.member.eventSequence
  ) {
    throw messagingError('Invalid synchronization cursor');
  }
  const rows = await actor.models.Events.find({
    ...actor.scope,
    memberId: actor.member._id,
    sequence: { $gt: after },
  })
    .sort({ sequence: 1 })
    .limit(Math.max(1, Math.min(first, 100)))
    .lean();
  const resetRequired =
    after < actor.member.eventSequence &&
    (!rows.length || rows[0].sequence !== after + 1);
  const memberships = await actor.models.Memberships.find({
    ...actor.scope,
    conversationId: { $in: rows.map((row) => row.conversationId) },
    memberId: actor.member._id,
    active: true,
    kind: { $in: enabledKinds(actor) },
  }).lean();
  const byConversation = new Map(
    memberships.map((membership) => [membership.conversationId, membership]),
  );
  const messageFilters = rows.flatMap((row) => {
    const membership = byConversation.get(row.conversationId);
    if (!membership || !row.messageId) return [];
    return [
      {
        _id: row.messageId,
        conversationId: row.conversationId,
        sequence: { $gte: membership.joinedSequence },
      },
    ];
  });
  const messages = messageFilters.length
    ? await actor.models.Messages.find({
        ...actor.scope,
        $or: messageFilters,
      }).lean()
    : [];
  const byMessage = new Map(messages.map((message) => [message._id, message]));
  const items = rows.flatMap((row) => {
    if (!byConversation.has(row.conversationId)) return [];
    const message = row.messageId ? byMessage.get(row.messageId) : undefined;
    if (
      row.messageId &&
      (!message || message.conversationId !== row.conversationId)
    )
      return [];
    return [
      {
        id: row._id,
        cursor: row.sequence,
        conversationId: row.conversationId,
        kind: row.kind,
        message: message ? { ...message, id: message._id } : null,
      },
    ];
  });
  return {
    items,
    cursor: resetRequired
      ? actor.member.eventSequence
      : rows[rows.length - 1]?.sequence ?? after,
    resetRequired,
    hasMore:
      !resetRequired &&
      (rows[rows.length - 1]?.sequence ?? after) < actor.member.eventSequence,
  };
};

export const markMessagingRead = (
  actor: MessagingActor,
  conversationId: string,
  through: number,
) =>
  updateThread(
    actor,
    conversationId,
    async ({ conversation, membership, session }) => {
      if (
        !Number.isSafeInteger(through) ||
        through < membership.joinedSequence - 1 ||
        through > conversation.lastSequence
      ) {
        throw messagingError('Invalid read position');
      }
      if (through <= membership.lastReadSequence) return true;
      const unreadCount = await actor.models.Messages.countDocuments({
        ...actor.scope,
        conversationId,
        sequence: { $gt: through },
        senderId: { $ne: actor.member._id },
      }).session(session);
      await actor.models.Memberships.updateOne(
        { ...actor.scope, conversationId, memberId: actor.member._id },
        { $set: { lastReadSequence: through, unreadCount } },
        { session },
      );
      await recordMessagingEvent(actor, conversationId, session, 'READ');
      return true;
    },
  );

export const sendMessagingTyping = async (
  actor: MessagingActor,
  conversationId: string,
  typing: boolean,
) => {
  await requireThread(actor, conversationId);
  const key =
    'frontline:messaging:typing:' +
    JSON.stringify([
      actor.scope.tenant,
      actor.scope.appId,
      conversationId,
      actor.member._id,
    ]);
  const accepted = await redis.set(key, typing ? '1' : '0', 'EX', 2, 'NX');
  if (!accepted) return;
  const members = await actor.models.Memberships.find({
    ...actor.scope,
    conversationId,
    active: true,
    memberId: { $ne: actor.member._id },
  }).lean();
  const expiresAt = new Date(Date.now() + 6000);
  await actor.models.Memberships.updateOne(
    {
      ...actor.scope,
      conversationId,
      memberId: actor.member._id,
      active: true,
    },
    { $set: { typingUntil: typing ? expiresAt : new Date(0) } },
  );
  await Promise.all(
    members.map(({ memberId }) =>
      graphqlPubsub.publish(
        messagingTopic(actor.scope.tenant, actor.scope.appId, memberId),
        { frontlineMessagingWake: true },
      ),
    ),
  );
};
