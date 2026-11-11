import type { ClientSession } from 'mongoose';
import type { MessagingActor } from './auth';
import { messagingError, messagingNotFound } from './errors';
import type {
  ConversationKind,
  MemberRole,
  MessagingConversation,
  MessagingEvent,
  MessagingMembership,
} from './models';

const MAX_GROUP_SIZE = 50;
const MAX_MESSAGE_LENGTH = 8000;

// IDs are opaque, case-sensitive keys, not display names. Preserve the UTF-16
// ordering used by existing DIRECT keys and idempotency comparisons.
const compareMessagingIds = (left: string, right: string): number => {
  if (left === right) return 0;
  return left < right ? -1 : 1;
};

type Thread = {
  conversation: MessagingConversation;
  membership: MessagingMembership;
};
type ThreadWrite = Thread & { session: ClientSession };

export const enabledKinds = ({
  app,
}: Pick<MessagingActor, 'app'>): ConversationKind[] => [
  ...(app.direct ? ['DIRECT' as const] : []),
  ...(app.group ? ['GROUP' as const] : []),
];

const requireKind = (actor: MessagingActor, kind: ConversationKind) => {
  if (!enabledKinds(actor).includes(kind)) throw messagingNotFound();
};

const requireMembers = async (
  actor: MessagingActor,
  ids: string[],
  session: ClientSession,
) => {
  const count = await actor.models.Identities.countDocuments({
    ...actor.scope,
    _id: { $in: ids },
    active: true,
  }).session(session);
  if (count !== ids.length) throw messagingNotFound();
};

export const runMessagingTransaction = async <T>(
  { models }: MessagingActor,
  write: (session: ClientSession) => Promise<T>,
): Promise<T> => {
  // The collections and unique constraints must exist before entering a transaction.
  await Promise.all(Object.values(models).map((model) => model.init()));
  const session = models.Conversations.db.getClient().startSession();
  try {
    return await session.withTransaction(() => write(session), {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
      readPreference: 'primary',
      timeoutMS: 10_000,
    });
  } finally {
    await session.endSession();
  }
};

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

export const requireThread = async (
  actor: MessagingActor,
  conversationId: string,
  session: ClientSession | null = null,
): Promise<Thread> => {
  const { models, scope, member } = actor;
  const membership = await models.Memberships.findOne({
    ...scope,
    conversationId,
    memberId: member._id,
    active: true,
  })
    .session(session)
    .lean();
  if (!membership) throw messagingNotFound();
  requireKind(actor, membership.kind);
  const conversation = await models.Conversations.findOne({
    ...scope,
    _id: conversationId,
  })
    .session(session)
    .lean();
  if (!conversation) throw messagingNotFound();
  return { membership, conversation };
};

export const updateThread = async <T>(
  actor: MessagingActor,
  id: string,
  write: (thread: ThreadWrite) => Promise<T>,
): Promise<T> =>
  runMessagingTransaction(actor, async (session) => {
    const thread = await requireThread(actor, id, session);
    // Every thread write touches this row, so a concurrent membership change
    // invalidates the transaction's authorization snapshot.
    await actor.models.Conversations.updateOne(
      { ...actor.scope, _id: id },
      { $inc: { revision: 1 } },
      { session },
    );
    return write({ ...thread, session });
  });

const makeMembership = (
  actor: MessagingActor,
  conversation: MessagingConversation,
  memberId: string,
  role: MemberRole = 'MEMBER',
) => ({
  ...actor.scope,
  conversationId: conversation._id,
  kind: conversation.kind,
  memberId,
  role,
  active: true,
  joinedSequence: conversation.lastSequence + 1,
  lastReadSequence: conversation.lastSequence,
  unreadCount: 0,
  lastActivityAt: conversation.lastActivityAt,
});

export const openDirect = async (
  actor: MessagingActor,
  peerId: string,
): Promise<Thread> => {
  requireKind(actor, 'DIRECT');
  if (!peerId || peerId === actor.member._id)
    throw messagingError('Select another member');
  const memberIds = [actor.member._id, peerId].sort(compareMessagingIds);
  const directPair = JSON.stringify(memberIds);
  const selector = { ...actor.scope, kind: 'DIRECT', directPair };
  const open = () =>
    runMessagingTransaction(actor, async (session) => {
      const existing = await actor.models.Conversations.findOne(selector)
        .session(session)
        .lean();
      if (existing) return requireThread(actor, existing._id, session);
      await requireMembers(actor, memberIds, session);
      const [conversation] = await actor.models.Conversations.create(
        [{ ...selector, lastActivityAt: new Date() }],
        { session },
      );
      await actor.models.Memberships.insertMany(
        memberIds.map((memberId) =>
          makeMembership(actor, conversation, memberId),
        ),
        { session },
      );
      await recordMessagingEvent(actor, conversation._id, session);
      return requireThread(actor, conversation._id, session);
    });
  try {
    return await open();
  } catch (error) {
    if (
      typeof error !== 'object' ||
      !error ||
      !('code' in error) ||
      error.code !== 11000
    )
      throw error;
    return open();
  }
};

