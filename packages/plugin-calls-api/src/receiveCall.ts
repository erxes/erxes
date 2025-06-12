import { IModels } from './connectionResolver';
import { findErxesOperator, sendErxesMessage } from './services/apiClient';
import { findOrCreateCdr } from './services/cdrService';
import { createOrUpdateErxesConversation } from './services/conversationService';
import { findOrCreateCustomer } from './services/customerService';
import {
  determineExtension,
  determinePrimaryPhone,
  extractOperatorId,
  getConversationContent,
} from './utils';

const receiveCall = async (models: IModels, subdomain, params) => {
  const integration = await models.Integrations.findOne({
    $or: [
      { srcTrunk: params.src_trunk_name },
      { dstTrunk: params.dst_trunk_name },
    ],
  });
  if (!integration) throw new Error('Integration not found');

  const inboxId = integration.inboxId;

  const primaryPhone = determinePrimaryPhone(params);
  const extension = determineExtension(params);

  const customer = await findOrCreateCustomer(
    models,
    subdomain,
    primaryPhone,
    inboxId,
  );

  const content = await getConversationContent(models, params);

  let operatorPhone = '';
  const operatorId = extractOperatorId(params);

  if (operatorId) {
    const matchedOperator = integration.operators.find(
      ({ gsUsername }) => gsUsername === operatorId,
    );
    if (matchedOperator) {
      const operator = await findErxesOperator(
        subdomain,
        matchedOperator.userId,
      );
      operatorPhone = operator?.details?.operatorPhone || '';
    }
  }

  let conversationId;

  const existingCdr = await models.Cdrs.findOne({
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
    });
  } else {
    const startDate = new Date(params.start);

    const oneMinuteBefore = new Date(startDate.getTime() - 60 * 1000);
    const oneMinuteAfter = new Date(startDate.getTime() + 60 * 1000);

    let historySelector = {
      customerPhone: primaryPhone,
      createdAt: { $gte: oneMinuteBefore, $lte: oneMinuteAfter },
    } as any;
    if (extension) {
      historySelector.extentionNumber = extension;
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

    const newErxesConversation = await createOrUpdateErxesConversation(
      subdomain,
      erxesPayload,
    );
    conversationId = newErxesConversation._id;
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

  // await sendErxesMessage(subdomain, {
  //   ...cdr.toObject(),
  //   content: content,
  //   conversationId: cdr.conversationId,
  // });

  return 'success';
};

export default receiveCall;
