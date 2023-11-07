import { graphqlPubsub } from './configs';
import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';
import { ICustomer } from './models/definitions/customers';
import { getOrCreateCustomer } from './store';

const receiveCall = async (models: IModels, subdomain: string, params) => {
  const integration = await models.Integrations.findOne({
    inboxId: params.inboxIntegrationId
  }).lean();

  const inboxIntegration = await sendInboxMessage({
    subdomain,
    action: 'integrations.findOne',
    data: { _id: integration.inboxId },
    isRPC: true,
    defaultValue: null
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  params.recipientId = integration.phone;
  const {
    inboxIntegrationId,
    primaryPhone,
    recipientId,
    direction,
    callID
  } = params;

  const customer = await getOrCreateCustomer(models, subdomain, params);

  // get conversation
  let conversation = await models.Conversations.findOne({ callId: callID });

  if (!conversation) {
    try {
      conversation = await models.Conversations.create({
        callId: callID,
        senderPhoneNumber: primaryPhone,
        recipientPhoneNumber: recipientId,
        integrationId: inboxIntegrationId
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation duplication'
          : e
      );
    }
  }

  // save on api
  try {
    const apiConversationResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer.erxesApiId,
          integrationId: integration.inboxId,
          content: direction || '',
          conversationId: conversation.erxesApiId,
          updatedAt: new Date(),
          owner: recipientId
        })
      },
      isRPC: true
    });

    conversation.erxesApiId = apiConversationResponse._id;

    await conversation.save();
  } catch (e) {
    await models.Conversations.deleteOne({ _id: conversation._id });
    throw new Error(e);
  }

  let channelMemberIds: string[] = [];

  const channels = await sendInboxMessage({
    subdomain,
    action: 'channels.find',
    data: {
      integrationIds: { $in: [inboxIntegration._id] }
    },
    isRPC: true
  });

  for (const channel of channels) {
    channelMemberIds = [...channelMemberIds, ...(channel.memberIds || [])];
  }

  graphqlPubsub.publish('conversationClientMessageInserted', {
    conversationClientMessageInserted: {
      _id: Math.random().toString(),
      content: 'new grandstream message',
      createdAt: new Date(),
      customerId: customer.erxesApiId,
      conversationId: conversation.erxesApiId
    },
    conversation,
    integration: inboxIntegration,
    channelMemberIds
  });

  return customer;
};

export default receiveCall;
