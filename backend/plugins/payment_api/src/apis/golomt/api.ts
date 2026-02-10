import * as crypto from 'crypto';

import { IModels } from '~/connectionResolvers';
import { BaseAPI } from '~/apis/base';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { IGolomtInvoice } from '~/apis/types';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import {
  graphqlPubsub,
  isEnabled,
  random,
  sendWorkerMessage,
} from 'erxes-api-shared/utils';
import { splitType } from 'erxes-api-shared/core-modules';
type FetchResponse = {
  text(): Promise<string>;
};

async function safeJson(res: FetchResponse) {
  const text = await res.text();

  if (!text) {
    throw new Error('Empty response from Golomt');
  }

  if (text.trim().startsWith('<')) {
    throw new Error(
      'Golomt returned HTML instead of JSON (token / endpoint / IP whitelist issue)'
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from Golomt: ${text.slice(0, 200)}`);
  }
}


function extractErrorMessage(e: any): string {
  if (!e) return 'Unknown error';
  if (typeof e === 'string') return e;
  if (e.message) return e.message;
  if (e.response?.data?.message) return e.response.data.message;

  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}


export const hmac256 = (key: string, message: string) =>
  crypto.createHmac('sha256', key).update(message).digest('hex');


export const notificationHandler = async (
  models: IModels,
  subdomain: string,
  data: any,
  res: any,
) => {
  const { errorCode, transactionId, errorDesc } = data;

  if (errorCode !== '000') {
    res.status(400).json({ status: 'error', message: errorDesc });
    return;
  }

  const transaction = await models.Transactions.getTransaction({
    'details.golomtTransactionId': transactionId,
  });

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== 'golomt') {
    res.status(400).json({
      status: 'error',
      message: 'Payment method kind is mismatched',
    });
    return;
  }

  try {
    const api = new GolomtAPI(payment.config);
    const status = await api.checkInvoice(transaction);

    if (status !== PAYMENT_STATUS.PAID) {
      res.json({ status: 'pending' });
      return;
    }

    transaction.status = status;
    transaction.updatedAt = new Date();
    await transaction.save();

    graphqlPubsub.publish(`transactionUpdated:${transaction.invoiceId}`, {
      transactionUpdated: {
        _id: transaction._id,
        status: 'paid',
        amount: transaction.amount,
        paymentKind: transaction.paymentKind,
      },
    });

    const invoice = await models.Invoices.getInvoice({
      _id: transaction.invoiceId,
    });

    const result = await models.Invoices.checkInvoice(
      invoice._id,
      subdomain,
    );

    if (result === 'paid') {
      graphqlPubsub.publish(`invoiceUpdated:${invoice._id}`, {
        invoiceUpdated: { _id: invoice._id, status: 'paid' },
      });
    }

    const [pluginName, moduleName, collectionType] = splitType(
      invoice.contentType,
    );

    if (await isEnabled(pluginName)) {
      await sendWorkerMessage({
        subdomain,
        pluginName,
        queueName: 'payments',
        jobName: 'transactionCallback',
        data: {
          ...transaction,
          moduleName,
          collectionType,
          apiResponse: 'success',
        },
        defaultValue: null,
      });
    }

    res.json({ status: 'success' });
  } catch (e: any) {
    res.status(500).json({ status: 'error', message: extractErrorMessage(e) });
  }
};

export const golomtCallbackHandler = async (models: IModels, data: any) => {
  const transaction = await models.Transactions.getTransaction({
    _id: data.transactionId,
  });

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== 'golomt') {
    throw new Error('Payment config type is mismatched');
  }

  const api = new GolomtAPI(payment.config);
  const status = await api.checkInvoice(transaction);

  if (status !== PAYMENT_STATUS.PAID) {
    return transaction;
  }

  transaction.status = status;
  transaction.updatedAt = new Date();
  await transaction.save();

  return transaction;
};

export interface IGolomtParams {
  merchant: string;
  key: string;
  token: string;
}

export class GolomtAPI extends BaseAPI {
  private merchant: string;
  private key: string;
  private token: string;
  private domain?: string;

  constructor(config: IGolomtParams, domain?: string) {
    super(config);
    this.merchant = config.merchant;
    this.key = config.key;
    this.token = config.token;
    this.domain = domain;
    this.apiUrl = PAYMENTS.golomt.apiUrl;
  }

  /**
   * Golomt requires a **test invoice** to validate credentials
   */
  async authorize() {
    const callback = `${this.domain}/pl:payment/callback/golomt`;
    const transactionId = random('aA0', 10);

    const data: IGolomtInvoice = {
      amount: '1',
      transactionId,
      genToken: 'N',
      socialDeeplink: 'Y',
      returnType: 'GET',
      callback,
      checksum: hmac256(this.key, transactionId + 1 + 'GET' + callback),
    };

    try {
      const res = await this.request({
        path: PAYMENTS.golomt.actions.invoice,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        data,
      });

      const json = await safeJson(res);

      if (json.status && json.status !== 200) {
        throw new Error(json.message || 'Golomt authorization failed');
      }

      return { success: true };
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async createInvoice(transaction: ITransactionDocument) {
    const amount = transaction.amount.toString();
    const callback = `${this.domain}/pl:payment/callback/golomt?transactionId=${transaction._id}`;

    const transactionId =
      transaction.details?.golomtTransactionId || transaction._id;

    const data: IGolomtInvoice = {
      amount,
      transactionId,
      genToken: 'N',
      socialDeeplink: 'Y',
      returnType: 'GET',
      callback,
      checksum: hmac256(this.key, transactionId + amount + 'GET' + callback),
    };

    try {
      const res = await this.request({
        path: PAYMENTS.golomt.actions.invoice,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        data,
      });

      return await safeJson(res);
    } catch (e: any) {
      return { error: extractErrorMessage(e) };
    }
  }

  private async check(transaction: any) {
    const transactionId =
      transaction.details?.golomtTransactionId || transaction._id;

    const data = {
      transactionId,
      checksum: hmac256(this.key, transactionId + transactionId),
    };

    try {
      const res = await this.request({
        path: PAYMENTS.golomt.actions.invoiceCheck,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        data,
      });

      const json = await safeJson(res);

      if (json.status === 'SENT') {
        return PAYMENT_STATUS.PAID;
      }

      return PAYMENT_STATUS.PENDING;
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async checkInvoice(transaction: ITransactionDocument) {
    return this.check(transaction);
  }

  async manualCheck(transaction: ITransactionDocument) {
    return this.check(transaction);
  }
}
