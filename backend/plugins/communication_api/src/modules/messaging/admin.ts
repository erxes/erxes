import { Router } from 'express';
import type { Request, Response } from 'express';
import { GraphQLError } from 'graphql';
import {
  checkPermissionGroup,
  getGroupActionsMap,
} from 'erxes-api-shared/core-modules';
import type {
  ILogDoc,
  IMainContext,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import {
  escapeRegExp,
  extractUserFromHeader,
  getEnv,
  getSubdomain,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { messagingStorage } from './attachments';
import { getMessagingApps, type MessagingApp } from './config';
import { messagingError, messagingNotFound } from './errors';
import {
  generateMessagingModels,
  type ConversationKind,
  type MessagingConversation,
  type MessagingIdentity,
  type MessagingModels,
} from './models';

export const MESSAGING_ADMIN_ACTION = 'communicationMessagingViewAll';
export const MESSAGING_ADMIN_HEADER = 'x-communication-messaging-admin';

const PAGE_LIMIT = 50;
const PREVIEW_PARTICIPANTS = 5;
const MAX_PARTICIPANTS = 200;
const MAX_SEARCH_LENGTH = 100;
const MAX_SEARCH_MATCHES = 500;
const AUDIT_TIMEOUT_MS = 2000;

type AdminContext = IMainContext & { subdomain: string };

type AccessType =
  | 'LIST_CONVERSATIONS'
  | 'VIEW_CONVERSATION'
  | 'VIEW_MESSAGES'
  | 'VIEW_PARTICIPANTS'
  | 'DOWNLOAD_ATTACHMENT';

type Scope = { tenant: string; appId: string };

const forbidden = () => messagingError('Permission required', 'FORBIDDEN');

/**
 * Staff access to every conversation in the organization. `checkPermission`
 * covers login, OAuth scopes and permission groups, but it admits every
 * owner and allow-all app token. Reading private conversations also needs
 * the action granted explicitly through a permission group or custom
 * permission. Any failure to resolve the grant denies access.
 */
const requireAdmin = async (
  subdomain: string,
  user: IUserDocument | null | undefined,
  checkPermission: (action: string) => Promise<void>,
) => {
  try {
    await checkPermission(MESSAGING_ADMIN_ACTION);
  } catch (error) {
    // Shared permission errors reach clients without a GraphQL code.
    const code = (error as { code?: unknown } | null)?.code;
    if (code === 'FORBIDDEN') throw forbidden();
    if (code === 'UNAUTHORIZED')
      throw messagingError('Login required', 'UNAUTHENTICATED');
    throw error;
  }
  if (!user?._id) throw forbidden();
  const actions = await getGroupActionsMap(subdomain, user);
  if (actions[MESSAGING_ADMIN_ACTION] !== true) throw forbidden();
  return user;
};

export const messagingAppKey = ({ tenant, appId }: Scope) =>
  tenant + '/' + appId;

/**
 * Apps an administrator of this organization may oversee. A SaaS
 * organization owns the apps whose tenant is its verified subdomain, and its
 * data lives in that organization's database. A self-hosted deployment serves
 * one organization, which owns every configured app.
 */
export const adminApps = (subdomain: string): MessagingApp[] => {
  const apps = getMessagingApps();
  if (getEnv({ name: 'VERSION', defaultValue: 'os' }) !== 'saas') {
    return [...apps];
  }
  return apps.filter((app) => app.tenant === subdomain);
};

const requireAdminApp = (subdomain: string, key: string) => {
  const app = adminApps(subdomain).find((row) => messagingAppKey(row) === key);
  if (!app) throw messagingNotFound();
  return app;
};

// Every app an administrator may see shares one database: the organization's
// own in SaaS, and the deployment's only database when self-hosted.
const adminModels = (apps: MessagingApp[]) =>
  generateMessagingModels(apps[0].tenant);

const scopeOf = ({ tenant, appId }: Scope): Scope => ({ tenant, appId });

/**
 * Records one successful access through the logs service before any data is
 * returned. The record holds identifiers only, never message text or file
 * contents. Reading it requires the core `logsRead` permission.
 */
const audit = async (
  subdomain: string,
  user: IUserDocument,
  processId: string | undefined,
  accessType: AccessType,
  details: Record<string, unknown>,
) => {
  const doc: ILogDoc = {
    subdomain,
    source: 'graphql',
    action: 'communicationMessagingAdminAccess',
    status: 'success',
    userId: user._id,
    processId,
    payload: { accessType, accessedAt: new Date().toISOString(), ...details },
  };
  let timer: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      sendWorkerQueue('logs', 'put_log').add('put_log', doc, {
        removeOnComplete: true,
      }),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error('Messaging audit timed out')),
          AUDIT_TIMEOUT_MS,
        );
      }),
    ]);
  } catch {
    // Access that cannot be recorded is refused.
    throw messagingError(
      'Messaging audit is unavailable. Retry later.',
      'SERVICE_UNAVAILABLE',
    );
  } finally {
    clearTimeout(timer);
  }
};

