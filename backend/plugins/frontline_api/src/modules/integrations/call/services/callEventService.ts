import { IModels } from '~/connectionResolvers';
import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import { redlock } from '@/integrations/call/redlock';
import { getOrCreateCustomer } from '@/integrations/call/store';
import { createOrUpdateErxesConversation } from '@/integrations/call/utils';
import { debugCall } from '@/integrations/call/debuggers';

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
  inboxIntegrationId?: string;
  srcTrunkName?: string;
  dstTrunkName?: string;
  callerIdNum?: string;
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
    $or: [
      { srcTrunk: ev.srcTrunkName },
      { dstTrunk: ev.dstTrunkName },
    ].filter((c) => Object.values(c).some(Boolean)),
  });
};

const resolveOperatorUserId = async (
  subdomain: string,
  integration: any,
  extension?: string,
) => {
  if (!extension) return undefined;
  const matched = integration.operators?.find(
    (op: any) => op.gsUsername === extension,
  );
  if (!matched) return undefined;
  return matched.userId as string | undefined;
};

const publishSession = async (
  subdomain: string,
  session: any,
  integration: any,
) => {
  if (!session) return;
  const payload = {
    callSessionUpdated: {
      ...(session.toObject ? session.toObject() : session),
      subdomain,
      inboxIntegrationId: integration?.inboxId,
    },
  };
  await graphqlPubsub.publish(
    `callSessionUpdated:${integration?.inboxId || 'global'}`,
    payload,
  );
  if (session.uniqueid) {
    await graphqlPubsub.publish(
      `callSessionUpdated:uniqueid:${session.uniqueid}`,
      payload,
    );
  }
  if (session.answeredExtension) {
    await graphqlPubsub.publish(
      `callSessionUpdated:ext:${integration?.inboxId}:${session.answeredExtension}`,
      payload,
    );
  }
  for (const op of session.ringingOperators || []) {
    if (!op.extensionNumber) continue;
    await graphqlPubsub.publish(
      `callSessionUpdated:ext:${integration?.inboxId}:${op.extensionNumber}`,
      payload,
    );
  }
};

const ensureConversation = async (
  models: IModels,
  subdomain: string,
  session: any,
  integration: any,
) => {
  if (session.conversationId) return session.conversationId;

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
  });

  if (apiResponse?.status !== 'success' || !apiResponse?.data?._id) {
    throw new Error(
      `ensureConversation failed: ${JSON.stringify(apiResponse)}`,
    );
  }

  session.conversationId = apiResponse.data._id;
  session.customerId = customerId;
  await session.save();
  return session.conversationId;
};

export const handleCallEvent = async (
  models: IModels,
  subdomain: string,
  ev: ICallEventPayload,
) => {
  if (!ev?.uniqueid) {
    throw new Error('uniqueid required');
  }
  if (!ev?.type) {
    throw new Error('event type required');
  }

  const integration = await findIntegrationForEvent(models, ev);
  if (!integration) {
    debugCall(
      `Call event ignored: no matching integration for ${ev.srcTrunkName}/${ev.dstTrunkName}`,
    );
    return { status: 'ignored', reason: 'no_integration' };
  }

  const lockKey = `${subdomain}:call:session:${ev.uniqueid}`;
  let lock;
  try {
    lock = await redlock.acquire([lockKey], SESSION_LOCK_TTL_MS);
  } catch (e) {
    throw new Error(
      `callEvent lock failure for ${ev.uniqueid}: ${e.message}`,
    );
  }

  try {
    let session = await models.CallSessions.findOne({ uniqueid: ev.uniqueid });

    if (!session) {
      const direction: 'incoming' | 'outgoing' =
        ev.callType || (integration.dstTrunk ? 'incoming' : 'incoming');

      const customerPhone =
        direction === 'incoming'
          ? ev.callerIdNum || ''
          : ev.calleeIdNum || '';

      session = await models.CallSessions.upsertSession({
        uniqueid: ev.uniqueid,
        inboxIntegrationId: integration.inboxId,
        callType: direction,
        customerPhone,
        operatorPhone: integration.phone,
        queueName: ev.queueName,
        startedAt: ev.startedAt ? new Date(ev.startedAt) : new Date(),
        status: 'ringing',
        source: 'cti',
        diversion: ev.diversion,
        raw: ev.raw,
      });
    }

    switch (ev.type) {
      case 'ringing': {
        if (ev.extension) {
          const userId = await resolveOperatorUserId(
            subdomain,
            integration,
            ev.extension,
          );
          await models.CallSessions.attachOperator(ev.uniqueid, {
            extensionNumber: ev.extension,
            userId,
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
        const userId = await resolveOperatorUserId(
          subdomain,
          integration,
          ev.extension,
        );
        if (ev.extension) {
          await models.CallSessions.markAnswered(
            ev.uniqueid,
            ev.extension,
            userId,
          );
        }
        session = await models.CallSessions.findOne({
          uniqueid: ev.uniqueid,
        });
        try {
          await ensureConversation(models, subdomain, session, integration);
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
          endedAt: ev.endedAt ? new Date(ev.endedAt) : new Date(),
          hangupCause: ev.hangupCause,
        });
        session = await models.CallSessions.findOne({
          uniqueid: ev.uniqueid,
        });
        break;
      }
    }

    await publishSession(subdomain, session, integration);
    return { status: 'ok', uniqueid: ev.uniqueid, sessionStatus: session?.status };
  } finally {
    try {
      await lock?.unlock();
    } catch (e) {
      console.error('handleCallEvent: lock release failed', e);
    }
  }
};

// suppress unused import lint when sendTRPCMessage is reserved for later
void sendTRPCMessage;
