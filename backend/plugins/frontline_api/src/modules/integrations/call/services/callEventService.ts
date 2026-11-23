import { IModels } from '~/connectionResolvers';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import type { Lock } from 'redlock';
import {
  rehomeCallRecords,
  resolveQueueIntegration,
} from '@/integrations/call/services/queueRouting';
import {
  acquireCustomerLock,
  acquireSessionLock,
  releaseLocks,
} from '@/integrations/call/redlock';
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
  raw?: Record<string, unknown>;
}

const FINISHED_SESSION_STATUSES = ['ended', 'missed', 'failed'];

const isSessionFinished = (session?: ICallSessionDocument | null) =>
  !!session && FINISHED_SESSION_STATUSES.includes(session.status);

/*
 * Matches an integration by trunk name. Empty trunk names never match, so a
 * payload without trunks cannot pick an arbitrary integration.
 */
export const findIntegrationByTrunk = async (
  models: IModels,
  srcTrunk?: string,
  dstTrunk?: string,
): Promise<ICallIntegrationDocument | null> => {
  const selectors = [
    ...(srcTrunk ? [{ srcTrunk }] : []),
    ...(dstTrunk ? [{ dstTrunk }] : []),
  ];
  if (!selectors.length) return null;
  return models.CallIntegrations.findOne({ $or: selectors });
};

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
  return findIntegrationByTrunk(models, ev.srcTrunkName, ev.dstTrunkName);
};

