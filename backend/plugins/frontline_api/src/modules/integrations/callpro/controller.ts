import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import {
  debugCallPro,
  debugCallProError,
} from '@/integrations/callpro/debuggers';
import { ICallProCustomerDocument } from '@/integrations/callpro/@types/customers';
import { ICallProConversationDocument } from '@/integrations/callpro/@types/conversations';

export interface ICallProEvent {
  numberTo: string;
  numberFrom: string;
  disp: string;
  callID: string;
  owner?: string;
}

const isDuplicateError = (error: Error) =>
  (error.message || '').includes('duplicate');

const logEvent = async (models: IModels, body: ICallProEvent) => {
  try {
    await models.CallProLogs.create({
      type: 'call-pro',
      value: body,
      specialValue: body.numberFrom || '',
      createdAt: new Date(),
    });
  } catch (e) {
    debugCallProError('Failed creating Call Pro log', e.message);
    throw new Error(`Failed creating call pro log. Error: ${e.message}`);
  }
};

const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  { integrationId, inboxIntegrationId, phoneNumber },
): Promise<ICallProCustomerDocument> => {
  const existing = await models.CallProCustomers.findOne({ phoneNumber });

  if (existing) {
    return existing;
  }

  let customer: ICallProCustomerDocument;

  try {
    customer = await models.CallProCustomers.create({
      phoneNumber,
      integrationId,
    });
  } catch (e) {
    throw new Error(
      isDuplicateError(e)
        ? 'Concurrent request: customer duplication'
        : e.message,
    );
  }

  try {
    const response = await receiveInboxMessage(subdomain, {
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        integrationId: inboxIntegrationId,
        primaryPhone: phoneNumber,
        isUser: true,
        phones: [{ phone: phoneNumber, type: 'other' }],
      }),
    });

    if (response.status !== 'success') {
      throw new Error(`Customer creation failed: ${response.errorMessage}`);
    }

    customer.erxesApiId = response.data._id;
    await customer.save();
  } catch (e) {
    await models.CallProCustomers.deleteOne({ _id: customer._id });
    debugCallProError('Failed to create or update customer on core', e.message);
    throw new Error(e.message);
  }

  return customer;
};

const getOrCreateConversation = async (
  models: IModels,
  { callId, integrationId, numberTo, numberFrom, disp },
): Promise<ICallProConversationDocument> => {
  const existing = await models.CallProConversations.findOne({ callId });

  if (existing) {
    return existing;
  }

  try {
    return await models.CallProConversations.create({
      state: disp,
      callId,
      senderPhoneNumber: numberTo,
      recipientPhoneNumber: numberFrom,
      integrationId,
    });
  } catch (e) {
    throw new Error(
      isDuplicateError(e)
        ? 'Concurrent request: conversation duplication'
        : e.message,
    );
  }
};

const findCustomerIdsByPhone = async (
  subdomain: string,
  phone: string,
): Promise<string[]> => {
  try {
    const customers = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'find',
      input: {
        query: {
          status: { $ne: 'deleted' },
          $or: [{ primaryPhone: phone }, { 'phones.phone': { $in: [phone] } }],
        },
      },
      defaultValue: [],
    });

    return (customers || []).map((customer: { _id: string }) =>
      customer._id.toString(),
    );
  } catch (e) {
    debugCallProError('Failed checking customers by phone', e.message);
    return [];
  }
};

export const receiveCallProEvent = async (
  subdomain: string,
  body: ICallProEvent,
) => {
  const models = await generateModels(subdomain);
  const { numberTo, numberFrom, disp, callID, owner } = body;

  await logEvent(models, body);

  const integration = await models.CallProIntegrations.findOne({
    phoneNumber: numberTo,
  }).lean();

  if (!integration) {
    debugCallPro(`Integration not found with: ${numberTo}`);
    throw new Error(`Integration phoneNumber=${numberTo} not found`);
  }

  const inboxIntegration = await models.Integrations.findOne({
    _id: integration.inboxId,
  }).lean();

  if (!inboxIntegration) {
    throw new Error(`Inbox integration not found: ${integration.inboxId}`);
  }

  const customer = await getOrCreateCustomer(models, subdomain, {
    integrationId: integration._id,
    inboxIntegrationId: inboxIntegration._id,
    phoneNumber: numberFrom,
  });

  const conversation = await getOrCreateConversation(models, {
    callId: callID,
    integrationId: integration._id,
    numberTo,
    numberFrom,
    disp,
  });

  if (conversation.state !== disp) {
    await models.CallProConversations.updateOne(
      { callId: callID },
      { $set: { state: disp } },
    );

    const response = await receiveInboxMessage(subdomain, {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        content: disp,
        conversationId: conversation.erxesApiId,
        integrationId: inboxIntegration._id,
        owner,
      }),
    });

    if (response.status !== 'success') {
      throw new Error(`Conversation update failed: ${response.errorMessage}`);
    }

    return;
  }

  const potentialCustomerIds = await findCustomerIdsByPhone(
    subdomain,
    numberFrom,
  );
  const hasMultipleCustomers = potentialCustomerIds.length > 1;

  try {
    const payload: Record<string, unknown> = {
      content: disp,
      integrationId: inboxIntegration._id,
      owner,
    };

    if (hasMultipleCustomers) {
      payload.callProPotentialCustomerIds = potentialCustomerIds;
      payload.callProPhone = numberFrom;
    } else {
      payload.customerId = customer.erxesApiId;
    }

    const response = await receiveInboxMessage(subdomain, {
      action: 'create-or-update-conversation',
      payload: JSON.stringify(payload),
    });

    if (response.status !== 'success') {
      throw new Error(`Conversation creation failed: ${response.errorMessage}`);
    }

    conversation.erxesApiId = response.data._id;
    await conversation.save();
  } catch (e) {
    await models.CallProConversations.deleteOne({ _id: conversation._id });
    debugCallProError(
      'Failed to create or update conversation on inbox',
      e.message,
    );
    throw new Error(e.message);
  }

  await notifyChannelMembers(models, subdomain, {
    conversation,
    inboxIntegration,
    content: disp,
    customerId: hasMultipleCustomers ? undefined : customer.erxesApiId,
  });
};

const notifyChannelMembers = async (
  models: IModels,
  subdomain: string,
  { conversation, inboxIntegration, content, customerId },
) => {
  const members = await models.ChannelMembers.find(
    { channelId: inboxIntegration.channelId },
    { memberId: 1 },
  ).lean();

  const payload = {
    conversationClientMessageInserted: {
      _id: conversation._id,
      content,
      createdAt: new Date(),
      customerId,
      conversationId: conversation.erxesApiId,
    },
    subdomain,
    conversation,
    integration: inboxIntegration,
  };

  for (const { memberId } of members) {
    await graphqlPubsub.publish(
      `conversationClientMessageInserted:${subdomain}:${memberId}`,
      payload,
    );
  }
};
