import { createHash, randomUUID } from 'node:crypto';
import { sign } from 'jsonwebtoken';
import { z } from 'zod';
import type { MessagingActor } from './auth';
import type { MessagingApp } from './config';
import {
  enabledKinds,
  runMessagingTransaction,
  updateThread,
} from './conversations';
import { messagingError } from './errors';
import { generateMessagingModels, type MessagingEvent } from './models';

const serviceAccountSchema = z.object({
  project_id: z.string(),
  client_email: z.string().email(),
  private_key: z.string().min(1),
});
const oauthSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
});
const fcmErrorSchema = z.object({
  error: z
    .object({
      details: z
        .array(z.object({ errorCode: z.string().optional() }).passthrough())
        .optional(),
    })
    .passthrough(),
});
const accessTokens = new Map<string, { token: string; expiresAt: number }>();

export interface RegisterDeviceInput {
  installationId: string;
  platform: 'IOS' | 'ANDROID';
  token: string;
}

export const registerMessagingDevice = (
  actor: MessagingActor,
  input: RegisterDeviceInput,
) => {
  if (!actor.app.push)
    throw messagingError('Push is disabled for this app', 'FORBIDDEN');
  if (
    !input.installationId.trim() ||
    input.installationId.length > 128 ||
    !input.token.trim() ||
    input.token.length > 4096
  ) {
    throw messagingError('Invalid device registration');
  }
  return runMessagingTransaction(actor, async (session) => {
    const { models, scope, member } = actor;
    const tokenHash = createHash('sha256').update(input.token).digest('hex');
    await models.Identities.updateOne(
      { ...scope, _id: member._id, active: true },
      { $inc: { deviceRevision: 1 } },
      { session },
    );
    const selector = { ...scope, tokenHash };
    const previous = await models.Devices.findOne(selector)
      .session(session)
      .lean();
    await models.Devices.updateMany(
      {
        ...scope,
        memberId: member._id,
        installationId: input.installationId,
        tokenHash: { $ne: tokenHash },
        active: true,
      },
      { $set: { active: false } },
      { session },
    );
    const sameLogin =
      previous?.active &&
      previous.memberId === member._id &&
      previous.installationId === input.installationId;
    const generation = sameLogin ? previous.generation : randomUUID();
    const device = await models.Devices.findOneAndUpdate(
      selector,
      {
        $set: {
          ...input,
          memberId: member._id,
          tokenHash,
          active: true,
          generation,
        },
      },
      { upsert: true, new: true, session },
    ).lean();
    if (!device)
      throw messagingError(
        'Device registration failed',
        'INTERNAL_SERVER_ERROR',
      );
    return {
      id: device._id,
      installationId: input.installationId,
      platform: input.platform,
    };
  });
};

export const revokeMessagingDevice = async (
  actor: MessagingActor,
  installationId: string,
) => {
  await actor.models.Devices.updateMany(
    { ...actor.scope, memberId: actor.member._id, installationId },
    { $set: { active: false } },
  );
  return true;
};

export const setMessagingPreference = (
  actor: MessagingActor,
  conversationId: string,
  preference: 'ALL' | 'MENTIONS' | 'NONE',
) =>
  updateThread(actor, conversationId, async ({ session }) => {
    await actor.models.Memberships.updateOne(
      {
        ...actor.scope,
        conversationId,
        memberId: actor.member._id,
      },
      { $set: { preference } },
      { session },
    );
    return true;
  });

export const queueMessagingPush = async (
  app: MessagingApp,
  event: MessagingEvent,
) => {
  if (!app.push || event.kind !== 'MESSAGE' || !event.messageId) return;
  const models = await generateMessagingModels(app.tenant);
  const scope = { tenant: app.tenant, appId: app.appId };
  const message = await models.Messages.findOne({
    ...scope,
    _id: event.messageId,
    senderId: { $ne: event.memberId },
  }).lean();
  if (!message) return;
  const devices = await models.Devices.find({
    ...scope,
    memberId: event.memberId,
    active: true,
  }).lean();
  for (const device of devices) {
    const selector = {
      ...scope,
      eventId: event._id,
      memberId: event.memberId,
      installationId: device.installationId,
    };
    await models.Deliveries.updateOne(
      selector,
      {
        $setOnInsert: {
          ...selector,
          memberId: event.memberId,
          conversationId: event.conversationId,
          messageId: message._id,
          expiresAt: new Date(Date.now() + 30 * 86400_000),
        },
      },
      { upsert: true },
    );
  }
};

const getFirebaseAccessToken = async (app: MessagingApp) => {
  if (!app.push) throw messagingError('Push disabled');
  const account = serviceAccountSchema.parse(
    JSON.parse(process.env[app.push.credentialEnv] || '{}'),
  );
  if (account.project_id !== app.push.projectId)
    throw messagingError('Firebase project mismatch');
  const key = createHash('sha256')
    .update(JSON.stringify(account))
    .digest('hex');
  const cached = accessTokens.get(key);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const assertion = sign(
    {
      iss: account.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    },
    account.private_key,
    { algorithm: 'RS256' },
  );
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('Firebase authentication failed');
  const credential = oauthSchema.parse(await response.json());
  accessTokens.set(key, {
    token: credential.access_token,
    expiresAt: Date.now() + credential.expires_in * 1000,
  });
  return credential.access_token;
};

export type PushResult = {
  status: 'SENT' | 'REVOKE' | 'FAILED' | 'RETRY';
  retryAfter?: number;
};

