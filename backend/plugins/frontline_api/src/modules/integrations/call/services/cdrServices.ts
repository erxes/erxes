import type { FilterQuery } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import {
  integrationForQueue,
  queueFromActionType,
  rehomeCallRecords,
  resolveQueueIntegration,
} from '@/integrations/call/services/queueRouting';
import { debugCall } from '@/integrations/call/debuggers';
import {
  ICdrParams,
  determinePrimaryPhone,
  findOrCreateCdr,
  getConversationContent,
  isHumanAnsweredLeg,
  parseCdrDate,
  syncCdrRecording,
} from '@/integrations/call/services/cdrUtils';
import {
  findIntegrationByTrunk,
  publishSession,
} from '@/integrations/call/services/callEventService';
import {
  findPeerIntegrations,
  matchCdrOperator,
} from '@/integrations/call/services/operatorResolution';
import { getOrCreateCustomer } from '@/integrations/call/store';
import { createOrUpdateErxesConversation } from '@/integrations/call/utils';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import {
  acquireCustomerLock,
  acquireSessionLock,
  releaseLocks,
} from '@/integrations/call/redlock';
import { ICallSessionDocument } from '@/integrations/call/@types/callSessions';
import { ICallIntegrationDocument } from '@/integrations/call/@types/integrations';

const FOLLOWME_OVERLAP_BUFFER_MS = 60_000;
const LEG_OVERLAP_BUFFER_MS = 10_000;

interface ICdrLegTimeParams {
  action_type?: string;
  userfield?: string;
  start?: string;
  end?: string;
  session?: string;
}

interface IConversationPayload {
  conversationId: string;
  content: string;
  updatedAt: Date;
  integrationId?: string;
  owner?: string;
  userId?: string;
  customerId?: string;
}

const belongsToInboundCall = (params: ICdrLegTimeParams) =>
  !!params.action_type?.includes('FOLLOWME') || params.userfield !== 'Outbound';

const findOverlappingLeg = async (
  models: IModels,
  params: ICdrLegTimeParams,
  primaryPhone: string,
  inboxId: string,
  peerInboxIds: string[],
) => {
  if (!primaryPhone || !belongsToInboundCall(params)) return null;

  const isFollowmeLeg = !!params.action_type?.includes('FOLLOWME');

  const legStart = parseCdrDate(params.start);
  if (!legStart || isNaN(legStart.getTime())) return null;

  const legEnd = parseCdrDate(params.end) || legStart;
  const bufferMs = isFollowmeLeg
    ? FOLLOWME_OVERLAP_BUFFER_MS
    : LEG_OVERLAP_BUFFER_MS;

  const otherInboxIds = peerInboxIds.filter((peerId) => peerId !== inboxId);
  const sameCallOnPeer =
    params.session && otherInboxIds.length
      ? [
          {
            inboxIntegrationId: { $in: otherInboxIds },
            session: params.session,
          },
        ]
      : [];

  return models.CallCdrs.findOne({
    $and: [
      { $or: [{ src: primaryPhone }, { dst: primaryPhone }] },
      { $or: [{ inboxIntegrationId: inboxId }, ...sameCallOnPeer] },
    ],
    conversationId: { $exists: true, $ne: '' },
    start: { $lte: new Date(legEnd.getTime() + bufferMs) },
    end: { $gte: new Date(legStart.getTime() - bufferMs) },
  }).sort({ start: -1 });
};

export const receiveCdr = async (
  models: IModels,
  subdomain: string,
  params: ICdrParams,
  verifiedIntegration?: ICallIntegrationDocument,
) => {
  debugCall(`Request to get post data with: ${JSON.stringify(params)}`);
  const matched =
    verifiedIntegration ||
    (await findIntegrationByTrunk(
      models,
      params.src_trunk_name,
      params.dst_trunk_name,
    ));
  if (!matched) return null;

  const queueOwner = await resolveQueueIntegration(
    models,
    matched,
    queueFromActionType(params.action_type),
  );
  const integration = queueOwner || matched;

  const sessionLock = await acquireSessionLock(subdomain, params);
  const customerLock = await acquireCustomerLock(
    subdomain,
    determinePrimaryPhone(params),
  );

  let result: Awaited<ReturnType<typeof processCdrLocked>>;
  try {
    if (queueOwner && params.uniqueid) {
      await rehomeCallRecords(
        models,
        { uniqueid: params.uniqueid, linkedid: params.linkedid },
        queueOwner.inboxId,
        queueOwner.phone,
      );
    }
    result = await processCdrLocked(models, subdomain, params, integration);
  } finally {
    await releaseLocks('receiveCdr', [customerLock, sessionLock]);
  }

  // The recording download and upload can take minutes on a large WAV, so it
  // runs after the CDR and session are saved and the PBX has its answer.
  if (result.created) {
    syncCdrRecording(models, subdomain, params, integration.inboxId).catch(
      (error) => {
        console.error(
          `[call] recording sync failed for CDR ${params.AcctId}:`,
          error,
        );
      },
    );
  }

  return 'success';
};

