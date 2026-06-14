import { IModels } from '~/connectionResolvers';
import { sendTRPCMessage, graphqlPubsub } from 'erxes-api-shared/utils';
import { debugCall } from '@/integrations/call/debuggers';
import {
  determineExtension,
  determinePrimaryPhone,
  extractOperatorId,
  findOrCreateCdr,
  getConversationContent,
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

  const inboxId = integration.inboxId;

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
  const extension = determineExtension(params);

  const customer = await getOrCreateCustomer(models, subdomain, {
    primaryPhone,
    inboxIntegrationId: inboxId,
  });

  const content = await getConversationContent(models, params);

  let operatorPhone = '';
  const operatorId = extractOperatorId(params);

  let matchedOperator: any = null;
  if (operatorId) {
    matchedOperator = integration.operators.find(
      ({ gsUsername }) => gsUsername === operatorId,
    );
    if (matchedOperator) {
      const operator = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'findOne',
        input: { query: { _id: matchedOperator.userId } },
      });

      if (operator) {
        operatorPhone = operator?.details?.operatorPhone || '';
      }
    }
  }

  let conversationId;

  let existingSession: any = null;
  if (params.uniqueid) {
    existingSession = await models.CallSessions.findOne({
      $or: [{ uniqueid: params.uniqueid }, { linkedid: params.uniqueid }],
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
        owner: operatorPhone || '',
        integrationId: inboxId,
      };
      if (customer) payload.customerId = customer?.erxesApiId;
      await createOrUpdateErxesConversation(subdomain, payload);
    }
  }

  const existingCdr = await models.CallCdrs.findOne({
    uniqueid: params.uniqueid,
    conversationId: { $exists: true, $ne: '' },
    inboxIntegrationId: inboxId,
  }).sort({ createdAt: 1 });

  let followmeCdr: any = null;
  if (!existingCdr && params.action_type?.includes('FOLLOWME')) {
    const [datePart, timePart] = params.start.split(' ');
    const cdrStart = new Date(`${datePart}T${timePart}+08:00`);
    const fmRangeStart = new Date(cdrStart.getTime() - 300 * 1000);
    const fmRangeEnd = new Date(cdrStart.getTime() + 300 * 1000);

    followmeCdr = await models.CallCdrs.findOne({
      $or: [{ src: primaryPhone }, { dst: primaryPhone }],
      conversationId: { $exists: true, $ne: '' },
      inboxIntegrationId: inboxId,
      createdAt: { $gte: fmRangeStart, $lte: fmRangeEnd },
    }).sort({ createdAt: -1 });

    if (followmeCdr) {
      debugCall(
        `FOLLOWME merge: reusing conversation ${followmeCdr.conversationId} ` +
          `from CDR ${followmeCdr._id} for phone=${primaryPhone}`,
      );
    }
  }

  if (conversationId) {
  } else if (existingCdr || followmeCdr) {
    conversationId = existingCdr?.conversationId || followmeCdr?.conversationId;
    const payload = {
      conversationId,
      content: content,
      updatedAt: new Date(),
      owner: operatorPhone || '',
      integrationId: inboxId,
    } as any;
    if (customer) {
      payload.customerId = customer?.erxesApiId;
    }
    await createOrUpdateErxesConversation(subdomain, payload);
  } else {
    const [datePart, timePart] = params.start.split(' ');
    const localTimeString = `${datePart}T${timePart}+08:00`;
    const localStart = new Date(localTimeString);
    const startDate = new Date(localStart.getTime());
    const rangeSeconds = extension ? 60 : 30;
    const startTime = new Date(startDate.getTime() - rangeSeconds * 1000);
    const endTime = new Date(startDate.getTime() + rangeSeconds * 1000);

    const baseSelector: Record<string, any> = {
      customerPhone: primaryPhone,
      createdAt: { $gte: startTime, $lte: endTime },
    };

    let callHistory: any = null;
    if (extension) {
      callHistory = await models.CallHistory.findOne({
        ...baseSelector,
        extensionNumber: extension,
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!callHistory) {
      callHistory = await models.CallHistory.findOne(baseSelector)
        .sort({ createdAt: -1 })
        .lean();
    }

    debugCall(
      `CDR match: phone=${primaryPhone}, ext=${extension}, ` +
        `range=${startTime.toISOString()}~${endTime.toISOString()}, ` +
        `found=${!!callHistory}, historyId=${callHistory?._id || 'none'}`,
    );

    let resolvedConversationId = callHistory?.conversationId || '';

    if (!resolvedConversationId) {
      const fiveMinAgo = new Date(startDate.getTime() - 300 * 1000);

      const recentCdr = await models.CallCdrs.findOne({
        $or: [{ src: primaryPhone }, { dst: primaryPhone }],
        conversationId: { $exists: true, $ne: '' },
        inboxIntegrationId: inboxId,
        createdAt: { $gte: fiveMinAgo },
      }).sort({ createdAt: -1 });

      if (recentCdr) {
        resolvedConversationId = recentCdr.conversationId;
        debugCall(
          `Reusing recent conversation ${resolvedConversationId} ` +
            `for repeated call from phone=${primaryPhone}`,
        );
      }
    }

    const erxesPayload = {
      customerId: customer?.erxesApiId,
      integrationId: inboxId,
      content: content,
      conversationId: resolvedConversationId,
      updatedAt: new Date(),
      owner: operatorPhone || '',
    };

    const newErxesConversation = await createOrUpdateErxesConversation(
      subdomain,
      erxesPayload,
    );

    if (newErxesConversation.status === 'success') {
      conversationId = newErxesConversation?.data._id;
    }
  }

  if (!conversationId) {
    throw new Error('Failed to find or create a conversation ID.');
  }

  const cdr = await findOrCreateCdr(
    models,
    subdomain,
    params,
    inboxId,
    conversationId,
  );

  const doc = {
    ...cdr.toObject(),
    conversationId: cdr.conversationId,
  };
  await pConversationClientMessageInserted(subdomain, doc);

  if (params.uniqueid) {
    const sessionUniqueid = existingSession?.uniqueid || params.uniqueid;
    try {
      if (!existingSession) {
        const direction =
          params.userfield === 'Outbound' ? 'outgoing' : 'incoming';
        let startedAt: Date | undefined;
        if (params.start) {
          const [sd, st] = params.start.split(' ');
          startedAt = new Date(`${sd}T${st}+08:00`);
        }

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

        const candidateExtensions = [
          extension,
          matchedOperator?.gsUsername,
          params.dstchannel_ext,
          params.channel_ext,
          params.dstanswer,
          params.new_src,
          params.userfield === 'Outbound' ? params.src : params.dst,
        ].filter(Boolean);

        let opForExt: any = null;
        let operatorExtension: string | undefined;
        for (const candidate of candidateExtensions) {
          const op = integration.operators.find(
            (o: any) => o.gsUsername === candidate,
          );
          if (op) {
            opForExt = op;
            operatorExtension = candidate;
            break;
          }
        }
        if (!operatorExtension) {
          operatorExtension = extension || matchedOperator?.gsUsername;
        }

        if (operatorExtension) {
          const operatorUserId = opForExt?.userId || matchedOperator?.userId;
          const answered =
            (params.disposition || '').toUpperCase() === 'ANSWERED' &&
            Number(params.billsec) > 0;

          if (answered) {
            await models.CallSessions.markAnswered(
              sessionUniqueid,
              operatorExtension,
              operatorUserId,
            );
          } else {
            await models.CallSessions.attachOperator(sessionUniqueid, {
              extensionNumber: operatorExtension,
              userId: operatorUserId,
              state: 'noanswer',
            });
          }
        }
      }

      const endedAt = params.end
        ? (() => {
            const [d, t] = params.end.split(' ');
            return new Date(`${d}T${t}+08:00`);
          })()
        : new Date();

      await models.CallSessions.markEnded(sessionUniqueid, {
        endedAt,
        durationSec: Number(params.billsec || params.duration) || undefined,
        hangupCause: params.disposition,
        disposition: params.disposition,
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