export const sendMessagingFcm = async (
  app: MessagingApp,
  token: string,
  data: Record<string, string>,
  badge: number,
): Promise<PushResult> => {
  if (!app.push) return { status: 'FAILED' };
  const accessToken = await getFirebaseAccessToken(app);
  const tag = createHash('sha256').update(data.notificationId).digest('hex');
  const response = await fetch(
    'https://fcm.googleapis.com/v1/projects/' +
      encodeURIComponent(app.push.projectId) +
      '/messages:send',
    {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + accessToken,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token,
          notification: {
            title: 'New message',
            body: 'Open the app to view your message',
          },
          data,
          android: { priority: 'HIGH', ttl: '86400s', notification: { tag } },
          apns: {
            headers: {
              'apns-push-type': 'alert',
              'apns-priority': '10',
              'apns-collapse-id': tag,
            },
            payload: { aps: { badge, sound: 'default' } },
          },
        },
      }),
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (response.ok) return { status: 'SENT' };
  const error = fcmErrorSchema.safeParse(
    await response.json().catch(() => null),
  );
  if (
    error.success &&
    error.data.error.details?.some(
      (detail) => detail.errorCode === 'UNREGISTERED',
    )
  ) {
    return { status: 'REVOKE' };
  }
  if ([401, 429, 500, 503].includes(response.status)) {
    if (response.status === 401) accessTokens.clear();
    const retry = response.headers.get('retry-after') || '';
    const delay = /^\d+$/.test(retry)
      ? Number(retry) * 1000
      : Date.parse(retry) - Date.now();
    return {
      status: 'RETRY',
      retryAfter: Number.isFinite(delay) ? Math.max(0, delay) : undefined,
    };
  }
  return { status: 'FAILED' };
};

export const dispatchMessagingPush = async (
  app: MessagingApp,
  send: typeof sendMessagingFcm = sendMessagingFcm,
) => {
  if (!app.push) return;
  const models = await generateMessagingModels(app.tenant);
  const scope = { tenant: app.tenant, appId: app.appId };
  await models.Deliveries.init();
  for (let count = 0; count < 10; count++) {
    const leaseId = randomUUID();
    const delivery = await models.Deliveries.findOneAndUpdate(
      {
        ...scope,
        state: 'PENDING',
        dueAt: { $lte: new Date() },
        leaseUntil: { $lte: new Date() },
      },
      {
        $set: { leaseId, leaseUntil: new Date(Date.now() + 60_000) },
        $inc: { attempts: 1 },
      },
      { new: true },
    ).lean();
    if (!delivery) break;
    const filter = { ...scope, _id: delivery._id, leaseId };
    const device = await models.Devices.findOne({
      ...scope,
      memberId: delivery.memberId,
      installationId: delivery.installationId,
      active: true,
    }).lean();
    const member = await models.Identities.exists({
      ...scope,
      _id: delivery.memberId,
      active: true,
    });
    const membership = await models.Memberships.findOne({
      ...scope,
      conversationId: delivery.conversationId,
      memberId: delivery.memberId,
      active: true,
    }).lean();
    const message = await models.Messages.findOne({
      ...scope,
      _id: delivery.messageId,
    }).lean();
    if (
      !device ||
      !member ||
      !membership ||
      !message ||
      message.createdAt.getTime() < Date.now() - 86400_000 ||
      message.sequence < membership.joinedSequence ||
      message.sequence <= membership.lastReadSequence ||
      membership.preference === 'NONE' ||
      (membership.preference === 'MENTIONS' &&
        !message.mentionMemberIds.includes(delivery.memberId)) ||
      (!app.direct && membership.kind === 'DIRECT') ||
      (!app.group && membership.kind === 'GROUP')
    ) {
      await models.Deliveries.updateOne(filter, { $set: { state: 'SKIPPED' } });
      continue;
    }
    const unread = await models.Memberships.aggregate<{ total: number }>([
      {
        $match: {
          ...scope,
          memberId: delivery.memberId,
          active: true,
          kind: { $in: enabledKinds({ app }) },
        },
      },
      { $group: { _id: null, total: { $sum: '$unreadCount' } } },
    ]);
    const badge = unread[0]?.total ?? 0;
    const identity = await models.Identities.findOne({
      ...scope,
      _id: delivery.memberId,
    }).lean();
    const url = new URL(app.push.deepLinkBase);
    url.searchParams.set('conversationId', delivery.conversationId);
    const data = {
      notificationId: delivery._id,
      conversationId: delivery.conversationId,
      messageId: delivery.messageId,
      appId: app.appId,
      cursor: String(identity?.eventSequence ?? 0),
      badge: String(badge),
      url: url.toString(),
    };
    let result: PushResult;
    try {
      result = await send(app, device.token, data, badge);
    } catch {
      result = { status: 'RETRY' };
    }
    if (result.status === 'REVOKE') {
      await models.Devices.updateOne(
        { ...scope, _id: device._id, generation: device.generation },
        { $set: { active: false } },
      );
    }
    const retry = result.status === 'RETRY' && delivery.attempts < 8;
    const delay =
      Math.max(
        result.retryAfter ?? 0,
        Math.min(3600_000, 60_000 * 2 ** (delivery.attempts - 1)),
      ) + Math.floor(Math.random() * 1000);
    await models.Deliveries.updateOne(filter, {
      $set: {
        state: retry ? 'PENDING' : result.status === 'SENT' ? 'SENT' : 'FAILED',
        dueAt: new Date(Date.now() + delay),
        leaseUntil: new Date(0),
      },
    });
  }
};