const processCdrLocked = async (
  models: IModels,
  subdomain: string,
  params: ICdrParams,
  integration: ICallIntegrationDocument,
) => {
  const inboxId = integration.inboxId;
  const queueRouted = Boolean(
    integrationForQueue([integration], queueFromActionType(params.action_type)),
  );

  const primaryPhone = determinePrimaryPhone(params);

  const customer = await getOrCreateCustomer(models, subdomain, {
    primaryPhone,
    inboxIntegrationId: inboxId,
  });

  const peers = await findPeerIntegrations(models, integration);
  const peerInboxIds = peers.map((peer) => peer.inboxId);
  const { match: operatorMatch, extension: operatorExtension } =
    matchCdrOperator(peers, params);
  const operatorUserId = operatorMatch?.operator.userId;

  let operatorPhone = '';
  if (operatorUserId) {
    const operator = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: { query: { _id: operatorUserId } },
    });

    operatorPhone = operator?.details?.operatorPhone || '';
  }

  const isAnsweredLeg = isHumanAnsweredLeg(params);
  const ownerForConversation = isAnsweredLeg ? operatorPhone : undefined;
  const assignedUserId = isAnsweredLeg ? operatorUserId : undefined;
  const answeredInboxId =
    isAnsweredLeg && operatorMatch && !queueRouted
      ? operatorMatch.integration.inboxId
      : undefined;

  let conversationId: string | undefined;
  let isNewConversation = false;

  let existingSession: ICallSessionDocument | null = null;
  if (params.uniqueid) {
    const sessionSelectors: FilterQuery<ICallSessionDocument>[] = [
      { uniqueid: params.uniqueid },
      { linkedid: params.uniqueid },
    ];
    if (params.linkedid) {
      sessionSelectors.push(
        { uniqueid: params.linkedid },
        { linkedid: params.linkedid },
      );
    }
    existingSession = await models.CallSessions.findOne({
      $or: sessionSelectors,
    });
    if (existingSession?.conversationId) {
      conversationId = existingSession.conversationId;
      debugCall(
        `CDR matched CallSession ${existingSession._id} for uniqueid=${params.uniqueid}`,
      );
    }
  }

  if (!conversationId) {
    const cdrUniqueids = [params.uniqueid, params.linkedid].filter(Boolean);
    const existingCdr = await models.CallCdrs.findOne({
      uniqueid: { $in: cdrUniqueids },
      conversationId: { $exists: true, $ne: '' },
      inboxIntegrationId: { $in: peerInboxIds },
    }).sort({ createdAt: 1 });

    if (existingCdr?.conversationId) {
      conversationId = existingCdr.conversationId;
      debugCall(
        `CDR reused conversation ${conversationId} from leg ${existingCdr.acctId}`,
      );
    }
  }

  if (!conversationId) {
    const overlappingCdr = await findOverlappingLeg(
      models,
      params,
      primaryPhone,
      inboxId,
      peerInboxIds,
    );

    if (overlappingCdr?.conversationId) {
      conversationId = overlappingCdr.conversationId;
      debugCall(
        `Leg merge: reusing conversation ${conversationId} from overlapping ` +
          `CDR ${overlappingCdr._id} for phone=${primaryPhone}`,
      );
    }
  }

  if (!conversationId && belongsToInboundCall(params)) {
    const siblingSession = await models.CallSessions.findSibling({
      inboxIntegrationId: inboxId,
      peerInboxIds,
      customerPhone: primaryPhone,
      excludeUniqueid: params.uniqueid,
    });

    if (siblingSession?.conversationId) {
      conversationId = siblingSession.conversationId;
      debugCall(
        `Leg merge: reusing conversation ${conversationId} from sibling ` +
          `session ${siblingSession.uniqueid} for phone=${primaryPhone}`,
      );
    }
  }

  const content = await getConversationContent(models, params, conversationId);

  const payload: IConversationPayload = {
    conversationId: conversationId || '',
    content,
    updatedAt: new Date(),
    owner: ownerForConversation,
    userId: assignedUserId,
    integrationId: queueRouted
      ? inboxId
      : answeredInboxId || (conversationId ? undefined : inboxId),
  };
  if (customer) {
    payload.customerId = customer?.erxesApiId;
  }

  if (conversationId) {
    await createOrUpdateErxesConversation(subdomain, payload);
  } else {
    const newErxesConversation = await createOrUpdateErxesConversation(
      subdomain,
      payload,
    );

    if (newErxesConversation.status === 'success') {
      conversationId = newErxesConversation?.data._id;
      isNewConversation = true;
    }
  }

  if (!conversationId) {
    throw new Error('Failed to find or create a conversation ID.');
  }

  if (existingSession) {
    const sessionPatch: Record<string, string> = {};
    if (!existingSession.conversationId) {
      sessionPatch.conversationId = conversationId;
      if (customer?.erxesApiId) {
        sessionPatch.customerId = customer.erxesApiId;
      }
    }
    if (
      answeredInboxId &&
      existingSession.inboxIntegrationId !== answeredInboxId
    ) {
      sessionPatch.inboxIntegrationId = answeredInboxId;
    }
    if (Object.keys(sessionPatch).length) {
      await models.CallSessions.updateOne(
        { _id: existingSession._id },
        { $set: sessionPatch },
      );
      existingSession.conversationId = conversationId;
    }
  }

  const { cdr, created } = await findOrCreateCdr(
    models,
    params,
    inboxId,
    conversationId,
  );

  if (created && isNewConversation) {
    const doc = {
      ...cdr.toObject(),
      conversationId: cdr.conversationId,
    };
    await pConversationClientMessageInserted(subdomain, doc);
  }

  if (params.uniqueid) {
    const sessionUniqueid = existingSession?.uniqueid || params.uniqueid;
    try {
      if (!existingSession) {
        const direction =
          params.userfield === 'Outbound' ? 'outgoing' : 'incoming';
        const startedAt = parseCdrDate(params.start);

        await models.CallSessions.upsertSession({
          uniqueid: sessionUniqueid,
          ...(params.linkedid ? { linkedid: params.linkedid } : {}),
          inboxIntegrationId: answeredInboxId || inboxId,
          conversationId,
          customerId: customer?.erxesApiId,
          customerPhone: primaryPhone,
          callType: direction,
          operatorPhone: operatorPhone || '',
          ...(startedAt ? { startedAt } : {}),
          source: 'cdr',
        });
      }

      if (operatorExtension) {
        if (isAnsweredLeg) {
          await models.CallSessions.markAnswered(
            sessionUniqueid,
            operatorExtension,
            operatorUserId,
          );
        } else if (!existingSession) {
          await models.CallSessions.attachOperator(sessionUniqueid, {
            extensionNumber: operatorExtension,
            userId: operatorUserId,
            state: 'noanswer',
          });
        }
      }

      const endedAt = parseCdrDate(params.end) || new Date();

      const legDisposition = isAnsweredLeg
        ? 'ANSWERED'
        : (params.disposition || '').toUpperCase() === 'ANSWERED'
        ? 'NO ANSWER'
        : params.disposition;

      await models.CallSessions.markEnded(sessionUniqueid, {
        endedAt,
        durationSec: isAnsweredLeg
          ? Number(params.billsec) || undefined
          : undefined,
        hangupCause: legDisposition,
        disposition: legDisposition,
        recordUrl: cdr.recordUrl,
        cdrAcctId: cdr.acctId,
      });

      const updatedSession = await models.CallSessions.findOne({
        uniqueid: sessionUniqueid,
      });
      await publishSession(subdomain, updatedSession, integration, peers);
    } catch (e) {
      debugCall(
        `CallSession finalize failed for ${sessionUniqueid}: ${e.message}`,
      );
    }
  }

  return { created };
};
