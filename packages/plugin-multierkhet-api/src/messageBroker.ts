import { sendMessage, MessageArgsOmitService } from "@erxes/api-utils/src/core";
import { afterMutationHandlers } from "./afterMutations";
import { afterQueryHandlers } from "./afterQueries";

import { generateModels } from "./connectionResolver";
import { sendRPCMessage } from "./messageBrokerErkhet";
import { loansTransactionToErkhet } from "./utils/loansTransactionToErkhet";
import { getPostData, orderDeleteToErkhet } from "./utils/orders";
import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";

export const setupMessageConsumers = async () => {
  consumeQueue("multierkhet:afterMutation", async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeRPCQueue("multierkhet:afterQuery", async ({ subdomain, data }) => {
    return {
      status: "success",
      data: await afterQueryHandlers(subdomain, data)
    };
  });

  consumeRPCQueue("multierkhet:getConfig", async ({ subdomain, data }) => {
    const { code, defaultValue } = data;
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: models.Configs.getConfig(code, defaultValue)
    };
  });

  consumeRPCQueue("multierkhet:toOrder", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { pos, order } = data;
    const syncLogDoc = {
      contentType: "pos:order",
      createdAt: new Date(),
      createdBy: order.userId
    };
    const syncLog = await models.SyncLogs.syncLogsAdd({
      ...syncLogDoc,
      contentId: order._id,
      consumeData: order,
      consumeStr: JSON.stringify(order)
    });
    try {
      const postData = await getPostData(subdomain, pos, order);
      if (!postData) {
        return {
          status: "success",
          data: {}
        };
      }

      return {
        status: "success",
        data: await sendRPCMessage(
          models,
          syncLog,
          "rpc_queue:erxes-automation-erkhet",
          {
            action: "get-response-send-order-info",
            isEbarimt: false,
            payload: JSON.stringify(postData),
            thirdService: true,
            isJson: true
          }
        )
      };
    } catch (e) {
      await models.SyncLogs.updateOne(
        { _id: syncLog._id },
        { $set: { error: e.message } }
      );
      return {
        status: "success",
        data: { error: e.message }
      };
    }
  });

  consumeRPCQueue(
    "multierkhet:loanTransaction",
    async ({ subdomain, data }) => {
      const { generals, orderId } = data;
      const models = await generateModels(subdomain);

      const syncLogDoc = {
        contentType: "loans:transaction",
        createdAt: new Date()
      };
      const syncLog = await models.SyncLogs.syncLogsAdd({
        ...syncLogDoc,
        contentId: orderId,
        consumeData: data,
        consumeStr: JSON.stringify(data)
      });

      try {
        const postData = await loansTransactionToErkhet(
          subdomain,
          generals,
          orderId
        );
        if (!postData) {
          return {
            status: "success",
            data: {}
          };
        }

        return {
          status: "success",
          data: await sendRPCMessage(
            models,
            syncLog,
            "rpc_queue:erxes-automation-erkhet",
            {
              action: "get-response-send-journal-orders",
              isEbarimt: false,
              payload: JSON.stringify(postData),
              thirdService: true,
              isJson: true
            }
          )
        };
      } catch (e) {
        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          { $set: { error: e.message } }
        );
        return {
          status: "success",
          data: { error: e.message }
        };
      }
    }
  );

  consumeRPCQueue(
    "multierkhet:deleteTransaction",
    async ({ subdomain, data }) => {
      const { generals, orderId } = data;
      const models = await generateModels(subdomain);
      const syncLogDoc = {
        contentType: "loans:transaction",
        createdAt: new Date()
      };
      const syncLog = await models.SyncLogs.syncLogsAdd({
        ...syncLogDoc,
        contentId: orderId,
        consumeData: data,
        consumeStr: JSON.stringify(data)
      });

      try {
        const postData = await loansTransactionToErkhet(
          subdomain,
          generals,
          orderId
        );
        if (!postData) {
          return {
            status: "success",
            data: {}
          };
        }

        return {
          status: "success",
          data: await sendRPCMessage(
            models,
            syncLog,
            "rpc_queue:erxes-automation-erkhet",
            {
              action: "get-response-delete-journal-orders",
              isEbarimt: false,
              payload: JSON.stringify(postData),
              thirdService: true,
              isJson: true
            }
          )
        };
      } catch (e) {
        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          { $set: { error: e.message } }
        );
        return {
          status: "success",
          data: { error: e.message }
        };
      }
    }
  );

  consumeRPCQueue("multierkhet:returnOrder", async ({ subdomain, data }) => {
    const { pos, order } = data;

    return {
      status: "success",
      data: await orderDeleteToErkhet(subdomain, pos, order)
    };
  });
};

export const sendSalesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "sales",
    ...args
  });
};

export const sendPosMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "pos",
    ...args
  });
};

export const sendEbarimtMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "ebarimt",
    ...args
  });
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};

export const sendNotificationsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "notifications",
    ...args
  });
};
