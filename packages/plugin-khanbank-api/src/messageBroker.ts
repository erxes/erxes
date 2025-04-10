import { MessageArgs, sendMessage } from '@erxes/api-utils/src/core';

import Khanbank from './khanbank/khanbank';
import { generateModels } from './connectionResolver';
import { TransferParams } from './khanbank/types';
import {
  InterMessage,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';
import { formatDateToYYYYMMDD } from './khanbank/utils';

export const setupMessageConsumers = async () => {
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
   * get latest record number
   * @param {string} configId - config id
   * @param {string} accountNumber - account number
   * @return {number} - Returns a number
   */
  consumeRPCQueue('khanbank:accountInfo', async ({ subdomain, data }) => {
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
    const now = Date.now();
    const previousDate = new Date(now - 24 * 60 * 60 * 1000);

    const startDate = formatDateToYYYYMMDD(previousDate);
    const endDate = formatDateToYYYYMMDD(new Date());
    try {
      const response = await api.statements.list({
        accountNumber,
        startDate,
        endDate,
      });

      const count = response.total.count || 0;

      if (count === 0) {
        return {
          status: 'success',
          data: {
            lastRecord: 0,
            accountName: response.customerName,
            currency: response.currency,
          },
        };
      }

      const latestTransaction = response.transactions[count - 1];

      return {
        status: 'success',
        data: {
          lastRecord: latestTransaction.record,
          accountName: response.customerName,
          currency: response.currency,
        },
      };
    } catch (e) {
      return {
        status: 'error',
        errorMessage: e.message,
      };
    }
  });

  /**
   * find transaction
   * @param {string} configId - config id
   * @param {string} accountNumber - account number
   * @param {number} record - record number
   * @param {string} description - description
   * @param {string} type - type
   * @return {object} - Returns a response object
   */
  consumeRPCQueue('khanbank:findTransaction', async ({ subdomain, data }) => {
    const { configId, accountNumber, record, description, type } = data;

    if (!configId || !accountNumber || !description) {
      return {
        status: 'error',
        errorMessage:
          'Config id, account number, record, and description are required',
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
      const formatDate = (date) => {
        return date.toISOString().slice(0, 10).replace(/-/g, '');
      };

      const today = new Date();
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(today.getDate() - 2);

      const startDate = formatDate(twoDaysAgo);
      const endDate = formatDate(today);

      const response = await api.statements.list({
        accountNumber,
        startDate,
        endDate,
      });

      const transactions = response.transactions.filter((transaction) => {
        const normalizedDesc = transaction.description.toLowerCase();
        const searchDesc = description.toLowerCase();
        if (type === 'income') {
          return transaction.amount > 0 && normalizedDesc.includes(searchDesc);
        } else {
          return transaction.amount < 0 && normalizedDesc.includes(searchDesc);
        }
      });

      if (transactions.length === 0) {
        return {
          status: 'error',
          errorMessage: 'Transaction not found',
        };
      }

      const transaction = transactions[0];

      return {
        status: 'success',
        data: transaction,
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
  args: MessageArgs & { serviceName: string }
) => {
  return sendMessage({
    ...args,
  });
};
