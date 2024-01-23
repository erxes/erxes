import { MessageArgs, sendMessage } from '@erxes/api-utils/src/core';

import Khanbank from './khanbank/khanbank';
import { generateModels } from './connectionResolver';
import { TransferParams } from './khanbank/types';
import {
  InterMessage,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  /**
   * Get account list
   * @param {string} subdomain
   * @param {string} configId
   * @return { Promise<any>}
   * TODO: add return type
   */
  consumeRPCQueue('khanbank:accounts', async ({ subdomain, data }) => {
    const { configId } = data;

    if (!configId) {
      return {
        status: 'error',
        errorMessage: 'Config id is required',
      };
    }

    const models = await generateModels(subdomain);

    const config = await models.KhanbankConfigs.findOne({ _id: configId });

    if (!config) {
      return {
        status: 'error',
        errorMessage: 'Config not found',
      };
    }

    const api = new Khanbank(config);
    try {
      const response = await api.accounts.list();

      return {
        status: 'success',
        data: response,
      };
    } catch (e) {
      return {
        status: 'error',
        errorMessage: e.message,
      };
    }
  });

  /**
   * Get account detail
   * @param {string} subdomain
   * @param {string} configId
   * @param {string} accountNumber
   * @return { Promise<any>}
   * TODO: add return type
   */
  consumeRPCQueue('khanbank:accountDetail', async ({ subdomain, data }) => {
    const { configId, accountNumber } = data;

    if (!accountNumber || !configId) {
      return {
        status: 'error',
        errorMessage: 'Account number and config id is required',
      };
    }

    const models = await generateModels(subdomain);

    const config = await models.KhanbankConfigs.findOne({ _id: configId });

    if (!config) {
      return {
        status: 'error',
        errorMessage: 'Config not found',
      };
    }

    const api = new Khanbank(config);
    try {
      const response = await api.accounts.get(accountNumber);

      return {
        status: 'success',
        data: response,
      };
    } catch (e) {
      return {
        status: 'error',
        errorMessage: e.message,
      };
    }
  });

  /**
   * Get account holder
   * @param {string} consumerKey
   * @param {string} secretKey
   * @param {string} accountNumber
   * @param {string} bankCode
   * @return { Promise<any>}
   * TODO: add return type
   */
  consumeRPCQueue('khanbank:accountHolder', async ({ subdomain, data }) => {
    const { configId, accountNumber, bankCode } = data;

    if (!configId || !accountNumber || !bankCode) {
      return {
        status: 'error',
        errorMessage: 'Account number, bank code and config id is required',
      };
    }

    const models = await generateModels(subdomain);

    const config = await models.KhanbankConfigs.findOne({ _id: configId });

    if (!config) {
      return {
        status: 'error',
        errorMessage: 'Config not found',
      };
    }

    const api = new Khanbank(config);
    try {
      const response = await api.accounts.getHolder(accountNumber, bankCode);

      return {
        status: 'success',
        data: response,
      };
    } catch (e) {
      return {
        status: 'error',
        errorMessage: e.message,
      };
    }
  });

  /**
   * Get statements
   * @param {string} accountNumber - account number
   * @param {string} startDate - start date string
   * @param {string} endDate - end date string
   * @param {number} page - page number
   * @param {number} perPage - per page
   * @param {number} record - record number
   * @return {[object]} - Returns an array of statements
   * TODO: update return type
   */
  consumeRPCQueue('khanbank:statements', async ({ subdomain, data }) => {
    const { configId, accountNumber } = data;

    if (!configId || !accountNumber) {
      return {
        status: 'error',
        errorMessage: 'Config id and account number is required',
      };
    }

    const models = await generateModels(subdomain);

    const config = await models.KhanbankConfigs.findOne({ _id: configId });

    if (!config) {
      return {
        status: 'error',
        errorMessage: 'Config not found',
      };
    }

    const api = new Khanbank(config);
    try {
      const response = await api.statements.list({ accountNumber, ...data });

      return {
        status: 'success',
        data: response,
      };
    } catch (e) {
      return {
        status: 'error',
        errorMessage: e.message,
      };
    }
  });

  /**
   * make transfer from khanbank to khanbank
   * @param {string} configId - config id
   * @param {TransferParams} transferParams - transfer params
   * @return {object} - Returns a response object
   */
  consumeRPCQueue('khanbank:domesticTransfer', async ({ subdomain, data }) => {
    const { configId } = data;
    const transferParams: TransferParams = data.transferParams;

    if (!configId || !transferParams) {
      return {
        status: 'error',
        errorMessage: 'Config id and transfer params is required',
      };
    }

    const models = await generateModels(subdomain);

    const config = await models.KhanbankConfigs.findOne({ _id: configId });

    if (!config) {
      return {
        status: 'error',
        errorMessage: 'Config not found',
      };
    }

    const api = new Khanbank(config);
    try {
      const response = await api.transfer.domestic(transferParams);

      return {
        status: 'success',
        data: response,
      };
    } catch (e) {
      return {
        status: 'error',
        errorMessage: e.message,
      };
    }
  });

  /**
   * make transfer from khanbank to other bank
   * @param {string} configId - config id
   * @param {TransferParams} transferParams - transfer params
   * @param {string} toCurrency - to currency
   * @param {string} toAccountName - to account name
   * @param {string} toBank - to bank
   * @return {object} - Returns a response object
   * TODO: update return type
   */
  consumeRPCQueue('khanbank:interbankTransfer', async ({ subdomain, data }) => {
    const { configId, toCurrency, toAccountName, toBank } = data;
    const transferParams: TransferParams = data.transferParams;

    if (
      !configId ||
      !transferParams ||
      !toCurrency ||
      !toAccountName ||
      !toBank
    ) {
      return {
        status: 'error',
        errorMessage:
          'Config id and transfer params and toCurrency and toAccountName and toBank is required',
      };
    }

    const models = await generateModels(subdomain);

    const config = await models.KhanbankConfigs.findOne({ _id: configId });

    if (!config) {
      return {
        status: 'error',
        errorMessage: 'Config not found',
      };
    }

    const api = new Khanbank(config);
    try {
      const response = await api.transfer.interbank({
        ...transferParams,
        toCurrency,
        toAccountName,
        toBank,
      });

      return {
        status: 'success',
        data: response,
      };
    } catch (e) {
      return {
        status: 'error',
        errorMessage: e.message,
      };
    }
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string },
) => {
  return sendMessage({
    ...args,
  });
};