export const createGroup = async (
  actor: MessagingActor,
  rawTitle: string,
  peers: string[],
): Promise<Thread> => {
  requireKind(actor, 'GROUP');
  const title = rawTitle.trim();
  if (!title || title.length > 120)
    throw messagingError('Group name must have 1–120 characters');
  if (peers.length >= MAX_GROUP_SIZE)
    throw messagingError('Too many group members');
  const ids = [...new Set([actor.member._id, ...peers])];
  return runMessagingTransaction(actor, async (session) => {
    await requireMembers(actor, ids, session);
    const [conversation] = await actor.models.Conversations.create(
      [{ ...actor.scope, kind: 'GROUP', title, lastActivityAt: new Date() }],
      { session },
    );
    await actor.models.Memberships.insertMany(
      ids.map((memberId) =>
        makeMembership(
          actor,
          conversation,
          memberId,
          memberId === actor.member._id ? 'OWNER' : 'MEMBER',
        ),
      ),
      { session },
    );
    await recordMessagingEvent(actor, conversation._id, session);
    return requireThread(actor, conversation._id, session);
  });
};

export type GroupAction =
  | 'ADD'
  | 'REMOVE'
  | 'PROMOTE'
  | 'DEMOTE'
  | 'TRANSFER'
  | 'LEAVE';

const forbid = () =>
  messagingError('Group role does not permit this action', 'FORBIDDEN');

const leaveGroup = async (
  actor: MessagingActor,
  conversationId: string,
  role: MemberRole,
  session: ClientSession,
) => {
  if (role === 'OWNER')
    throw messagingError('Transfer ownership before leaving');
  await actor.models.Memberships.updateOne(
    { ...actor.scope, conversationId, memberId: actor.member._id },
    { $set: { active: false, unreadCount: 0 } },
    { session },
  );
};

const addGroupMember = async (
  actor: MessagingActor,
  conversation: MessagingConversation,
  peerId: string,
  session: ClientSession,
) => {
  await requireMembers(actor, [peerId], session);
  const selector = { ...actor.scope, conversationId: conversation._id };
  const count = await actor.models.Memberships.countDocuments({
    ...selector,
    active: true,
  }).session(session);
  if (count >= MAX_GROUP_SIZE) throw messagingError('Too many group members');
  await actor.models.Memberships.updateOne(
    { ...selector, memberId: peerId },
    { $set: makeMembership(actor, conversation, peerId) },
    { upsert: true, session },
  );
};

const roleForAction = (action: GroupAction): MemberRole => {
  if (action === 'TRANSFER') return 'OWNER';
  return action === 'PROMOTE' ? 'ADMIN' : 'MEMBER';
};

const applyGroupChangeInSession = async (
  actor: MessagingActor,
  id: string,
  action: GroupAction,
  peerId: string | null | undefined,
  session: ClientSession,
): Promise<void> => {
  const { conversation, membership } = await requireThread(actor, id, session);
  if (conversation.kind !== 'GROUP') throw messagingNotFound();
  const { Memberships } = actor.models;
  const selector = { ...actor.scope, conversationId: id };

  if (action === 'LEAVE') {
    await leaveGroup(actor, id, membership.role, session);
    return;
  }

  if (!peerId || peerId === actor.member._id)
    throw messagingError('Select another member');
  if (membership.role === 'MEMBER') throw forbid();
  const target = { ...selector, memberId: peerId };
  const peer = await Memberships.findOne(target).session(session).lean();

  if (action === 'ADD') {
    if (!peer?.active)
      await addGroupMember(actor, conversation, peerId, session);
    return;
  }

  if (!peer?.active) throw messagingNotFound();
  if (peer.role === 'OWNER') throw forbid();
  if (action === 'REMOVE') {
    if (membership.role === 'ADMIN' && peer.role !== 'MEMBER') throw forbid();
    await Memberships.updateOne(
      target,
      { $set: { active: false, unreadCount: 0 } },
      { session },
    );
    return;
  }

  if (membership.role !== 'OWNER') throw forbid();
  if (action === 'TRANSFER') {
    await requireMembers(actor, [peerId], session);
    await Memberships.updateOne(
      { ...selector, memberId: actor.member._id },
      { $set: { role: 'ADMIN' } },
      { session },
    );
  }
  const role = roleForAction(action);
  await Memberships.updateOne(target, { $set: { role } }, { session });
};

