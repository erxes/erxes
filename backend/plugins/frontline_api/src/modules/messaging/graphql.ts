import {
  registerMessagingDevice,
  revokeMessagingDevice,
  setMessagingPreference,
  type RegisterDeviceInput,
} from './push';
import { prepareAttachment } from './attachments';
import {
  issueMessagingTicket,
  markMessagingRead,
  sendMessagingTyping,
  syncMessaging,
} from './events';
import { getMessagingCredential } from './auth';
import {
  createGroup,
  openDirect,
  changeGroup,
  sendMessage,
  requireThread,
  enabledKinds,
  type GroupAction,
  type SendInput,
} from './conversations';
import type {
  MessagingConversation,
  MessagingMembership,
  MessagingMessage,
} from './models';
import type { MessagingActor } from './auth';
import { markResolvers } from 'erxes-api-shared/utils';
import {
  loadMessagingAccount,
  requireMessagingActor,
  type MessagingRequest,
} from './auth';
import { messagingError } from './errors';
import { limitMessagingRate } from './limits';

export const messagingTypes = `
  enum FrontlineMessagingPlatform { IOS ANDROID }
  enum FrontlineMessagingPreference { ALL MENTIONS NONE }
  type FrontlineMessagingDevice {
    id: ID!
    installationId: String!
    platform: FrontlineMessagingPlatform!
  }

  type FrontlineMessagingUpload {
    id: ID!
    uploadPath: String!
  }

  type FrontlineMessagingEvent {
    id: ID!
    cursor: Int!
    conversationId: ID!
    kind: String!
    message: FrontlineMessagingMessage
  }

  type FrontlineMessagingSync {
    items: [FrontlineMessagingEvent!]!
    cursor: Int!
    hasMore: Boolean!
    resetRequired: Boolean!
  }

  type FrontlineMessagingTicket {
    ticket: String!
    expiresAt: Date!
  }

  enum FrontlineMessagingKind { DIRECT GROUP }
  enum FrontlineMessagingRole { OWNER ADMIN MEMBER }
  enum FrontlineMessagingGroupAction { ADD REMOVE PROMOTE DEMOTE TRANSFER LEAVE }

  type FrontlineMessagingConversation {
    id: ID!
    kind: FrontlineMessagingKind!
    title: String
    lastSequence: Int!
    unreadCount: Int!
    lastReadSequence: Int!
    role: FrontlineMessagingRole!
  }

  type FrontlineMessagingConversationPage {
    items: [FrontlineMessagingConversation!]!
    nextCursor: String
  }

  type FrontlineMessagingMessage {
    id: ID!
    conversationId: ID!
    senderId: ID!
    clientMessageId: String!
    sequence: Int!
    text: String!
    attachmentIds: [ID!]!
    mentionMemberIds: [ID!]!
    createdAt: Date!
  }

  type FrontlineMessagingMessagePage {
    items: [FrontlineMessagingMessage!]!
    nextCursor: Int
  }

  type FrontlineMessagingParticipant {
    member: FrontlineMessagingMember!
    role: FrontlineMessagingRole!
    lastReadSequence: Int!
    typingUntil: Date
  }

  input FrontlineMessagingSendInput {
    conversationId: ID!
    clientMessageId: String!
    text: String
    attachmentIds: [ID!]
    mentionMemberIds: [ID!]
  }

  type FrontlineMessagingApp {
    id: ID!
    direct: Boolean!
    group: Boolean!
    attachments: Boolean!
    push: Boolean!
  }

  type FrontlineMessagingMember {
    id: ID!
    displayName: String!
  }

  type FrontlineMessagingMemberPage {
    items: [FrontlineMessagingMember!]!
    nextCursor: ID
  }

  type FrontlineMessagingProfile {
    app: FrontlineMessagingApp!
    member: FrontlineMessagingMember!
  }
`;

export const messagingQueryFields = `
  frontlineMessagingConversations(first: Int = 25, after: String): FrontlineMessagingConversationPage!
  frontlineMessagingConversation(id: ID!): FrontlineMessagingConversation!
  frontlineMessagingMessages(conversationId: ID!, first: Int = 25, before: Int): FrontlineMessagingMessagePage!
  frontlineMessagingParticipants(conversationId: ID!): [FrontlineMessagingParticipant!]!
  frontlineMessagingSync(after: Int!, first: Int = 50): FrontlineMessagingSync!
  frontlineMessagingUnreadCount: Int!
  frontlineMessagingMe: FrontlineMessagingProfile!
  frontlineMessagingMembers(first: Int = 25, after: ID): FrontlineMessagingMemberPage!
`;

