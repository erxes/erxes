import { IModels } from '~/connectionResolvers';
import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import { acquireCustomerLock, redlock } from '@/integrations/call/redlock';
import { getOrCreateCustomer } from '@/integrations/call/store';
import { createOrUpdateErxesConversation } from '@/integrations/call/utils';
import { debugCall } from '@/integrations/call/debuggers';
import { parseCdrDate } from '@/integrations/call/services/cdrUtils';
import { ICallSessionDocument } from '@/integrations/call/@types/callSessions';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { ICallIntegrationDocument } from '@/integrations/call/@types/integrations';
import {
  findPeerIntegrations,
  inboxIdForExtension,
  matchOperatorByExtension,
} from '@/integrations/call/services/operatorResolution';

const SESSION_LOCK_TTL_MS = 15_000;

export type CallEventType =
  | 'ringing'
  | 'answered'
  | 'bridged'
  | 'hangup'
  | 'noanswer';

export interface ICallEventPayload {
  type: CallEventType;
  uniqueid: string;
  linkedid?: string;
  inboxIntegrationId?: string;
  srcTrunkName?: string;
  dstTrunkName?: string;
  callerIdNum?: string;
  callerIdName?: string;
  calleeIdNum?: string;
  callType?: 'incoming' | 'outgoing';
  queueName?: string;
  extension?: string;
  channel?: string;
  hangupCause?: string;
  startedAt?: string;
  answeredAt?: string;
  endedAt?: string;
  diversion?: string;
  raw?: Record<string, any>;
}

const findIntegrationForEvent = async (
  models: IModels,
  ev: ICallEventPayload,
) => {
  if (ev.inboxIntegrationId) {
    const direct = await models.CallIntegrations.findOne({
      inboxId: ev.inboxIntegrationId,
    });
    if (direct) return direct;
  }
  return models.CallIntegrations.findOne({
    $or: [{ srcTrunk: ev.srcTrunkName }, { dstTrunk: ev.dstTrunkName }].filter(
      (c) => Object.values(c).some(Boolean),
    ),
  });
};

const publishSession = async (
  subdomain: string,
  session: any,
  integration: any,
  peers: ICallIntegrationDocument[],
) => {
  if (!session) return;
  const sessionInboxId = session.inboxIntegrationId || integration?.inboxId;
  const payload = {
    callSessionUpdated: {
      ...(session.toObject ? session.toObject() : session),
      subdomain,
      inboxIntegrationId: sessionInboxId,
    },
  };
  if (session.uniqueid) {
    await graphqlPubsub.publish(
      `callSessionUpdated:uniqueid:${session.uniqueid}`,
      payload,
    );
  }
  const published = new Set<string>();
  const publishToExtension = async (extension?: string) => {
    if (!extension) return;
    const inboxId = inboxIdForExtension(peers, extension, sessionInboxId);
    const key = `${inboxId}:${extension}`;
    if (published.has(key)) return;
    published.add(key);
    await graphqlPubsub.publish(`callSessionUpdated:ext:${key}`, payload);
  };
  await publishToExtension(session.answeredExtension);
  for (const op of session.ringingOperators || []) {
    await publishToExtension(op.extensionNumber);
  }
};

const isChildLeg = (ev: ICallEventPayload) =>
  !!ev.linkedid && ev.linkedid !== ev.uniqueid;

const looksLikePhoneNumber = (value?: string) =>
  !!value && /^\+?\d{5,}$/.test(value);

const findParentLegSession = async (
  models: IModels,
  ev: ICallEventPayload,
): Promise<ICallSessionDocument | null> => {
  if (!isChildLeg(ev)) return null;

  return models.CallSessions.findOne({
    $or: [
      { uniqueid: ev.linkedid },
      { linkedid: ev.linkedid, uniqueid: { $ne: ev.uniqueid } },
    ],
  }).sort({ startedAt: 1 });
};

const isSiblingLeg = (
  candidate: ICallSessionDocument | null,
  ev: ICallEventPayload,
  direction: 'incoming' | 'outgoing',
) => {
  if (!candidate?.conversationId) return false;

  return (
    isChildLeg(ev) ||
    direction === 'incoming' ||
    candidate.status === 'ringing' ||
    candidate.status === 'active'
  );
};

