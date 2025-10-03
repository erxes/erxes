import { IModels } from '~/connectionResolvers';
import { getOrCreateCustomer } from './store';
import { createOrUpdateErxesConversation, findIntegration } from './utils';
import { graphqlPubsub } from 'erxes-api-shared/utils';

const acceptCall = async (
  models: IModels,
  subdomain: string,
  params,
  user,
  type?: string,
) => {
  const integration = await findIntegration(subdomain, params);

  const operator = integration.operators?.find(
    (operator) => operator.userId === user?._id,
  );

  params.operatorPhone = integration.phone;
  params.extensionNumber = operator?.gsUsername || '';
  const {
    extensionNumber,
    operatorPhone,
    customerPhone,
    callStartTime,
    callType,
    callStatus,
    timeStamp,
    queueName,
  } = params;

  let queue = queueName as any;
  if (queueName === '') {
    queue = null; // or set a default value
  }

  let customer = await models.CallCustomers.findOne({
    primaryPhone: customerPhone,
  });
  console.log('1:', customer, 'customerPhone:', customerPhone);
  let history;
  try {
    const historyData: any = {
      operatorPhone,
      customerPhone,
      callStartTime,
      callType,
      callStatus,
      inboxIntegrationId: integration.inboxId,
      createdAt: new Date(),
      createdBy: user?._id,
      updatedBy: user?._id,
      callDuration: 0,
      extensionNumber: extensionNumber || null,
      queueName: queue,
      timeStamp,
    };

    if (timeStamp === 0) {
      historyData.timeStamp = Date.now().toString();
    }

    history = new models.CallHistory(historyData);

    try {
      await models.CallHistory.deleteMany({
        timeStamp,
        callStatus: { $eq: 'cancelled' },
      });

      await history?.save();
    } catch (error) {
      console.log('error saving call history', error);
      await models.CallHistory.deleteOne({ _id: history?._id });
      console.error('Error saving call history:', error.message);
    }
  } catch (e) {
    throw new Error(
      e.message.includes('duplicate')
        ? 'Concurrent request: call history duplication'
        : e.message,
    );
  }
  if (!customer || !customer.erxesApiId) {
    customer = await getOrCreateCustomer(models, subdomain, {
      inboxIntegrationId: integration.inboxId,
      primaryPhone: params.customerPhone,
    });
    console.log('customer1:', customer);
  }

  try {
    const payload = JSON.stringify({
      customerId: customer?.erxesApiId,
      integrationId: integration.inboxId,
      content: params.callType || '',
      conversationId: history.conversationId,
      updatedAt: new Date(),
      owner: type === 'addHistory' ? user?.details?.operatorPhone : '',
    });

    const apiConversationResponse = await createOrUpdateErxesConversation(
      subdomain,
      payload,
    );

    if (apiConversationResponse.status === 'success') {
      history.conversationId = apiConversationResponse.data?._id;

      try {
        await history.save();
      } catch (e) {
        console.error('Save error:', e);
      }
    } else {
      throw new Error(
        `Conversation creation failed: ${JSON.stringify(
          apiConversationResponse,
        )}`,
      );
    }
  } catch (e) {
    await models.CallHistory.deleteCallHistory(history._id?.toString(), user);
    throw new Error(e);
  }

  await graphqlPubsub.publish(
    `conversationMessageInserted:${history.conversationId}`,
    {
      conversationMessageInserted: {
        ...history.toObject(),
        conversationId: history.conversationId,
      },
    },
  );

  return history;
};

export default acceptCall;
