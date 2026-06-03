import { IModels } from '~/connectionResolvers';
import { getOrCreateCustomer } from './store';
import { createOrUpdateErxesConversation, findIntegration } from './utils';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { redlock } from '@/integrations/call/redlock';

const ACCEPT_LOCK_TTL_MS = 30_000;

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
    uniqueid,
  } = params;

  let queue = queueName as any;
  if (queueName === '') {
    queue = null;
  }

  const lockKey = uniqueid
    ? `${subdomain}:call:session:${uniqueid}`
    : `${subdomain}:call:history:${timeStamp || Date.now()}:${extensionNumber}`;

  let lock;
  try {
    lock = await redlock.acquire([lockKey], ACCEPT_LOCK_TTL_MS);
  } catch (e) {
    throw new Error(
      `Could not acquire lock for call (uniqueid=${uniqueid || 'n/a'}, ts=${timeStamp}): ${e.message}`,
    );
  }

  try {
    if (uniqueid) {
      const existing = await models.CallHistory.findOne({
        uniqueid,
        extensionNumber,
      });
      if (existing) {
        return existing;
      }
    }

    let customer = await models.CallCustomers.findOne({
      primaryPhone: customerPhone,
    });

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
        uniqueid: uniqueid || undefined,
      };

      if (timeStamp === 0) {
        historyData.timeStamp = Date.now().toString();
      }

      history = new models.CallHistory(historyData);

      await models.CallHistory.deleteMany({
        timeStamp,
        callStatus: { $eq: 'cancelled' },
        extensionNumber: extensionNumber || null,
      });

      await history.save();
    } catch (e) {
      if (e?.message?.includes('duplicate')) {
        const existing = await models.CallHistory.findOne({
          uniqueid,
          extensionNumber,
        });
        if (existing) return existing;
        throw new Error('Concurrent request: call history duplication');
      }
      try {
        if (history?._id)
          await models.CallHistory.deleteOne({ _id: history._id });
      } catch {}
      throw e;
    }

    if (!customer?.erxesApiId) {
      customer = await getOrCreateCustomer(models, subdomain, {
        inboxIntegrationId: integration.inboxId,
        primaryPhone: params.customerPhone,
      });
    }

    let existingConversationId: string | undefined;
    if (uniqueid) {
      const session = await models.CallSessions.findOne({ uniqueid });
      if (session?.conversationId) {
        existingConversationId = session.conversationId;
      }
    }

    try {
      const payload = JSON.stringify({
        customerId: customer?.erxesApiId,
        integrationId: integration.inboxId,
        content: params.callType || '',
        conversationId: existingConversationId || history.conversationId,
        updatedAt: new Date(),
        owner: type === 'addHistory' ? user?.details?.operatorPhone : '',
        userId: type === 'addHistory' ? user?._id : undefined,
      });

      const apiConversationResponse = await createOrUpdateErxesConversation(
        subdomain,
        payload,
      );

      if (apiConversationResponse.status === 'success') {
        history.conversationId = apiConversationResponse.data?._id;
        await history.save();

        if (uniqueid && history.conversationId) {
          await models.CallSessions.updateOne(
            { uniqueid },
            {
              $set: {
                conversationId: history.conversationId,
                customerId: customer?.erxesApiId,
                answeredBy: user?._id,
                answeredExtension: extensionNumber,
                answeredAt: new Date(),
                status: 'active',
              },
            },
          );
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

    const historyMessage = {
      ...history.toObject(),
      conversationId: history.conversationId,
    };

    await graphqlPubsub.publish(
      `conversationMessageInserted:${history.conversationId}`,
      { conversationMessageInserted: historyMessage },
    );

    await pConversationClientMessageInserted(subdomain, historyMessage);

    return history;
  } finally {
    try {
      await lock?.unlock();
    } catch (unlockError) {
      console.error('acceptCall: failed to release lock:', unlockError);
    }
  }
};

export default acceptCall;