const ensureConversation = async (
  models: IModels,
  subdomain: string,
  session: any,
  integration: any,
  assignedUserId?: string,
) => {
  if (session.conversationId) {
    if (assignedUserId) {
      await createOrUpdateErxesConversation(subdomain, {
        conversationId: session.conversationId,
        integrationId: integration.inboxId,
        content: session.callType || 'incoming',
        updatedAt: new Date(),
        userId: assignedUserId,
      });
    }
    return session.conversationId;
  }

  let customerId = session.customerId;
  if (!customerId) {
    const customer = await getOrCreateCustomer(models, subdomain, {
      primaryPhone: session.customerPhone,
      inboxIntegrationId: integration.inboxId,
    });
    customerId = customer?.erxesApiId;
  }

  const apiResponse = await createOrUpdateErxesConversation(subdomain, {
    customerId,
    integrationId: integration.inboxId,
    content: session.callType || 'incoming',
    conversationId: '',
    updatedAt: new Date(),
    owner: '',
    userId: assignedUserId,
  });

  if (apiResponse?.status !== 'success' || !apiResponse?.data?._id) {
    throw new Error(
      `ensureConversation failed: ${JSON.stringify(apiResponse)}`,
    );
  }

  session.conversationId = apiResponse.data._id;
  session.customerId = customerId;
  await session.save();

  try {
    const conversationMessage = {
      _id: session.conversationId,
      conversationId: session.conversationId,
      content: session.callType || 'incoming',
      createdAt: new Date(),
    };
    await graphqlPubsub.publish(
      `conversationMessageInserted:${session.conversationId}`,
      { conversationMessageInserted: conversationMessage },
    );
    await pConversationClientMessageInserted(subdomain, conversationMessage);
  } catch (e) {
    debugCall(
      `ensureConversation publish failed for ${session.uniqueid}: ${e.message}`,
    );
  }

  return session.conversationId;
};

export const handleCallEvent = async (
  models: IModels,
  subdomain: string,
  ev: ICallEventPayload,
  verifiedIntegration?: any,
) => {
  if (!ev?.uniqueid) {
    throw new Error('uniqueid required');
  }
  if (!ev?.type) {
    throw new Error('event type required');
  }

  const integration =
    verifiedIntegration || (await findIntegrationForEvent(models, ev));
  if (!integration) {
    debugCall(
      `Call event ignored: no matching integration for ${ev.srcTrunkName}/${ev.dstTrunkName}`,
    );
    return { status: 'ignored', reason: 'no_integration' };
  }

  const peers = await findPeerIntegrations(models, integration);

  const direction: 'incoming' | 'outgoing' =
    ev.callType ||
    (ev.dstTrunkName && !ev.srcTrunkName ? 'outgoing' : 'incoming');

  const eventPhone =
    direction === 'incoming' ? ev.callerIdNum || '' : ev.calleeIdNum || '';

  const lockKey = `${subdomain}:call:session:${ev.uniqueid}`;
  let lock;
  try {
    lock = await redlock.acquire([lockKey], SESSION_LOCK_TTL_MS);
  } catch (e) {
    throw new Error(`callEvent lock failure for ${ev.uniqueid}: ${e.message}`);
  }

  const customerLock = await acquireCustomerLock(
    subdomain,
    integration.inboxId,
    eventPhone,
  );

  try {
    let session: any = await models.CallSessions.findOne({
      uniqueid: ev.uniqueid,
    });

    if (!session) {
      const parent = await findParentLegSession(models, ev);

      const customerPhone =
        parent?.customerPhone ||
        (isChildLeg(ev) && looksLikePhoneNumber(ev.callerIdName)
          ? (ev.callerIdName as string)
          : eventPhone);

      let sibling = parent;

      if (!sibling) {
        const candidate = await models.CallSessions.findSibling({
          inboxIntegrationId: integration.inboxId,
          customerPhone,
          excludeUniqueid: ev.uniqueid,
        });

        sibling = isSiblingLeg(candidate, ev, direction) ? candidate : null;
      }

      if (sibling?.conversationId) {
        debugCall(
          `Call event ${ev.uniqueid} joined conversation ${sibling.conversationId} ` +
            `from ${parent ? 'parent' : 'sibling'} leg ${sibling.uniqueid} ` +
            `(phone=${customerPhone})`,
        );
      }

      session = await models.CallSessions.upsertSession({
        uniqueid: ev.uniqueid,
        linkedid: ev.linkedid,
        inboxIntegrationId: integration.inboxId,
        callType: direction,
        customerPhone,
        operatorPhone: integration.phone,
        queueName: ev.queueName,
        startedAt: parseCdrDate(ev.startedAt) || new Date(),
        status: 'ringing',
        source: 'cti',
        diversion: ev.diversion,
        raw: ev.raw,
        ...(sibling?.conversationId
          ? {
              conversationId: sibling.conversationId,
              ...(sibling.customerId ? { customerId: sibling.customerId } : {}),
            }
          : {}),
      });
    }

    switch (ev.type) {
      case 'ringing': {
        if (ev.extension) {
          const match = matchOperatorByExtension(peers, ev.extension);
          await models.CallSessions.attachOperator(ev.uniqueid, {
            extensionNumber: ev.extension,
            userId: match?.operator.userId,
            state: 'ringing',
          });
          session = await models.CallSessions.findOne({
            uniqueid: ev.uniqueid,
          });
        }
        try {
          await ensureConversation(models, subdomain, session, integration);
        } catch (e) {
          debugCall(
            `ensureConversation deferred for ${ev.uniqueid}: ${e.message}`,
          );
        }
        break;
      }

      case 'answered':
      case 'bridged': {
        const match = matchOperatorByExtension(peers, ev.extension);
        const userId = match?.operator.userId;
        const owner = match?.integration || integration;
        if (ev.extension) {
          await models.CallSessions.markAnswered(
            ev.uniqueid,
            ev.extension,
            userId,
          );
        }
        if (match && session.inboxIntegrationId !== owner.inboxId) {
          await models.CallSessions.updateOne(
            { uniqueid: ev.uniqueid },
            {
              $set: {
                inboxIntegrationId: owner.inboxId,
                operatorPhone: owner.phone,
              },
            },
          );
        }
        session = await models.CallSessions.findOne({
          uniqueid: ev.uniqueid,
        });
        try {
          await ensureConversation(models, subdomain, session, owner, userId);
        } catch (e) {
          debugCall(
            `ensureConversation on answer failed for ${ev.uniqueid}: ${e.message}`,
          );
        }
        break;
      }

      case 'noanswer': {
        if (ev.extension) {
          await models.CallSessions.attachOperator(ev.uniqueid, {
            extensionNumber: ev.extension,
            state: 'noanswer',
          });
          session = await models.CallSessions.findOne({
            uniqueid: ev.uniqueid,
          });
        }
        break;
      }

      case 'hangup': {
        await models.CallSessions.markEnded(ev.uniqueid, {
          endedAt: parseCdrDate(ev.endedAt) || new Date(),
          hangupCause: ev.hangupCause,
        });
        session = await models.CallSessions.findOne({
          uniqueid: ev.uniqueid,
        });
        break;
      }
    }

    await publishSession(subdomain, session, integration, peers);
    return {
      status: 'ok',
      uniqueid: ev.uniqueid,
      sessionStatus: session?.status,
    };
  } finally {
    for (const held of [customerLock, lock]) {
      try {
        await held?.release();
      } catch (e) {
        console.error('handleCallEvent: lock release failed', e);
      }
    }
  }
};

