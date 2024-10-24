import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";
import { generateModels } from "./connectionResolver";
import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage
} from "@erxes/api-utils/src/core";

export const setupMessageConsumers = async () => {
  consumeQueue(
    "salesplans:dayPlans.updateStatus",
    async ({ subdomain, data: { _ids, status } }) => {
      const models = await generateModels(subdomain);

      await models.DayPlans.updateMany(
        { _id: { $in: _ids } },
        { $set: { status } }
      );
    }
  );

  consumeRPCQueue(
    "salesplans:timeframes.find",
    async ({ subdomain, data: {} }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Timeframes.find({
          status: { $ne: "deleted" }
        }).lean()
      };
    }
  );
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};

export const sendInternalNotesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "internalnotes",
    ...args
  });
};

export const sendProcessesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "processes",
    ...args
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args
  });
};
