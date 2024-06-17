<<<<<<< HEAD
import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage,
} from "@erxes/api-utils/src/core";
import { generateModels } from "./connectionResolver";
import fetch from "node-fetch";
import { consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";
import { getCloseInfo } from "./models/utils/closeUtils";
=======
import { sendMessage } from '@erxes/api-utils/src/core';
import { MessageArgs, MessageArgsOmitService } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import fetch from 'node-fetch';
import { consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';
import { getCloseInfo } from './models/utils/closeUtils';
import { IConfig } from './interfaces/config';
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623

export const setupMessageConsumers = async () => {
  consumeRPCQueue("loans:contracts.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
<<<<<<< HEAD
      status: "success",
      data: await models.Contracts.find(data).lean(),
=======
      status: 'success',
      data: await models.Contracts.find(data).lean()
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    };
  });

  consumeRPCQueue("loans:contracts.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
<<<<<<< HEAD
      status: "success",
      data: await models.Contracts.findOne(data).lean(),
=======
      status: 'success',
      data: await models.Contracts.findOne(data).lean()
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    };
  });

  consumeRPCQueue(
<<<<<<< HEAD
    "loans:firstLoanSchedules.findOne",
=======
    'loans:firstLoanSchedules.findOne',
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
<<<<<<< HEAD
        status: "success",
        data: await models.FirstSchedules.findOne(data).lean(),
=======
        status: 'success',
        data: await models.FirstSchedules.findOne(data).lean()
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
      };
    }
  );

  consumeRPCQueue("loans:contracts.update", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { selector, modifier } = data;

    const result = await models.Contracts.updateOne(selector, modifier);
    return {
<<<<<<< HEAD
      status: "success",
      data: result,
=======
      status: 'success',
      data: result
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
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
<<<<<<< HEAD
        status: "success",
        data: closeInfo,
=======
        status: 'success',
        data: closeInfo
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
      };
    }
  );

  consumeRPCQueue("loans:contractType.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
<<<<<<< HEAD
      status: "success",
      data: await models.ContractTypes.findOne(data).lean(),
=======
      status: 'success',
      data: await models.ContractTypes.findOne(data).lean()
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    };
  });

  consumeRPCQueue("loans:contractType.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
<<<<<<< HEAD
      status: "success",
      data: await models.ContractTypes.find(data).lean(),
=======
      status: 'success',
      data: await models.ContractTypes.find(data).lean()
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    };
  });

  consumeRPCQueue("loans:transactions.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
<<<<<<< HEAD
      status: "success",
      data: await models.Transactions.find(data).lean(),
=======
      status: 'success',
      data: await models.Transactions.find(data).lean()
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
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
          contractId: { $in: contracts.map((c) => c._id) }
        }).lean()
      };
    }
  );
  consumeRPCQueue("loans:transaction", async ({ subdomain, data }) => {
    console.log("subdomain, data", subdomain, data);
    return {
<<<<<<< HEAD
      status: "success",
    };
  });
  consumeRPCQueue(
    "loans:firstLoanSchedules.insertMany",
=======
      status: 'success'
    };
  });
  consumeRPCQueue(
    'loans:firstLoanSchedules.insertMany',
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.FirstSchedules.insertMany(data),
<<<<<<< HEAD
        status: "success",
      };
    }
  );
=======
        status: 'success'
      };
    }
  );
  consumeRPCQueue('loans:transaction.add', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.FirstSchedules.insertMany(data),
      status: 'success'
    };
  });
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
};

export const sendMessageBroker = async (
  args: MessageArgsOmitService,
  name:
<<<<<<< HEAD
    | "core"
    | "cards"
    | "reactions"
    | "contacts"
    | "products"
    | "forms"
    | "clientportal"
    | "syncerkhet"
    | "ebarimt"
    | "syncpolaris"
    | "savings"
=======
    | 'core'
    | 'cards'
    | 'reactions'
    | 'contacts'
    | 'products'
    | 'forms'
    | 'clientportal'
    | 'syncerkhet'
    | 'ebarimt'
    | 'syncpolaris'
    | 'savings'
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
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
<<<<<<< HEAD
    serviceName: "core",
    ...args,
=======
    serviceName: 'core',
    ...args
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
  });
};

export const sendCardsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
<<<<<<< HEAD
    serviceName: "cards",
    ...args,
=======
    serviceName: 'cards',
    ...args
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
  });
};

export const sendReactionsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
<<<<<<< HEAD
    serviceName: "reactions",
    ...args,
=======
    serviceName: 'reactions',
    ...args
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    ...args
  });
};

export const getConfig = async (
  code:
<<<<<<< HEAD
    | "loansConfig"
    | "holidayConfig"
    | "MESSAGE_PRO_API_KEY"
    | "MESSAGE_PRO_PHONE_NUMBER",
  subdomain: string,
  defaultValue?: string
=======
    | 'loansConfig'
    | 'holidayConfig'
    | 'MESSAGE_PRO_API_KEY'
    | 'MESSAGE_PRO_PHONE_NUMBER',
  subdomain: string,
  defaultValue: IConfig = {calculationFixed:2}
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
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
<<<<<<< HEAD
      "MESSAGE_PRO_API_KEY",
      subdomain,
      ""
    );

    const MESSAGE_PRO_PHONE_NUMBER = await getConfig(
      "MESSAGE_PRO_PHONE_NUMBER",
      subdomain,
      ""
=======
      'MESSAGE_PRO_API_KEY',
      subdomain
    );

    const MESSAGE_PRO_PHONE_NUMBER = await getConfig(
      'MESSAGE_PRO_PHONE_NUMBER',
      subdomain
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
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
<<<<<<< HEAD
            text: content,
=======
            text: content
>>>>>>> 4da3750595fd6e102e1c0ce6f55c001ba3ba8623
          })
      );

      return "sent";
    } catch (e) {
      throw new Error(e.message);
    }
  }
};