export const messagingMutationFields = `
  frontlineMessagingOpenDirect(peerId: ID!): FrontlineMessagingConversation!
  frontlineMessagingCreateGroup(title: String!, memberIds: [ID!]!): FrontlineMessagingConversation!
  frontlineMessagingChangeGroup(conversationId: ID!, action: FrontlineMessagingGroupAction!, memberId: ID): Boolean!
  frontlineMessagingSend(input: FrontlineMessagingSendInput!): FrontlineMessagingMessage!
  frontlineMessagingSubscriptionTicket: FrontlineMessagingTicket!
  frontlineMessagingMarkRead(conversationId: ID!, through: Int!): Boolean!
  frontlineMessagingTyping(conversationId: ID!, typing: Boolean!): Boolean!
  frontlineMessagingPrepareAttachment(conversationId: ID!, name: String!, mimeType: String!, size: Int!): FrontlineMessagingUpload!
  frontlineMessagingRegisterDevice(installationId: String!, platform: FrontlineMessagingPlatform!, token: String!): FrontlineMessagingDevice!
  frontlineMessagingRevokeDevice(installationId: String!): Boolean!
  frontlineMessagingPreference(conversationId: ID!, preference: FrontlineMessagingPreference!): Boolean!
  frontlineMessagingRegister(displayName: String!): FrontlineMessagingProfile!
`;

const profile = ({
  app,
  member,
}: Pick<
  Awaited<ReturnType<typeof requireMessagingActor>>,
  'app' | 'member'
>) => ({
  app: {
    id: app.appId,
    direct: app.direct,
    group: app.group,
    attachments: Boolean(app.storage),
    push: Boolean(app.push),
  },
  member: { id: member._id, displayName: member.displayName },
});

export const threadView = ({
  conversation,
  membership,
}: {
  conversation: MessagingConversation;
  membership: MessagingMembership;
}) => ({
  id: conversation._id,
  kind: conversation.kind,
  title: conversation.title,
  lastSequence: conversation.lastSequence,
  unreadCount: membership.unreadCount,
  lastReadSequence: membership.lastReadSequence,
  role: membership.role,
});

export const messageView = (message: MessagingMessage) => ({
  ...message,
  id: message._id,
});

const pageSize = (first?: number | null) =>
  Math.max(1, Math.min(first ?? 25, 50));

export const listThreads = async (
  actor: MessagingActor,
  first?: number | null,
  after?: string | null,
) => {
  let cursor: { time: Date; id: string } | undefined;
  if (after) {
    const parsed = after.split('|');
    const time = new Date(parsed[0]);
    if (parsed.length !== 2 || !Number.isFinite(time.getTime()) || !parsed[1])
      throw messagingError('Invalid conversation cursor');
    cursor = { time, id: parsed[1] };
  }
  const { models, scope, member } = actor;
  const limit = pageSize(first);
  const rows = await models.Memberships.find({
    ...scope,
    memberId: member._id,
    active: true,
    kind: { $in: enabledKinds(actor) },
    ...(cursor
      ? {
          $or: [
            { lastActivityAt: { $lt: cursor.time } },
            { lastActivityAt: cursor.time, conversationId: { $lt: cursor.id } },
          ],
        }
      : {}),
  })
    .sort({ lastActivityAt: -1, conversationId: -1 })
    .limit(limit + 1)
    .lean();
  const selected = rows.slice(0, limit);
  const conversations = await models.Conversations.find({
    ...scope,
    _id: { $in: selected.map((row) => row.conversationId) },
  }).lean();
  const byId = new Map(conversations.map((row) => [row._id, row]));
  const last = selected[selected.length - 1];
  return {
    items: selected.flatMap((membership) => {
      const conversation = byId.get(membership.conversationId);
      return conversation ? [threadView({ conversation, membership })] : [];
    }),
    nextCursor:
      rows.length > limit && last
        ? last.lastActivityAt.toISOString() + '|' + last.conversationId
        : null,
  };
};

