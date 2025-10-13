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

  if (existingCdr) {
    conversationId = existingCdr.conversationId;
    await createOrUpdateErxesConversation(subdomain, {
      conversationId,
      content: content,
      updatedAt: new Date(),
      owner: operatorPhone || '',
      integrationId: inboxId,
    });
  } else {
    const startDate = new Date(params.start);

    const startTime = new Date(startDate.getTime() - 30 * 1000);
    const endTime = new Date(startDate.getTime() + 30 * 1000);

    const historySelector = {
      customerPhone: primaryPhone,
      createdAt: { $gte: startTime, $lte: endTime },
    } as any;
    if (extension) {
      historySelector.extensionNumber = extension;
    }

    const callHistory = await models.CallHistory.findOne({
      ...historySelector,
    }).sort({ createdAt: -1 });

    const erxesPayload = {
      customerId: customer?.erxesApiId,
      integrationId: inboxId,
      content: content,
      conversationId: callHistory?.conversationId || '',
      updatedAt: new Date(),
      owner: operatorPhone || '',
    };
    const payload = JSON.stringify(erxesPayload);

    const newErxesConversation = await createOrUpdateErxesConversation(
      subdomain,
      payload,
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