export interface IUcmCallPayload {
  type: 'incoming_call' | 'outgoing_call';
  caller: string;
  callerName?: string;
  extension?: string;
  did?: string;
  trunk?: string;
  queue?: string;
  channel?: string;
  uniqueid: string;
  linkedid?: string;
  at?: string;
}

const ucmPayloadToCallEvent = (p: IUcmCallPayload): ICallEventPayload => {
  const isIncoming = p.type === 'incoming_call';

  return {
    type: 'ringing',
    uniqueid: p.uniqueid,
    linkedid: p.linkedid,
    callType: isIncoming ? 'incoming' : 'outgoing',
    callerIdNum: isIncoming ? p.caller : p.extension,
    callerIdName: p.callerName,
    calleeIdNum: isIncoming ? p.did : p.caller,
    srcTrunkName: isIncoming ? p.trunk : undefined,
    dstTrunkName: isIncoming ? undefined : p.trunk,
    queueName: p.queue || undefined,
    extension: p.extension || undefined,
    channel: p.channel || undefined,
    startedAt: p.at || undefined,
    raw: p as Record<string, any>,
  };
};

export const handleReceiveCall = async (
  models: IModels,
  subdomain: string,
  payload: IUcmCallPayload,
  verifiedIntegration?: any,
) => {
  if (!payload?.uniqueid) {
    throw new Error('uniqueid required');
  }
  if (payload.type !== 'incoming_call' && payload.type !== 'outgoing_call') {
    throw new Error(`unsupported receiveCall payload type: ${payload?.type}`);
  }

  return handleCallEvent(
    models,
    subdomain,
    ucmPayloadToCallEvent(payload),
    verifiedIntegration,
  );
};

void sendTRPCMessage;