export const messagingQueries = {
  async frontlineMessagingSync(
    _root: unknown,
    { after, first }: { after: number; first?: number },
    request: MessagingRequest,
  ) {
    return syncMessaging(
      await requireMessagingActor(request),
      after,
      first ?? 50,
    );
  },
  async frontlineMessagingUnreadCount(
    _root: unknown,
    _args: unknown,
    request: MessagingRequest,
  ) {
    const actor = await requireMessagingActor(request);
    const rows = await actor.models.Memberships.aggregate<{ total: number }>([
      {
        $match: {
          ...actor.scope,
          memberId: actor.member._id,
          active: true,
          kind: { $in: enabledKinds(actor) },
        },
      },
      { $group: { _id: null, total: { $sum: '$unreadCount' } } },
    ]);
    return rows[0]?.total ?? 0;
  },
  async frontlineMessagingConversation(
    _root: unknown,
    { id }: { id: string },
    request: MessagingRequest,
  ) {
    const actor = await requireMessagingActor(request);
    return threadView(await requireThread(actor, id));
  },
  async frontlineMessagingConversations(
    _root: unknown,
    { first, after }: { first?: number | null; after?: string | null },
    request: MessagingRequest,
  ) {
    return listThreads(await requireMessagingActor(request), first, after);
  },
  async frontlineMessagingMessages(
    _root: unknown,
    {
      conversationId,
      first,
      before,
    }: {
      conversationId: string;
      first?: number | null;
      before?: number | null;
    },
    request: MessagingRequest,
  ) {
    const actor = await requireMessagingActor(request);
    const { membership } = await requireThread(actor, conversationId);
    const limit = pageSize(first);
    const rows = await actor.models.Messages.find({
      ...actor.scope,
      conversationId,
      sequence: {
        $gte: membership.joinedSequence,
        ...(before != null ? { $lt: before } : {}),
      },
    })
      .sort({ sequence: -1 })
      .limit(limit + 1)
      .lean();
    const selected = rows.slice(0, limit);
    return {
      items: selected.reverse().map(messageView),
      nextCursor: rows.length > limit ? selected[0].sequence : null,
    };
  },
  async frontlineMessagingParticipants(
    _root: unknown,
    { conversationId }: { conversationId: string },
    request: MessagingRequest,
  ) {
    const actor = await requireMessagingActor(request);
    await requireThread(actor, conversationId);
    const rows = await actor.models.Memberships.find({
      ...actor.scope,
      conversationId,
      active: true,
    }).lean();
    const members = await actor.models.Identities.find({
      ...actor.scope,
      active: true,
      _id: { $in: rows.map((row) => row.memberId) },
    }).lean();
    const names = new Map(members.map((row) => [row._id, row.displayName]));
    return rows.map((row) => ({
      member: {
        id: row.memberId,
        displayName: names.get(row.memberId) || 'Member',
      },
      role: row.role,
      lastReadSequence: row.lastReadSequence,
      typingUntil:
        row.typingUntil && row.typingUntil > new Date()
          ? row.typingUntil
          : null,
    }));
  },
  async frontlineMessagingMe(
    _root: unknown,
    _args: unknown,
    context: MessagingRequest,
  ) {
    return profile(await requireMessagingActor(context));
  },
  async frontlineMessagingMembers(
    _root: unknown,
    { first, after }: { first?: number | null; after?: string | null },
    context: MessagingRequest,
  ) {
    const { models, scope } = await requireMessagingActor(context);
    const limit = Math.max(1, Math.min(first ?? 25, 50));
    const rows = await models.Identities.find({
      ...scope,
      active: true,
      ...(after ? { _id: { $gt: after } } : {}),
    })
      .sort({ _id: 1 })
      .limit(limit + 1)
      .select('_id displayName')
      .lean();
    return {
      items: rows
        .slice(0, limit)
        .map(({ _id, displayName }) => ({ id: _id, displayName })),
      nextCursor: rows.length > limit ? rows[limit - 1]._id : null,
    };
  },
};

