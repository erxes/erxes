import { IModels } from '~/connectionResolvers';
import { sendTRPCMessage, graphqlPubsub } from 'erxes-api-shared/utils';
import { debugCall } from '@/integrations/call/debuggers';
import {
  determinePrimaryPhone,
  findOrCreateCdr,
  getConversationContent,
  isHumanAnsweredLeg,
  parseCdrDate,
  resolveCdrOperator,
} from '@/integrations/call/services/cdrUtils';
import { getOrCreateCustomer } from '@/integrations/call/store';
import { createOrUpdateErxesConversation } from '@/integrations/call/utils';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { acquireCustomerLock, redlock } from '@/integrations/call/redlock';
import { ICallSessionDocument } from '@/integrations/call/@types/callSessions';

const CDR_LOCK_TTL_MS = 20_000;
const FOLLOWME_OVERLAP_BUFFER_MS = 60_000;
const LEG_OVERLAP_BUFFER_MS = 10_000;

interface ICdrLegTimeParams {
  action_type?: string;
  userfield?: string;
  start?: string;
  end?: string;
}

interface IConversationPayload {
  conversationId: string;
  content: string;
  updatedAt: Date;
  integrationId: string;
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
) => {
  if (!primaryPhone || !belongsToInboundCall(params)) return null;

  const isFollowmeLeg = !!params.action_type?.includes('FOLLOWME');

  const legStart = parseCdrDate(params.start);
  if (!legStart || isNaN(legStart.getTime())) return null;

  const legEnd = parseCdrDate(params.end) || legStart;
  const bufferMs = isFollowmeLeg
    ? FOLLOWME_OVERLAP_BUFFER_MS
    : LEG_OVERLAP_BUFFER_MS;

  return models.CallCdrs.findOne({
    $or: [{ src: primaryPhone }, { dst: primaryPhone }],
    conversationId: { $exists: true, $ne: '' },
    inboxIntegrationId: inboxId,
    start: { $lte: new Date(legEnd.getTime() + bufferMs) },
    end: { $gte: new Date(legStart.getTime() - bufferMs) },
  }).sort({ start: -1 });
};

export const receiveCdr = async (
  models: IModels,
  subdomain,
  params,
  verifiedIntegration?: any,
) => {
  debugCall(`Request to get post data with: ${JSON.stringify(params)}`);
  const integration =
    verifiedIntegration ||
    (await models.CallIntegrations.findOne({
      $or: [
        { srcTrunk: params.src_trunk_name },
        { dstTrunk: params.dst_trunk_name },
      ],
    }));
  if (!integration) return;

  if (params.uniqueid) {
    const lockKey = `${subdomain}:call:session:${params.uniqueid}`;
    let lock;
    try {
      lock = await redlock.acquire([lockKey], CDR_LOCK_TTL_MS);
    } catch (e) {
      throw new Error(
        `receiveCdr lock failure for ${params.uniqueid}: ${e.message}`,
      );
    }

    const customerLock = await acquireCustomerLock(
      subdomain,
      integration.inboxId,
      determinePrimaryPhone(params),
    );

    try {
      return await processCdrLocked(models, subdomain, params, integration);
    } finally {
      for (const held of [customerLock, lock]) {
        try {
          await held?.release();
        } catch (e) {
          console.error('receiveCdr: lock release failed', e);
        }
      }
    }
  }

  return processCdrLocked(models, subdomain, params, integration);
};

const processCdrLocked = async (
  models: IModels,
  subdomain: string,
  params: any,
  integration: any,
) => {
  const inboxId = integration.inboxId;

  const primaryPhone = determinePrimaryPhone(params);

  const customer = await getOrCreateCustomer(models, subdomain, {
    primaryPhone,
    inboxIntegrationId: inboxId,
  });

  const { operator: matchedOperator, extension: operatorExtension } =
    resolveCdrOperator(integration.operators, params);
  const operatorUserId = matchedOperator?.userId;

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

  let conversationId: string | undefined;
  let isNewConversation = false;

  let existingSession: ICallSessionDocument | null = null;
  if (params.uniqueid) {
    const sessionSelectors: any[] = [
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
      inboxIntegrationId: inboxId,
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
    integrationId: inboxId,
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

  if (existingSession && !existingSession.conversationId) {
    await models.CallSessions.updateOne(
      { _id: existingSession._id },
      {
        $set: {
          conversationId,
          ...(customer?.erxesApiId ? { customerId: customer.erxesApiId } : {}),
        },
      },
    );
    existingSession.conversationId = conversationId;
  }

  const { cdr, created } = await findOrCreateCdr(
    models,
    subdomain,
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
          inboxIntegrationId: inboxId,
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
      if (updatedSession) {
        const sessionPayload = {
          callSessionUpdated: {
            ...updatedSession.toObject(),
            inboxIntegrationId: inboxId,
            subdomain,
          },
        };
        await graphqlPubsub.publish(
          `callSessionUpdated:uniqueid:${sessionUniqueid}`,
          sessionPayload,
        );
      }
    } catch (e) {
      debugCall(
        `CallSession finalize failed for ${sessionUniqueid}: ${e.message}`,
      );
    }
  }

  return 'success';
};
