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
import { redlock } from '@/integrations/call/redlock';

const CDR_LOCK_TTL_MS = 20_000;

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
    try {
      return await processCdrLocked(models, subdomain, params, integration);
    } finally {
      try {
        await lock?.release();
      } catch (e) {
        console.error('receiveCdr: lock release failed', e);
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

  const content = await getConversationContent(models, params);

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

  let conversationId;
  let isNewConversation = false;

  let existingSession: any = null;
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
      const payload: any = {
        conversationId,
        content,
        updatedAt: new Date(),
        owner: ownerForConversation,
        userId: assignedUserId,
        integrationId: inboxId,
      };
      if (customer) payload.customerId = customer?.erxesApiId;
      await createOrUpdateErxesConversation(subdomain, payload);
    }
  }

  const cdrUniqueids = [params.uniqueid, params.linkedid].filter(Boolean);
  const existingCdr = await models.CallCdrs.findOne({
    uniqueid: { $in: cdrUniqueids },
    conversationId: { $exists: true, $ne: '' },
    inboxIntegrationId: inboxId,
  }).sort({ createdAt: 1 });

  let followmeCdr: any = null;
  if (!existingCdr) {
    const isFollowmeLeg = !!params.action_type?.includes('FOLLOWME');
    const legStart = parseCdrDate(params.start) || null;
    const legEnd = parseCdrDate(params.end) || legStart;

    const shouldCheck = isFollowmeLeg || params.userfield !== 'Outbound';

    if (shouldCheck && legStart && !isNaN(legStart.getTime()) && legEnd) {
      const bufferMs = 60 * 1000;
      const overlapSelector: Record<string, any> = {
        $or: [{ src: primaryPhone }, { dst: primaryPhone }],
        conversationId: { $exists: true, $ne: '' },
        inboxIntegrationId: inboxId,
        start: { $lte: new Date(legEnd.getTime() + bufferMs) },
        end: { $gte: new Date(legStart.getTime() - bufferMs) },
      };
      if (!isFollowmeLeg) {
        overlapSelector.actionType = { $regex: 'FOLLOWME' };
      }

      followmeCdr = await models.CallCdrs.findOne(overlapSelector).sort({
        start: -1,
      });

      if (followmeCdr) {
        debugCall(
          `FOLLOWME merge: reusing conversation ${followmeCdr.conversationId} ` +
            `from overlapping CDR ${followmeCdr._id} for phone=${primaryPhone}`,
        );
      }
    }
  }

  if (conversationId) {
    debugCall(
      `CDR reused conversation ${conversationId} from the matched CallSession`,
    );
  } else if (existingCdr || followmeCdr) {
    conversationId = existingCdr?.conversationId || followmeCdr?.conversationId;
    const payload = {
      conversationId,
      content: content,
      updatedAt: new Date(),
      owner: ownerForConversation,
      userId: assignedUserId,
      integrationId: inboxId,
    } as any;
    if (customer) {
      payload.customerId = customer?.erxesApiId;
    }
    await createOrUpdateErxesConversation(subdomain, payload);
  } else {
    const erxesPayload = {
      customerId: customer?.erxesApiId,
      integrationId: inboxId,
      content: content,
      conversationId: '',
      updatedAt: new Date(),
      owner: ownerForConversation,
      userId: assignedUserId,
    };

    const newErxesConversation = await createOrUpdateErxesConversation(
      subdomain,
      erxesPayload,
    );

    if (newErxesConversation.status === 'success') {
      conversationId = newErxesConversation?.data._id;
      isNewConversation = true;
    }
  }

  if (!conversationId) {
    throw new Error('Failed to find or create a conversation ID.');
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