export const messagingMutations = {
  async frontlineMessagingRegisterDevice(
    _root: unknown,
    input: RegisterDeviceInput,
    request: MessagingRequest,
  ) {
    const actor = await requireMessagingActor(request);
    await limitMessagingRate(actor, 'registerDevice');
    return registerMessagingDevice(actor, input);
  },
  async frontlineMessagingRevokeDevice(
    _root: unknown,
    { installationId }: { installationId: string },
    request: MessagingRequest,
  ) {
    return revokeMessagingDevice(
      await requireMessagingActor(request),
      installationId,
    );
  },
  async frontlineMessagingPreference(
    _root: unknown,
    {
      conversationId,
      preference,
    }: { conversationId: string; preference: 'ALL' | 'MENTIONS' | 'NONE' },
    request: MessagingRequest,
  ) {
    return setMessagingPreference(
      await requireMessagingActor(request),
      conversationId,
      preference,
    );
  },
  async frontlineMessagingPrepareAttachment(
    _root: unknown,
    input: {
      conversationId: string;
      name: string;
      mimeType: string;
      size: number;
    },
    request: MessagingRequest,
  ) {
    const actor = await requireMessagingActor(request);
    await limitMessagingRate(actor, 'prepareAttachment');
    return prepareAttachment(actor, input);
  },
  async frontlineMessagingSubscriptionTicket(
    _root: unknown,
    _args: unknown,
    request: MessagingRequest,
  ) {
    const { accessExpiresAt } = getMessagingCredential(request);
    const actor = await requireMessagingActor(request);
    await limitMessagingRate(actor, 'subscriptionTicket');
    return issueMessagingTicket(actor, accessExpiresAt);
  },
  async frontlineMessagingMarkRead(
    _root: unknown,
    { conversationId, through }: { conversationId: string; through: number },
    request: MessagingRequest,
  ) {
    return markMessagingRead(
      await requireMessagingActor(request),
      conversationId,
      through,
    );
  },
  async frontlineMessagingTyping(
    _root: unknown,
    { conversationId, typing }: { conversationId: string; typing: boolean },
    request: MessagingRequest,
  ) {
    return sendMessagingTyping(
      await requireMessagingActor(request),
      conversationId,
      typing,
    );
  },
  async frontlineMessagingOpenDirect(
    _root: unknown,
    { peerId }: { peerId: string },
    request: MessagingRequest,
  ) {
    return threadView(
      await openDirect(await requireMessagingActor(request), peerId),
    );
  },
  async frontlineMessagingCreateGroup(
    _root: unknown,
    { title, memberIds }: { title: string; memberIds: string[] },
    request: MessagingRequest,
  ) {
    const actor = await requireMessagingActor(request);
    await limitMessagingRate(actor, 'createGroup');
    return threadView(await createGroup(actor, title, memberIds));
  },
  async frontlineMessagingChangeGroup(
    _root: unknown,
    {
      conversationId,
      action,
      memberId,
    }: {
      conversationId: string;
      action: GroupAction;
      memberId?: string | null;
    },
    request: MessagingRequest,
  ) {
    return changeGroup(
      await requireMessagingActor(request),
      conversationId,
      action,
      memberId,
    );
  },
  async frontlineMessagingSend(
    _root: unknown,
    { input }: { input: SendInput },
    request: MessagingRequest,
  ) {
    const actor = await requireMessagingActor(request);
    await limitMessagingRate(actor, 'send');
    return messageView(await sendMessage(actor, input));
  },
  async frontlineMessagingRegister(
    _root: unknown,
    { displayName }: { displayName: string },
    context: MessagingRequest,
  ) {
    const name = displayName.trim();
    if (!name || name.length > 80)
      throw messagingError('Display name must have 1–80 characters');
    const { app, models, selector } = await loadMessagingAccount(context);
    await models.Identities.init();
    const member = await models.Identities.findOneAndUpdate(
      selector,
      { $setOnInsert: { ...selector, displayName: name } },
      { upsert: true, new: true },
    ).lean();
    if (!member?.active)
      throw messagingError('Active messaging membership required', 'FORBIDDEN');
    return profile({ app, member });
  },
};

// All operations verify the app credential independently of the staff or portal wrapper.
markResolvers(messagingQueries, { wrapperConfig: { skipPermission: true } });
markResolvers(messagingMutations, { wrapperConfig: { skipPermission: true } });
