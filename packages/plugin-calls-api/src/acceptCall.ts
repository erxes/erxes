import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';
import { getOrCreateCustomer } from './store';

const acceptCall = async (
  models: IModels,
  subdomain: string,
  params,
  user,
  type?: string,
) => {
  const integration = await models.Integrations.findOne({
    inboxId: params.inboxIntegrationId,
  }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }
  const operator = integration.operators.find(
    (operator) => operator.userId === user?._id,
  );
  params.operatorPhone = integration.phone;
  params.extentionNumber = operator?.gsUsername || '';
  const {
    extentionNumber,
    operatorPhone,
    customerPhone,
    callStartTime,
    callType,
    callStatus,
    sessionId,
    inboxIntegrationId,
  } = params;

  let customer = await models.Customers.findOne({
    primaryPhone: customerPhone,
  });

  let history;
  try {
    history = new models.CallHistory({
      operatorPhone,
      customerPhone,
      callStartTime,
      callType,
      callStatus,
      sessionId,
      inboxIntegrationId,
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
  if (!customer || !customer.erxesApiId) {
    customer = await getOrCreateCustomer(models, subdomain, customerPhone);
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
          content: params.callType || '',
          conversationId: history.conversationId,
          updatedAt: new Date(),
          owner: type === 'addHistory' ? user?.details?.operatorPhone : '',
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

  await sendInboxMessage({
    subdomain,
    action: 'conversationClientMessageInserted',
    data: {
      ...history?.toObject(),
      conversationId: history.conversationId,
    },
  });

  return history;
};

export default acceptCall;
