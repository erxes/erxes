import type {
  MessageArgs,
  MessageArgsOmitService
} from "@erxes/api-utils/src/core";
import {
  checkWaitingResponseAction,
  doWaitingResponseAction
} from "./actions/wait";
import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";
import { executePrevAction, receiveTrigger } from "./utils";

import { debugInfo } from "@erxes/api-utils/src/debuggers";
import { generateModels } from "./connectionResolver";
import { playWait } from "./actions";
import { sendMessage } from "@erxes/api-utils/src/core";

export const setupMessageConsumers = async () => {
  consumeQueue("automations:trigger", async ({ subdomain, data }) => {
    debugInfo(`Receiving queue data: ${JSON.stringify(data)}`);

    const models = await generateModels(subdomain);
    const { type, actionType, targets } = data;

    if (actionType && actionType === "waiting") {
      await playWait(models, subdomain, data);
      return;
    }
    const waitingExecution = await await checkWaitingResponseAction(
      models,
      type,
      actionType,
      targets
    );

    if (waitingExecution) {
      await doWaitingResponseAction(models, subdomain, data, waitingExecution);
      return;
    }

    await receiveTrigger({ models, subdomain, type, targets });
  });

  consumeRPCQueue("automations:trigger", async ({ subdomain, data }) => {
    debugInfo(`Receiving queue data: ${JSON.stringify(data)}`);

    const models = await generateModels(subdomain);
    const { type, actionType, targets } = data;
  
    const waitingExecution = await await checkWaitingResponseAction(
      models,
      type,
      actionType,
      targets
    );

    if (waitingExecution) {
      await doWaitingResponseAction(models, subdomain, data, waitingExecution);
      return {
        status: "success",
        data: "complete"
      };
    }

    try {
      await receiveTrigger({ models, subdomain, type, targets });
      return {
        status: "success",
        data: "complete"
      };
    } catch (error) {
      return {
        status: "error",
        errorMessage: error?.message || "error"
      };
    }
  });

  consumeRPCQueue("automations:trigger.find", async ({ subdomain, data }) => {
    debugInfo(`Receiving queue data: ${JSON.stringify(data)}`);
    const models = await generateModels(subdomain);
    try {
      const result = await models.Automations.find({
        "triggers.type": data.query.triggerType,
        "triggers.config.botId": data.query.botId,
        status: "active"
      }).lean();
      return {
        status: "success",
        data: result
      };
    } catch (error) {
      return {
        status: "error",
        errorMessage: error?.message || "error"
      };
    }
  });
  consumeRPCQueue("automations:find.count", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { query = {} } = data || {};

    return {
      status: "success",
      data: await models.Automations.countDocuments(query)
    };
  });

  consumeRPCQueue(
    "automations:excutePrevActionExecution",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      return {
        status: "success",
        data: await executePrevAction(models, subdomain, data)
      };
    }
  );

  consumeRPCQueue("automations:executions.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Executions.find(data)
    };
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
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

export const sendSegmentsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};
