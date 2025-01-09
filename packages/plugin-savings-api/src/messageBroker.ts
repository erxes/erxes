import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage
} from "@erxes/api-utils/src/core";

import { generateModels } from "./connectionResolver";
import { consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";

export const setupMessageConsumers = async () => {
  consumeRPCQueue("savings:contracts.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Contracts.find(data).lean()
    };
  });

  consumeRPCQueue("savings:contract.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Contracts.findOne(data).lean()
    };
  });

  consumeRPCQueue("savings:block.create", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const deposit = await models.Contracts.findOne({
      _id: data.accountId,
      customerId: data.customerId
    });

    if (!deposit) {
      throw new Error("Contract not found");
    }

    data.contractId = deposit._id;

    return {
      status: "success",
      data: await models.Block.createBlock(data)
    };
  });

  consumeRPCQueue(
    "savings:contracts.getDepositAccount",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const contractType = await models.ContractTypes.findOne({
        isDeposit: true
      });
      return {
        status: "success",
        data: await models.Contracts.findOne({
          contractTypeId: contractType?._id,
          customerId: data.customerId
        }).lean()
      };
    }
  );

  consumeRPCQueue("savings:contracts.update", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { selector, modifier } = data;
    const result = await models.Contracts.updateOne(selector, modifier);

    return {
      status: "success",
      data: result
    };
  });

  consumeRPCQueue("savings:transactions.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Transactions.find(data).lean()
    };
  });

  consumeRPCQueue(
    "savings:contractType.findOne",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      return {
        status: "success",
        data: await models.ContractTypes.findOne(data).lean()
      };
    }
  );

  consumeRPCQueue(
    "savings:transactions.findAtContracts",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const contracts = await models.Contracts.find(data, { _id: 1 }).lean();

      return {
        status: "success",
        data: await models.Transactions.find({
          contractId: { $in: contracts.map((c) => c._id) }
        }).lean()
      };
    }
  );

  consumeRPCQueue(
    "savings:transactions.createTransaction",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const transaction = await models.Transactions.createTransaction(
        data,
        subdomain
      );

      return {
        status: "success",
        data: transaction
      };
    }
  );
};

export const getConfig = async (
  code: "savingConfig",
  subdomain: string,
  defaultValue?: string
) => {
  const configs = await sendCoreMessage({
    subdomain,
    action: "getConfigs",
    data: {},
    isRPC: true,
    defaultValue: []
  });

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const sendMessageBroker = async (
  args: MessageArgsOmitService,
  name:
    | "core"
    | "sales"
    | "reactions"
    | "clientportal"
    | "syncerkhet"
    | "ebarimt"
    | "loans"
    | "khanbank"
): Promise<any> => {
  return sendMessage({
    serviceName: name,
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

export const sendSalesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "sales",
    ...args
  });
};

export const sendReactionsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "reactions",
    ...args
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args
  });
};
