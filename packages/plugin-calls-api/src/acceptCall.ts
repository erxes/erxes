import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';
import { IIntegrationDocument } from './models/definitions/integrations';
import { findIntegration } from './utils';

const findAllCallHistories = async (
  models: IModels,
  timeStamp: number | string,
) => {
  return await models.CallHistory.find({ timeStamp }).sort({ createdAt: 1 });
};

const findRelatedCallHistories = async (
  models: IModels,
  customerPhone: string,
  timeStamp: number | string,
  timeWindowSeconds: number = 10,
) => {
  const timeWindow = timeWindowSeconds;
  const numericTimeStamp =
    typeof timeStamp === 'string' ? parseInt(timeStamp) : timeStamp;
  const startTime = numericTimeStamp - timeWindow;
  const endTime = numericTimeStamp + timeWindow;

  return await models.CallHistory.find({
    customerPhone,
    $or: [
      { timeStamp: { $gte: startTime, $lte: endTime } },
      { timeStamp: { $gte: startTime.toString(), $lte: endTime.toString() } },
    ],
  }).sort({ createdAt: -1 });
};

const findValidCallHistory = async (
  models: IModels,
  timeStamp: number | string,
  customerPhone?: string,
) => {
  const exactHistories = await models.CallHistory.find({ timeStamp }).sort({
    createdAt: -1,
  });

  let allHistories = exactHistories;
  if (customerPhone) {
    const relatedHistories = await findRelatedCallHistories(
      models,
      customerPhone,
      timeStamp,
      10,
    );
    const historyMap = new Map();
    [...exactHistories, ...relatedHistories].forEach((h) => {
      historyMap.set(h._id.toString(), h);
    });
    allHistories = Array.from(historyMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  if (allHistories.length === 0) {
    return null;
  }

  const activeHistory = allHistories.find((h) => h.callStatus === 'active');
  if (activeHistory) {
    return activeHistory;
  }

  const validHistory = allHistories.find((h) => h.callStatus !== 'cancelled');
  if (validHistory) {
    return validHistory;
  }

  return allHistories[0];
};

const cleanupDuplicateHistories = async (
  models: IModels,
  timeStamp: number | string,
  keepHistoryId?: string,
) => {
  try {
    const allHistories = await findAllCallHistories(models, timeStamp);

    if (allHistories.length <= 1) {
      return;
    }

    const activeCalls = allHistories.filter(
      (h) => h.callStatus !== 'cancelled',
    );
    const cancelledCalls = allHistories.filter(
      (h) => h.callStatus === 'cancelled',
    );

    if (activeCalls.length > 0) {
      const cancelledIds = cancelledCalls
        .filter((h) => !keepHistoryId || h._id.toString() !== keepHistoryId)
        .map((h) => h._id);

      if (cancelledIds.length > 0) {
        await models.CallHistory.deleteMany({
          _id: { $in: cancelledIds },
        });
      }

      if (activeCalls.length > 1) {
        const sortedActive = activeCalls.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        const keepCall = keepHistoryId
          ? activeCalls.find((h) => h._id.toString() === keepHistoryId) ||
            sortedActive[0]
          : sortedActive[0];

        const duplicateActiveIds = activeCalls
          .filter((h) => h._id.toString() !== keepCall._id.toString())
          .map((h) => h._id);

        if (duplicateActiveIds.length > 0) {
          await models.CallHistory.deleteMany({
            _id: { $in: duplicateActiveIds },
          });
        }
      }
    }
  } catch (error: any) {
    console.error(
      `Error during cleanup for timestamp ${timeStamp}:`,
      error.message,
    );
  }
};

const prepareHistoryData = (
  params: any,
  integration: IIntegrationDocument,
  user,
  customer: any,
) => {
  const {
    extentionNumber,
    operatorPhone,
    customerPhone,
    callStartTime,
    callType,
    callStatus,
    timeStamp,
    queueName,
  } = params;

  return {
    operatorPhone,
    customerPhone,
    callStartTime,
    callType,
    callStatus,
    inboxIntegrationId: integration.inboxId,
    updatedBy: user._id,
    callDuration: 0,
    extentionNumber,
    queueName: queueName || null,
    timeStamp: timeStamp === 0 ? Date.now().toString() : timeStamp,
    customerId: customer?.erxesApiId || '',
  };
};

const handleCallHistory = async (
  models: IModels,
  historyData: any,
  params: any,
  user,
) => {
  const { timeStamp, callStatus, customerPhone } = params;

  try {
    const filter = {
      timeStamp,
      customerPhone,
      $or: [{ callStatus: 'cancelled' }, { callStatus: { $exists: false } }],
    } as any;

    const update = {
      $set: {
        ...historyData,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
        createdBy: user._id,
      },
    };

    const options = {
      upsert: true,
      new: true,
      runValidators: true,
    };

    if (callStatus === 'cancelled') {
      const existingActiveCall = await models.CallHistory.findOne({
        timeStamp,
        customerPhone,
        callStatus: { $ne: 'cancelled' },
      });

      if (existingActiveCall) {
        return existingActiveCall;
      }

      filter.$or = [{ _id: { $exists: true } }];
    }

    const history = await models.CallHistory.findOneAndUpdate(
      filter,
      update,
      options,
    );

    await cleanupDuplicateHistories(models, timeStamp, history?._id.toString());

    return history;
  } catch (error: any) {
    if (error.code === 11000 || error.message.includes('duplicate')) {
      const existing = await findValidCallHistory(
        models,
        timeStamp,
        customerPhone,
      );
      if (existing) {
        return existing;
      }
    }

    console.error(
      `Error handling call history for timestamp ${timeStamp}:`,
      error.message,
    );
    throw error;
  }
};

const handleConversation = async (
  subdomain: string,
  customer: any,
  integration: IIntegrationDocument,
  params: any,
  history: any,
  user,
  type?: string,
) => {
  try {
    const response = await sendInboxMessage({
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

    return response;
  } catch (error: any) {
    console.error(
      `Error handling conversation for history ${history._id}:`,
      error.message,
    );
    throw error;
  }
};

const notifyConversationUpdate = async (subdomain: string, history: any) => {
  try {
    await sendInboxMessage({
      subdomain,
      action: 'conversationClientMessageInserted',
      data: {
        ...history?.toObject(),
        conversationId: history.conversationId,
      },
    });
  } catch (error: any) {
    console.error(`Error sending conversation notification:`, error.message);
  }
};

const acceptCall = async (
  models: IModels,
  subdomain: string,
  params,
  user,
  type?: string,
): Promise<any> => {
  const { timeStamp, callStatus } = params;

  if (callStatus === 'cancelled') {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  try {
    const integration = await findIntegration(subdomain, params);
    const operator = integration.operators?.find(
      (op) => op.userId === user?._id,
    );

    params.operatorPhone = integration.phone;
    params.extentionNumber = operator?.gsUsername || '';

    const customer = await models.Customers.findOne({
      primaryPhone: params.customerPhone,
    });

    const existingExactMatch = await models.CallHistory.findOne({
      timeStamp,
      customerPhone: params.customerPhone,
      callStatus,
      createdBy: user._id,
    });

    if (existingExactMatch) {
      return existingExactMatch;
    }

    const historyData = prepareHistoryData(params, integration, user, customer);
    const history = await handleCallHistory(models, historyData, params, user);

    if (callStatus !== 'cancelled' || !history?.conversationId) {
      try {
        const apiConversationResponse = await handleConversation(
          subdomain,
          customer,
          integration,
          params,
          history,
          user,
          type,
        );

        if (history) {
          if (history.conversationId !== apiConversationResponse._id) {
            history.conversationId = apiConversationResponse._id;

            await history.save();
          }

          await notifyConversationUpdate(subdomain, history);
        }
      } catch (convError: any) {
        console.error(
          `Conversation error for history ${history?._id}:`,
          convError.message,
        );
      }
    }

    return history;
  } catch (error: any) {
    console.error(
      `Error processing call timestamp ${timeStamp}:`,
      error.message,
    );

    const errorMessage = error.message?.includes('duplicate')
      ? 'Concurrent request: call history duplication'
      : error.message;

    throw new Error(errorMessage);
  }
};

export default acceptCall;
