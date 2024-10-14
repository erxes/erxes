import { sendMessage } from "@erxes/api-utils/src/core";
import { MessageArgs, MessageArgsOmitService } from "@erxes/api-utils/src/core";
import { generateModels } from "./connectionResolver";
import fetch from "node-fetch";
import { consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";
import { getCloseInfo } from "./models/utils/closeUtils";
import { IConfig } from "./interfaces/config";

type CustomFieldType = "core:customer";

export const setupMessageConsumers = async () => {
  consumeRPCQueue("loans:contracts.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Contracts.find(data).lean()
    };
  });

  consumeRPCQueue("loans:contracts.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Contracts.findOne(data).lean()
    };
  });

  consumeRPCQueue(
    "loans:firstLoanSchedules.findOne",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.FirstSchedules.findOne(data).lean()
      };
    }
  );

  consumeRPCQueue("loans:contracts.update", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { selector, modifier } = data;

    const result = await models.Contracts.updateOne(selector, modifier);
    return {
      status: "success",
      data: result
    };
  });

  consumeRPCQueue(
    "loans:contracts.getCloseInfo",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const contract = await models.Contracts.getContract({
        _id: data.contractId
      });
      const closeInfo = await getCloseInfo(
        models,
        subdomain,
        contract,
        data.closeDate
      );
      return {
        status: "success",
        data: closeInfo
      };
    }
  );

  consumeRPCQueue("loans:contractType.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      status: "success",
      data: await models.ContractTypes.findOne(data).lean()
    };
  });

  consumeRPCQueue("loans:contractType.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.ContractTypes.find(data).lean()
    };
  });

  consumeRPCQueue("loans:transactions.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Transactions.find(data).lean()
    };
  });

  consumeRPCQueue(
    "loans:transactions.findAtContracts",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const contracts = await models.Contracts.find(data, { _id: 1 }).lean();

      return {
        status: "success",
        data: await models.Transactions.find({
          contractId: { $in: contracts.map(c => c._id) }
        }).lean()
      };
    }
  );
  consumeRPCQueue("loans:transaction", async ({ subdomain, data }) => {
    return {
      status: "success"
    };
  });
  consumeRPCQueue(
    "loans:firstLoanSchedules.insertMany",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.FirstSchedules.insertMany(data),
        status: "success"
      };
    }
  );
  consumeRPCQueue("loans:transaction.add", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.FirstSchedules.insertMany(data),
      status: "success"
    };
  });
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
    | "syncpolaris"
    | "savings"
    | "burenscoring"
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

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    ...args
  });
};

export const getFieldObject = async (
  subdomain,
  customFieldType: CustomFieldType,
  code: string
) => {
  const fields = await sendCommonMessage({
    subdomain,
    serviceName: "core",
    action: "fields.find",
    data: {
      query: {
        contentType: customFieldType,
        code: { $exists: true, $ne: "" }
      },
      projection: {
        groupId: 1,
        code: 1,
        _id: 1
      }
    },
    isRPC: true,
    defaultValue: []
  });

  return fields.find(row => row.code === code);
};

export const getConfig = async (
  code:
    | "loansConfig"
    | "holidayConfig"
    | "MESSAGE_PRO_API_KEY"
    | "MESSAGE_PRO_PHONE_NUMBER"
    | "creditScore",
  subdomain: string,
  defaultValue: IConfig = { calculationFixed: 2 }
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

export const sendSms = async (
  subdomain: string,
  type: string,
  phoneNumber: string,
  content: string
) => {
  if (type === "messagePro") {
    const MESSAGE_PRO_API_KEY = await getConfig(
      "MESSAGE_PRO_API_KEY",
      subdomain
    );

    const MESSAGE_PRO_PHONE_NUMBER = await getConfig(
      "MESSAGE_PRO_PHONE_NUMBER",
      subdomain
    );

    if (!MESSAGE_PRO_API_KEY || !MESSAGE_PRO_PHONE_NUMBER) {
      throw new Error("messaging config not set properly");
    }

    try {
      await fetch(
        "https://api.messagepro.mn/send?" +
        new URLSearchParams({
          key: MESSAGE_PRO_API_KEY,
          from: MESSAGE_PRO_PHONE_NUMBER,
          to: phoneNumber,
          text: content
        })
      );

      return "sent";
    } catch (e) {
      throw new Error(e.message);
    }
  }
};