const memberView = (id: string, identity: MessagingIdentity | undefined) => ({
  id,
  displayName: identity?.displayName ?? 'Unknown member',
  subject: identity?.subject ?? null,
  active: identity?.active ?? false,
});

const loadIdentities = async (
  models: MessagingModels,
  scope: Scope,
  ids: string[],
) => {
  const rows = ids.length
    ? await models.Identities.find({
        ...scope,
        _id: { $in: [...new Set(ids)] },
      }).lean()
    : [];
  return new Map(rows.map((row) => [row._id, row]));
};

const pageSize = (first?: number | null) =>
  Math.max(1, Math.min(first ?? 25, PAGE_LIMIT));

const parseCursor = (after?: string | null) => {
  if (!after) return undefined;
  const separator = after.indexOf('|');
  const time = new Date(after.slice(0, separator));
  const id = after.slice(separator + 1);
  if (separator < 1 || !Number.isFinite(time.getTime()) || !id)
    throw messagingError('Invalid conversation cursor');
  return { time, id };
};

const searchConversationIds = async (
  models: MessagingModels,
  scopes: Scope[],
  term: string,
) => {
  const pattern = new RegExp(escapeRegExp(term), 'i');
  const members = await models.Identities.find({
    $or: scopes,
    displayName: pattern,
  })
    .limit(MAX_SEARCH_MATCHES)
    .select('_id tenant appId')
    .lean();
  if (!members.length) return [];
  const memberships = await models.Memberships.find({
    $or: members.map(({ _id, tenant, appId }) => ({
      tenant,
      appId,
      memberId: _id,
    })),
  })
    .limit(MAX_SEARCH_MATCHES)
    .select('conversationId')
    .lean();
  return [...new Set(memberships.map((row) => row.conversationId))];
};

const conversationViews = async (
  models: MessagingModels,
  conversations: MessagingConversation[],
) => {
  const memberships = conversations.length
    ? await models.Memberships.find({
        $or: conversations.map((row) => ({
          ...scopeOf(row),
          conversationId: row._id,
        })),
        active: true,
      })
        .sort({ memberId: 1 })
        .lean()
    : [];
  const byConversation = new Map<string, string[]>();
  for (const row of memberships) {
    const list = byConversation.get(row.conversationId) ?? [];
    list.push(row.memberId);
    byConversation.set(row.conversationId, list);
  }
  const previewIds = [...byConversation.values()].flatMap((ids) =>
    ids.slice(0, PREVIEW_PARTICIPANTS),
  );
  const identities = previewIds.length
    ? await models.Identities.find({
        $or: conversations.map(scopeOf),
        _id: { $in: [...new Set(previewIds)] },
      }).lean()
    : [];
  const names = new Map(identities.map((row) => [row._id, row]));
  return conversations.map((row) => {
    const memberIds = byConversation.get(row._id) ?? [];
    return {
      id: row._id,
      appKey: messagingAppKey(row),
      appId: row.appId,
      kind: row.kind,
      title: row.title ?? null,
      lastActivityAt: row.lastActivityAt,
      messageCount: row.lastSequence,
      memberCount: memberIds.length,
      participants: memberIds
        .slice(0, PREVIEW_PARTICIPANTS)
        .map((id) => memberView(id, names.get(id))),
    };
  });
};

const requireConversation = async (
  models: MessagingModels,
  app: MessagingApp,
  id: string,
) => {
  const conversation = await models.Conversations.findOne({
    ...scopeOf(app),
    _id: id,
  }).lean();
  if (!conversation) throw messagingNotFound();
  return conversation;
};

