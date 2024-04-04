import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage,
} from '@erxes/api-utils/src/core';

import { generateModels } from './connectionResolver';
import { consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';

export const setupMessageConsumers = async () => {
  consumeRPCQueue('savings:contracts.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Contracts.find(data).lean(),
    };
  });

  consumeRPCQueue('savings:contract.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Contracts.findOne(data).lean(),
    };
  });

  consumeRPCQueue(
    'savings:contracts.getDepositAccount',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const contractType = await models.ContractTypes.findOne({
        isDeposit: true,
      });
      return {
        status: 'success',
        data: await models.Contracts.findOne({
          contractTypeId: contractType?._id,
          customerId: data.customerId,
        }).lean(),
      };
    },
  );

  consumeRPCQueue('savings:contracts.update', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { selector, modifier } = data;
    const result = await models.Contracts.updateOne(selector, modifier);

    return {
      status: 'success',
      data: result,
    };
  });

  consumeRPCQueue('savings:transactions.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Transactions.find(data).lean(),
    };
  });

  consumeRPCQueue(
    'savings:contractType.findOne',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      return {
        status: 'success',
        data: await models.ContractTypes.findOne(data).lean(),
      };
    },
  );

  consumeRPCQueue(
    'savings:transactions.findAtContracts',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const contracts = await models.Contracts.find(data, { _id: 1 }).lean();

      return {
        status: 'success',
        data: await models.Transactions.find({
          contractId: { $in: contracts.map((c) => c._id) },
        }).lean(),
      };
    },
  );
};

export const sendMessageBroker = async (
  args: MessageArgsOmitService,
  name:
    | 'core'
    | 'cards'
    | 'reactions'
    | 'contacts'
    | 'products'
    | 'forms'
    | 'clientportal'
    | 'syncerkhet'
    | 'ebarimt'
    | 'loans',
): Promise<any> => {
  return sendMessage({
    serviceName: name,
    ...args,
  });
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendCardsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'cards',
    ...args,
  });
};

export const sendReactionsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'reactions',
    ...args,
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
