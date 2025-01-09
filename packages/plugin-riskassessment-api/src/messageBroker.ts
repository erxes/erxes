import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage
} from "@erxes/api-utils/src/core";
import { afterMutationHandlers } from "./afterMutations";

import { generateModels } from "./connectionResolver";
import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";

export const setupMessageConsumers = async () => {
  consumeQueue("riskassessment:afterMutation", async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeRPCQueue(
    "riskassessment:riskAssessments.find",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.RiskAssessments.find(data),
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "riskassessment:riskAssessments.create",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.RiskAssessments.addRiskAssessment(data),
        status: "success"
      };
    }
  );
};

export const sendCardsMessage = (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "cards",
    ...args
  });
};
export const sendCoreMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};

export const sendRiskAssessmentMessage = (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "riskassessment",
    ...args
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args
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

export const sendTasksMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "tasks",
    ...args
  });
};

export const sendTicketsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "tickets",
    ...args
  });
};

export const sendPurchasesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "purchases",
    ...args
  });
};