export const messagingAdminTypes = `
  type CommunicationMessagingAdminApp {
    key: String!
    tenant: String!
    appId: String!
    direct: Boolean!
    group: Boolean!
    attachments: Boolean!
  }

  type CommunicationMessagingAdminMember {
    id: ID!
    displayName: String!
    subject: String
    active: Boolean!
  }

  type CommunicationMessagingAdminConversation {
    id: ID!
    appKey: String!
    appId: String!
    kind: CommunicationMessagingKind!
    title: String
    lastActivityAt: Date!
    messageCount: Int!
    memberCount: Int!
    participants: [CommunicationMessagingAdminMember!]!
  }

  type CommunicationMessagingAdminConversationPage {
    items: [CommunicationMessagingAdminConversation!]!
    nextCursor: String
  }

  type CommunicationMessagingAdminAttachment {
    id: ID!
    name: String!
    mimeType: String!
    size: Int!
    downloadPath: String
  }

  type CommunicationMessagingAdminMessage {
    id: ID!
    sequence: Int!
    text: String!
    createdAt: Date!
    sender: CommunicationMessagingAdminMember!
    mentions: [CommunicationMessagingAdminMember!]!
    attachments: [CommunicationMessagingAdminAttachment!]!
  }

  type CommunicationMessagingAdminMessagePage {
    items: [CommunicationMessagingAdminMessage!]!
    nextCursor: Int
  }

  type CommunicationMessagingAdminParticipant {
    member: CommunicationMessagingAdminMember!
    role: CommunicationMessagingRole!
    active: Boolean!
    joinedSequence: Int!
    lastReadSequence: Int!
    unreadCount: Int!
  }
`;

export const messagingAdminQueryFields = `
  communicationMessagingAdminApps: [CommunicationMessagingAdminApp!]!
  communicationMessagingAdminConversations(appKey: String, kind: CommunicationMessagingKind, search: String, first: Int = 25, after: String): CommunicationMessagingAdminConversationPage!
  communicationMessagingAdminConversation(appKey: String!, id: ID!): CommunicationMessagingAdminConversation!
  communicationMessagingAdminMessages(appKey: String!, conversationId: ID!, first: Int = 25, before: Int): CommunicationMessagingAdminMessagePage!
  communicationMessagingAdminParticipants(appKey: String!, conversationId: ID!): [CommunicationMessagingAdminParticipant!]!
`;

const attachmentPath = (appKey: string, id: string) =>
  '/pl:communication/messaging/admin/attachments/' +
  encodeURIComponent(id) +
  '?app=' +
  encodeURIComponent(appKey);