export const changeGroup = async (
  actor: MessagingActor,
  id: string,
  action: GroupAction,
  peerId?: string | null,
) =>
  updateThread(actor, id, async ({ session }) => {
    // Membership authorization and changes share the same transaction.
    await applyGroupChangeInSession(actor, id, action, peerId, session);
    let includeMemberId: string | undefined;
    if (action === 'LEAVE') includeMemberId = actor.member._id;
    if (action === 'REMOVE') includeMemberId = peerId ?? undefined;
    await recordMessagingEvent(
      actor,
      id,
      session,
      'CHANGED',
      undefined,
      includeMemberId,
    );
    return true;
  });

export interface SendInput {
  conversationId: string;
  clientMessageId: string;
  text?: string | null;
  attachmentIds?: string[] | null;
  mentionMemberIds?: string[] | null;
}

export const sendMessage = (actor: MessagingActor, input: SendInput) => {
  const text = input.text?.trim() || '';
  const mentions = [...new Set(input.mentionMemberIds ?? [])].sort(
    compareMessagingIds,
  );
  const attachmentIds = [...new Set(input.attachmentIds ?? [])].sort(
    compareMessagingIds,
  );
  if (!input.clientMessageId || input.clientMessageId.length > 128)
    throw messagingError('Invalid client message ID');
  if (
    (!text && !attachmentIds.length) ||
    text.length > MAX_MESSAGE_LENGTH ||
    attachmentIds.length > 5
  )
    throw messagingError('Invalid message content');
  if (mentions.length > MAX_GROUP_SIZE)
    throw messagingError('Too many mentions');

  return updateThread(
    actor,
    input.conversationId,
    async ({ conversation, session }) => {
      const { models, scope, member } = actor;
      const selector = { ...scope, conversationId: conversation._id };
      const idempotency = {
        ...selector,
        senderId: member._id,
        clientMessageId: input.clientMessageId,
      };
      const existing = await models.Messages.findOne(idempotency)
        .session(session)
        .lean();
      if (existing) {
        if (
          existing.text !== text ||
          JSON.stringify(existing.attachmentIds) !==
            JSON.stringify(attachmentIds) ||
          JSON.stringify(existing.mentionMemberIds) !== JSON.stringify(mentions)
        ) {
          throw messagingError(
            'Client message ID already used for a different message',
            'CONFLICT',
          );
        }
        return existing;
      }

      if (
        mentions.length &&
        (conversation.kind !== 'GROUP' ||
          (await models.Memberships.countDocuments({
            ...selector,
            active: true,
            memberId: { $in: mentions },
          }).session(session)) !== mentions.length)
      ) {
        throw messagingError('Mentions must identify active group members');
      }
      if (attachmentIds.length) {
        if (!actor.app.storage)
          throw messagingError('Attachments are disabled', 'FORBIDDEN');
        const bound = await models.Attachments.updateMany(
          {
            ...selector,
            _id: { $in: attachmentIds },
            ownerId: member._id,
            state: 'READY',
            expiresAt: { $gt: new Date() },
          },
          { $set: { state: 'BOUND' } },
          { session },
        );
        if (bound.modifiedCount !== attachmentIds.length)
          throw messagingError(
            'Attachments must be ready and owned by the sender in this conversation',
          );
      }
      const sequence = conversation.lastSequence + 1;
      const createdAt = new Date();
      const [message] = await models.Messages.create(
        [
          {
            ...idempotency,
            sequence,
            text,
            attachmentIds,
            mentionMemberIds: mentions,
            createdAt,
          },
        ],
        { session },
      );
      await models.Conversations.updateOne(
        { ...scope, _id: conversation._id },
        { $set: { lastSequence: sequence, lastActivityAt: createdAt } },
        { session },
      );
      await models.Memberships.updateMany(
        { ...selector, active: true },
        { $set: { lastActivityAt: createdAt } },
        { session },
      );
      await models.Memberships.updateMany(
        { ...selector, active: true, memberId: { $ne: member._id } },
        { $inc: { unreadCount: 1 } },
        { session },
      );
      await recordMessagingEvent(
        actor,
        conversation._id,
        session,
        'MESSAGE',
        message._id,
      );
      return message.toObject();
    },
  );
};