export const publishSession = async (
  subdomain: string,
  session: ICallSessionDocument | null,
  integration: ICallIntegrationDocument | undefined,
  peers: ICallIntegrationDocument[],
) => {
  if (!session) return;
  const sessionInboxId =
    session.inboxIntegrationId || integration?.inboxId || '';
  const payload = {
    callSessionUpdated: {
      ...session.toObject(),
      subdomain,
      inboxIntegrationId: sessionInboxId,
    },
  };
  const topic = (suffix: string) => `callSessionUpdated:${subdomain}:${suffix}`;

  if (session.uniqueid) {
    await graphqlPubsub.publish(topic(`uniqueid:${session.uniqueid}`), payload);
  }
  const published = new Set<string>();
  const publishToExtension = async (extension?: string) => {
    if (!extension) return;
    const inboxId = inboxIdForExtension(peers, extension, sessionInboxId);
    const key = `${inboxId}:${extension}`;
    if (published.has(key)) return;
    published.add(key);
    await graphqlPubsub.publish(topic(`ext:${key}`), payload);
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
  session: ICallSessionDocument,
  integration: ICallIntegrationDocument,
  assignedUserId?: string,
) => {
  if (session.conversationId) {
    // Only assign the operator. The CDR owns the conversation text, and a
    // finished call must not reopen its conversation.
    if (assignedUserId && !isSessionFinished(session)) {
      await createOrUpdateErxesConversation(subdomain, {
        conversationId: session.conversationId,
        integrationId: integration.inboxId,
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

  const conversationId: string = apiResponse.data._id;
  session.conversationId = conversationId;
  session.customerId = customerId;
  await session.save();

  try {
    const conversationMessage = {
      _id: conversationId,
      conversationId,
      content: session.callType || 'incoming',
      createdAt: new Date(),
    };
    await graphqlPubsub.publish(
      `conversationMessageInserted:${conversationId}`,
      { conversationMessageInserted: conversationMessage },
    );
    await pConversationClientMessageInserted(subdomain, conversationMessage);
  } catch (e) {
    debugCall(
      `ensureConversation publish failed for ${session.uniqueid}: ${e.message}`,
    );
  }

  return conversationId;
};

const findSession = async (
  models: IModels,
  uniqueid: string,
): Promise<ICallSessionDocument | null> =>
  models.CallSessions.findOne({ uniqueid });

export const handleCallEvent = async (
  models: IModels,
  subdomain: string,
  ev: ICallEventPayload,
  verifiedIntegration?: ICallIntegrationDocument,
) => {
  if (!ev?.uniqueid) {
    throw new Error('uniqueid required');
  }
  if (!ev?.type) {
    throw new Error('event type required');
  }

  const matched =
    verifiedIntegration || (await findIntegrationForEvent(models, ev));
  if (!matched) {
    debugCall(
      `Call event ignored: no matching integration for ${ev.srcTrunkName}/${ev.dstTrunkName}`,
    );
    return { status: 'ignored', reason: 'no_integration' };
  }

  const queueOwner = await resolveQueueIntegration(
    models,
    matched,
    ev.queueName,
  );
  const integration = queueOwner || matched;
  const peers = await findPeerIntegrations(models, integration);

  const direction: 'incoming' | 'outgoing' =
    ev.callType ||
    (ev.dstTrunkName && !ev.srcTrunkName ? 'outgoing' : 'incoming');

  const eventPhone =
    direction === 'incoming' ? ev.callerIdNum || '' : ev.calleeIdNum || '';

  const lock = await acquireSessionLock(subdomain, ev);
  let customerLock: Lock | null = null;

  try {
    if (queueOwner) {
      const callIds = [ev.uniqueid, ev.linkedid].filter((id): id is string =>
        Boolean(id),
      );
      await rehomeCallRecords(
        models,
        { uniqueid: ev.uniqueid, linkedid: ev.linkedid },
        queueOwner.inboxId,
        queueOwner.phone,
      );
      await models.CallSessions.updateMany(
        {
          $or: [{ uniqueid: { $in: callIds } }, { linkedid: { $in: callIds } }],
          queueName: { $ne: ev.queueName },
        },
        { $set: { queueName: ev.queueName } },
      );
    }

    let session = await findSession(models, ev.uniqueid);

    if (queueOwner && session?.conversationId && !isSessionFinished(session)) {
      await createOrUpdateErxesConversation(subdomain, {
        conversationId: session.conversationId,
        integrationId: queueOwner.inboxId,
        updatedAt: new Date(),
      });
    }

    const parent = session ? null : await findParentLegSession(models, ev);
    const customerPhone =
      session?.customerPhone ||
      parent?.customerPhone ||
      (isChildLeg(ev) && looksLikePhoneNumber(ev.callerIdName)
        ? ev.callerIdName
        : eventPhone) ||
      '';

    customerLock = await acquireCustomerLock(subdomain, customerPhone);

    if (!session) {
      let sibling = parent;

      if (!sibling) {
        const candidate = await models.CallSessions.findSibling({
          inboxIntegrationId: integration.inboxId,
          peerInboxIds: peers.map((peer) => peer.inboxId),
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
          session = (await findSession(models, ev.uniqueid)) || session;
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
        const owner =
          queueOwner ||
          (await resolveQueueIntegration(
            models,
            integration,
            session.queueName,
          )) ||
          match?.integration ||
          integration;
        if (ev.extension) {
          await models.CallSessions.markAnswered(
            ev.uniqueid,
            ev.extension,
            userId,
          );
        }
        if (
          match &&
          !isSessionFinished(session) &&
          session.inboxIntegrationId !== owner.inboxId
        ) {
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
        session = (await findSession(models, ev.uniqueid)) || session;
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
          session = (await findSession(models, ev.uniqueid)) || session;
        }
        break;
      }

      case 'hangup': {
        await models.CallSessions.markEnded(ev.uniqueid, {
          endedAt: parseCdrDate(ev.endedAt) || new Date(),
          hangupCause: ev.hangupCause,
        });
        session = (await findSession(models, ev.uniqueid)) || session;
        break;
      }
    }

    await publishSession(subdomain, session, integration, peers);
    return {
      status: 'ok',
      uniqueid: ev.uniqueid,
      sessionStatus: session.status,
    };
  } finally {
    await releaseLocks('handleCallEvent', [customerLock, lock]);
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
    raw: { ...p },
  };
};

export const handleReceiveCall = async (
  models: IModels,
  subdomain: string,
  payload: IUcmCallPayload,
  verifiedIntegration?: ICallIntegrationDocument,
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
