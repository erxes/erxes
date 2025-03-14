import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';
import { getOrCreateCustomer } from './store';

const receiveCall = async (
  models: IModels,
  subdomain: string,
  params,
  user,
) => {
  const { callerNumber, callerEmail, audioTrack, integrationId, departmentId } =
    params;

  const integration = await models.Integrations.findOne({
    erxesApiId: integrationId,
  }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }

  let customer = await models.Customers.findOne({
    primaryPhone: callerNumber,
  });

  const oldHistory = await models.CallHistory.findOne({
    audioTrack,
  });
  if (oldHistory) {
    throw new Error('History already created');
  }
  let history;
  try {
    const historyData: any = {
      createdAt: new Date(),
      createdBy: user?._id,
      updatedBy: user?._id,
      customerPhone: callerNumber,
      customerEmail: callerEmail,
      customerAudioTrack: audioTrack,
      callStatus: 'ringing',
      callDuration: 0,
      departmentId,
    };

    history = new models.CallHistory(historyData);

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
    customer = await getOrCreateCustomer(models, subdomain, {
      inboxIntegrationId: integrationId,
      primaryPhone: params.callerNumber,
      email: params.callerEmail,
    });
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
          integrationId: integrationId,
          content: 'cloudflare call',
          conversationId: history.conversationId,
          updatedAt: new Date(),
          //   owner: type === 'addHistory' ? user?.details?.operatorPhone : '',
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

export default receiveCall;