// Every operation is a read. None calls a participant write path, opens a
// transaction, publishes a wake-up or touches read state.
export const messagingAdminQueries = {
  async communicationMessagingAdminApps(
    _root: unknown,
    _args: unknown,
    { subdomain, user, checkPermission }: AdminContext,
  ) {
    await requireAdmin(subdomain, user, checkPermission);
    return adminApps(subdomain).map((app) => ({
      key: messagingAppKey(app),
      tenant: app.tenant,
      appId: app.appId,
      direct: app.direct,
      group: app.group,
      attachments: Boolean(app.storage),
    }));
  },

  async communicationMessagingAdminConversations(
    _root: unknown,
    {
      appKey,
      kind,
      search,
      first,
      after,
    }: {
      appKey?: string | null;
      kind?: ConversationKind | null;
      search?: string | null;
      first?: number | null;
      after?: string | null;
    },
    { subdomain, user, checkPermission, processId }: AdminContext,
  ) {
    const admin = await requireAdmin(subdomain, user, checkPermission);
    const apps = appKey
      ? [requireAdminApp(subdomain, appKey)]
      : adminApps(subdomain);
    const term = search?.trim() ?? '';
    if (term.length > MAX_SEARCH_LENGTH)
      throw messagingError('Search is too long');
    const cursor = parseCursor(after);
    if (!apps.length) return { items: [], nextCursor: null };

    const models = await adminModels(apps);
    const scopes = apps.map(scopeOf);
    const filters: Record<string, unknown>[] = [{ $or: scopes }];
    if (kind) filters.push({ kind });
    if (term) {
      const ids = await searchConversationIds(models, scopes, term);
      filters.push({
        $or: [
          { title: new RegExp(escapeRegExp(term), 'i') },
          { _id: { $in: ids } },
        ],
      });
    }
    if (cursor) {
      filters.push({
        $or: [
          { lastActivityAt: { $lt: cursor.time } },
          { lastActivityAt: cursor.time, _id: { $lt: cursor.id } },
        ],
      });
    }
    const limit = pageSize(first);
    const rows = await models.Conversations.find({ $and: filters })
      .sort({ lastActivityAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();
    const selected = rows.slice(0, limit);
    const items = await conversationViews(models, selected);
    const last = selected[selected.length - 1];

    await audit(subdomain, admin, processId, 'LIST_CONVERSATIONS', {
      apps: apps.map(messagingAppKey),
      kind: kind ?? null,
      searched: Boolean(term),
      resultCount: items.length,
    });
    return {
      items,
      nextCursor:
        rows.length > limit && last
          ? last.lastActivityAt.toISOString() + '|' + last._id
          : null,
    };
  },

  async communicationMessagingAdminConversation(
    _root: unknown,
    { appKey, id }: { appKey: string; id: string },
    { subdomain, user, checkPermission, processId }: AdminContext,
  ) {
    const admin = await requireAdmin(subdomain, user, checkPermission);
    const app = requireAdminApp(subdomain, appKey);
    const models = await adminModels([app]);
    const conversation = await requireConversation(models, app, id);
    const [view] = await conversationViews(models, [conversation]);
    await audit(subdomain, admin, processId, 'VIEW_CONVERSATION', {
      ...scopeOf(app),
      conversationId: conversation._id,
      kind: conversation.kind,
    });
    return view;
  },

  async communicationMessagingAdminMessages(
    _root: unknown,
    {
      appKey,
      conversationId,
      first,
      before,
    }: {
      appKey: string;
      conversationId: string;
      first?: number | null;
      before?: number | null;
    },
    { subdomain, user, checkPermission, processId }: AdminContext,
  ) {
    const admin = await requireAdmin(subdomain, user, checkPermission);
    const app = requireAdminApp(subdomain, appKey);
    if (before != null && (!Number.isSafeInteger(before) || before < 1))
      throw messagingError('Invalid message cursor');
    const models = await adminModels([app]);
    const scope = scopeOf(app);
    const conversation = await requireConversation(models, app, conversationId);
    const limit = pageSize(first);
    const rows = await models.Messages.find({
      ...scope,
      conversationId: conversation._id,
      ...(before == null ? {} : { sequence: { $lt: before } }),
    })
      .sort({ sequence: -1 })
      .limit(limit + 1)
      .lean();
    const selected = rows.slice(0, limit).reverse();
    const identities = await loadIdentities(
      models,
      scope,
      selected.flatMap((row) => [row.senderId, ...row.mentionMemberIds]),
    );
    const attachmentIds = selected.flatMap((row) => row.attachmentIds);
    const attachments = attachmentIds.length
      ? await models.Attachments.find({
          ...scope,
          conversationId: conversation._id,
          _id: { $in: attachmentIds },
        }).lean()
      : [];
    const files = new Map(attachments.map((row) => [row._id, row]));

    await audit(subdomain, admin, processId, 'VIEW_MESSAGES', {
      ...scope,
      conversationId: conversation._id,
      before: before ?? null,
      resultCount: selected.length,
    });
    return {
      items: selected.map((row) => ({
        id: row._id,
        sequence: row.sequence,
        text: row.text,
        createdAt: row.createdAt,
        sender: memberView(row.senderId, identities.get(row.senderId)),
        mentions: row.mentionMemberIds.map((id) =>
          memberView(id, identities.get(id)),
        ),
        attachments: row.attachmentIds.flatMap((id) => {
          const file = files.get(id);
          if (!file) return [];
          return [
            {
              id: file._id,
              name: file.name,
              mimeType: file.mimeType,
              size: file.size,
              downloadPath:
                app.storage && file.state === 'BOUND'
                  ? attachmentPath(appKey, file._id)
                  : null,
            },
          ];
        }),
      })),
      nextCursor:
        rows.length > limit && selected.length ? selected[0].sequence : null,
    };
  },

  async communicationMessagingAdminParticipants(
    _root: unknown,
    { appKey, conversationId }: { appKey: string; conversationId: string },
    { subdomain, user, checkPermission, processId }: AdminContext,
  ) {
    const admin = await requireAdmin(subdomain, user, checkPermission);
    const app = requireAdminApp(subdomain, appKey);
    const models = await adminModels([app]);
    const scope = scopeOf(app);
    const conversation = await requireConversation(models, app, conversationId);
    const rows = await models.Memberships.find({
      ...scope,
      conversationId: conversation._id,
    })
      .sort({ active: -1, memberId: 1 })
      .limit(MAX_PARTICIPANTS)
      .lean();
    const identities = await loadIdentities(
      models,
      scope,
      rows.map((row) => row.memberId),
    );
    await audit(subdomain, admin, processId, 'VIEW_PARTICIPANTS', {
      ...scope,
      conversationId: conversation._id,
      resultCount: rows.length,
    });
    return rows.map((row) => ({
      member: memberView(row.memberId, identities.get(row.memberId)),
      role: row.role,
      active: row.active,
      joinedSequence: row.joinedSequence,
      lastReadSequence: row.lastReadSequence,
      unreadCount: row.unreadCount,
    }));
  },
};

/**
 * Staff download of a file bound to a message. Authorization is independent
 * of the GraphQL queries: the gateway-verified staff user needs the explicit
 * grant, the app must belong to the organization, and the file must be bound
 * to a message in that app. The custom header keeps cross-site pages from
 * triggering audited downloads with a staff cookie.
 */
const downloadAdminAttachment = async (req: Request, res: Response) => {
  if (req.headers[MESSAGING_ADMIN_HEADER] !== '1') throw forbidden();
  const subdomain = getSubdomain(req);
  const user = extractUserFromHeader(req.headers);
  const admin = await requireAdmin(
    subdomain,
    user,
    checkPermissionGroup(subdomain, user ?? undefined),
  );
  const key = typeof req.query.app === 'string' ? req.query.app : '';
  const app = requireAdminApp(subdomain, key);
  if (!app.storage) throw messagingNotFound();
  const models = await adminModels([app]);
  const scope = scopeOf(app);
  const attachment = await models.Attachments.findOne({
    ...scope,
    _id: req.params.id,
    state: 'BOUND',
  }).lean();
  if (!attachment) throw messagingNotFound();
  const bound = await models.Messages.exists({
    ...scope,
    conversationId: attachment.conversationId,
    attachmentIds: attachment._id,
  });
  if (!bound) throw messagingNotFound();
  const object = await messagingStorage(app)
    .getObject({ Bucket: app.storage.bucket, Key: attachment.objectKey })
    .promise();
  if (!Buffer.isBuffer(object.Body))
    throw messagingError('File unavailable', 'INTERNAL_SERVER_ERROR');
  await audit(subdomain, admin, undefined, 'DOWNLOAD_ATTACHMENT', {
    ...scope,
    conversationId: attachment.conversationId,
    attachmentId: attachment._id,
    mimeType: attachment.mimeType,
    size: attachment.size,
  });
  res.set({
    'Content-Type': attachment.mimeType,
    'Content-Disposition':
      "attachment; filename*=UTF-8''" +
      encodeURIComponent(attachment.name)
        .replaceAll("'", '%27')
        .replaceAll('(', '%28')
        .replaceAll(')', '%29')
        .replaceAll('*', '%2A'),
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.send(object.Body);
};

const adminErrorStatus = (error: unknown) => {
  const code =
    error instanceof GraphQLError
      ? error.extensions.code
      : (error as { code?: unknown } | null)?.code;
  if (code === 'UNAUTHORIZED' || code === 'UNAUTHENTICATED') return 401;
  if (code === 'FORBIDDEN') return 403;
  if (code === 'NOT_FOUND') return 404;
  return 503;
};

export const messagingAdminRouter: Router = Router();
messagingAdminRouter.get(
  '/messaging/admin/attachments/:id',
  (req: Request, res: Response) => {
    void downloadAdminAttachment(req, res).catch((error: unknown) => {
      if (res.headersSent) return;
      const status = adminErrorStatus(error);
      res.status(status).json({
        error:
          status === 503
            ? 'Attachment storage unavailable'
            : 'Attachment unavailable',
      });
    });
  },
);
