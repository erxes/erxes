import { IModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
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

export const receiveCdr = async (models: IModels, subdomain, params) => {
  debugCall(`Request to get post data with: ${JSON.stringify(params)}`);
  // console.log(params.src, params.dst, 'received cdr phone number');
  const integration = await models.CallIntegrations.findOne({
    $or: [
      { srcTrunk: params.src_trunk_name },
      { dstTrunk: params.dst_trunk_name },
    ],
  });
  if (!integration) return;

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

  if (operatorId) {
    const matchedOperator = integration.operators.find(
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

  if (existingCdr || followmeCdr) {
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
    const rangeSeconds = 180;
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

  return 'success';
};
