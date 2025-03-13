import * as crypto from 'crypto';

import { IModels } from '../../connectionResolver';
import { ITransactionDocument } from '../../models/definitions/transactions';
import { BaseAPI } from '../base';
import { PAYMENTS, PAYMENT_STATUS } from '../constants';
import { IGolomtInvoice } from '../types';
import { randomAlphanumeric } from '@erxes/api-utils/src/random';

export const hmac256 = (key, message) => {
  const hash = crypto.createHmac('sha256', key).update(message);
  return hash.digest('hex');
};

export const golomtCallbackHandler = async (models: IModels, data: any) => {
  const transaction = await models.Transactions.getTransaction({
    _id: data.invoice,
  });

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== 'golomt') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new GolomtAPI(payment.config);
    const status = await api.checkInvoice(transaction);

    if (status !== PAYMENT_STATUS.PAID) {
      return transaction;
    }

    transaction.status = status;
    transaction.updatedAt = new Date();

    await transaction.save();

    return transaction;
  } catch (e) {
    throw new Error(e.message);
  }
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
    this.token = config.token;
    this.key = config.key;
    this.apiUrl = PAYMENTS.golomt.apiUrl;
    this.domain = domain;
  }

  async authorize() {
    const callback = `${this.domain}/pl-payment/callback/golomt`;
    const transactionId = randomAlphanumeric(10);

    const data: IGolomtInvoice = {
      amount: '1',
      checksum: hmac256(this.key, transactionId + 1 + 'GET' + callback),
      transactionId: transactionId,
      genToken: 'N',
      socialDeeplink: 'Y',
      callback,
      returnType: 'GET',
    };

    try {
      const res = await this.request({
        path: PAYMENTS.golomt.actions.invoice,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.token,
        },
        data,
      }).then((r) => r.json());

      if (res.status !== 200) {
        throw new Error(res.message);
      }
      return { success: true, message: 'Authorized' };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async createInvoice(transaction: ITransactionDocument) {
    const amount = transaction.amount.toString();

    const callback = `${this.domain}/pl:payment/callback/golomt`;

    const data: IGolomtInvoice = {
      amount,
      checksum: hmac256(this.key, transaction._id + amount + 'GET' + callback),
      transactionId: transaction._id,
      genToken: 'N',
      socialDeeplink: 'Y',
      callback,
      returnType: 'GET',
    };

    try {
      const res = await this.request({
        path: PAYMENTS.golomt.actions.invoice,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.token,
        },
        data,
      }).then((r) => r.json());
      return res;
    } catch (e) {
      console.error('error', e);
      return { error: e.message };
    }
  }

  private async check(transaction: any) {
    const data = {
      transactionId: transaction._id,
      checksum: hmac256(this.key, transaction._id + transaction._id),
    };
    try {
      const response = await this.request({
        path: PAYMENTS.golomt.actions.invoiceCheck,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.token,
        },
        data,
      }).then((r) => r.json());

      if (response.status && response.status === 'SENT') {
        return PAYMENT_STATUS.PAID;
      }

      return PAYMENT_STATUS.PENDING;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async checkInvoice(transaction: any) {
    return this.check(transaction);
  }

  async manualCheck(transaction: ITransactionDocument) {
    return this.check(transaction);
  }
}
