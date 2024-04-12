import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';

const receiveCall = async (
  models: IModels,
  subdomain: string,
  params,
  user,
  docModifier,
) => {
  const integration = await models.Integrations.findOne({
    inboxId: params.inboxIntegrationId,
  }).lean();

  const inboxIntegration = await sendInboxMessage({
    subdomain,
    action: 'integrations.findOne',
    data: { _id: integration?.inboxId },
    isRPC: true,
    defaultValue: null,
  });

  if (!integration) {
    throw new Error('Integration not found');
  }
  const operator = integration.operators.find(
    (operator) => operator.userId === user?._id,
  );
  params.recipientId = integration.phone;
  params.extentionNumber = operator?.gsUsername || '';
  const { primaryPhone, direction, extentionNumber } = params;

  let customer = await models.Customers.findOne({
    primaryPhone,
    status: 'completed',
  });

  let history;
  try {
    // sessionId: callID,
    // callerNumber: primaryPhone,
    // receiverNumber: recipientId,
    // callType: direction,
    // createdAt: new Date(),
    // createdBy: user._id,
    // updatedBy: user._id,
    // callDuration: 0,
    // extentionNumber,
    // conversationId: '',
    history = new models.CallHistory({
      ...docModifier({ ...params }),
      createdAt: new Date(),
      createdBy: user._id,
      updatedBy: user._id,
      callDuration: 0,
      extentionNumber,
    });

    try {
      await history.save();
    } catch (error) {
      await models.CallHistory.deleteOne({ _id: history._id });
      console.error('Error saving call history:', error);
    }
  } catch (e) {
    throw new Error(
      e.message.includes('duplicate')
        ? 'Concurrent request: call history duplication'
        : e,
    );
  }

  //save on api
  try {
    const apiConversationResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer?.erxesApiId,
          integrationId: integration.inboxId,
          content: direction || '',
          conversationId: history.conversationId,
          updatedAt: new Date(),
        }),
      },
      isRPC: true,
    });

    history.conversationId = apiConversationResponse._id;

    await history.save();
  } catch (e) {
    await models.CallHistory.deleteOne({ _id: history._id });
    throw new Error(e);
  }

  const channels = await sendInboxMessage({
    subdomain,
    action: 'channels.find',
    data: {
      integrationIds: { $in: [inboxIntegration._id] },
    },
    isRPC: true,
  });

  for (const channel of channels) {
    for (const userId of channel.memberIds || []) {
      graphqlPubsub.publish(
        `conversationClientMessageInserted:${subdomain}:${userId}`,
        {
          conversationClientMessageInserted: {
            _id: Math.random().toString(),
            content: 'new grandstream message',
            createdAt: new Date(),
            customerId: customer?.erxesApiId,
            conversationId: history.conversationId,
          },
          integration: inboxIntegration,
        },
      );
    }
  }

  return history;
};

export default receiveCall;
