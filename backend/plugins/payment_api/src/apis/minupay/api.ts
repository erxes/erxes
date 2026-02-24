import { IModels } from '~/connectionResolvers';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { IInvoiceDocument } from '~/modules/payment/@types/invoices';

import { BaseAPI } from '~/apis/base';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { redis } from 'erxes-api-shared/utils';

export const minupayCallbackHandler = async (models: IModels, data: any) => {
  const { identifier } = data;

  if (!identifier) {
    throw new Error('Invoice id is required');
  }

  const transaction = await models.Transactions.getTransaction(
    {
      _id: identifier,
    },
    true,
  );

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== 'minupay') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new MinuPayAPI(payment.config);
    const status = await api.checkInvoice(transaction);

    if (status !== PAYMENT_STATUS.PAID) {
      return transaction;
    }
    transaction.status = PAYMENT_STATUS.PAID;
    transaction.updatedAt = new Date();
    await transaction.save();

    return transaction;
  } catch (e) {
    throw new Error(e.message);
  }
};

export interface IMinuPayConfig {
  username: string;
  password: string;
}

export class MinuPayAPI extends BaseAPI {
  private username: string;
  private password: string;
  private domain?: string;

  constructor(config: IMinuPayConfig, domain?: string) {
    super(config);

    this.username = config.username;
    this.password = config.password;

    this.domain = domain;
    this.apiUrl = PAYMENTS.minupay.apiUrl;
  }

  async authorize() {
    try {
      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.minupay.actions.login,
        data: {
          username: this.username,
          password: this.password,
        },
      }).then((r) => r.json());

      if (res.status !== '000') {
        throw new Error(res.message || 'Invalid credentials');
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getHeaders() {
    const token = await redis.get(`minupay_token_${this.username}`);

    if (token) {
      return {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      };
    }

    try {
      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.minupay.actions.login,
        data: {
          username: this.username,
          password: this.password,
        },
      }).then((r) => r.json());

      if (res.status !== '000') {
        throw new Error(res.message || 'Failed to get token');
      }

      await redis.set(`minupay_token_${this.username}`, res.entity, 'EX', 1700);

      return {
        Authorization: 'Bearer ' + res.entity,
        'Content-Type': 'application/json',
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getToken() {
    try {
      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.minupay.actions.login,
        data: {
          username: this.username,
          password: this.password,
        },
      }).then((r) => r.json());

      if (res.status !== '000') {
        throw new Error(res.message || 'Failed to get token');
      }

      return res.entity;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async createInvoice(invoice: IInvoiceDocument) {
    // try {
    //   const res = await this.request({
    //     method: 'GET',
    //     path: PAYMENTS.minupay.actions.invoice,
    //     headers: await this.getHeaders(),
    //     params: {
    //       amount: invoice.amount,
    //       // description: invoice.description,
    //       referenceNumber: invoice.identifier,
    //       merchantCode: this.username,
    //       token: await this.getToken(),
    //     },
    //   });

    //   return res;
    // } catch (e) {
    //   throw new Error(e.message);
    // }

    const params = {
      amount: `${invoice.amount}`,
      referenceNumber: invoice._id,
      merchantCode: this.username,
      token: await this.getToken(),
    };

    const url = `${this.apiUrl}/${
      PAYMENTS.minupay.actions.invoice
    }?${new URLSearchParams(params)}`;

    return url;
  }

  async checkInvoice(invoice: ITransactionDocument) {
    // return PAYMENT_STATUS.PAID;
    try {
      const res = await this.request({
        method: 'GET',
        path: `${PAYMENTS.qpay.actions.invoice}/${invoice.response.invoice_id}`,
        headers: await this.getHeaders(),
      }).then((r) => r.json());

      if (res.invoice_status === 'CLOSED') {
        return PAYMENT_STATUS.PAID;
      }

      return PAYMENT_STATUS.PENDING;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async manualCheck(invoice: ITransactionDocument) {
    try {
      const res = await this.request({
        method: 'GET',
        path: `${PAYMENTS.qpay.actions.invoice}/${invoice.response.invoice_id}`,
        headers: await this.getHeaders(),
      }).then((r) => r.json());

      if (res.invoice_status === 'CLOSED') {
        return PAYMENT_STATUS.PAID;
      }

      return PAYMENT_STATUS.PENDING;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async cancelInvoice(invoice: ITransactionDocument) {
    try {
      await this.request({
        method: 'DELETE',
        path: `${PAYMENTS.qpay.actions.invoice}/${invoice.response.invoice_id}`,
        headers: await this.getHeaders(),
      });
    } catch (e) {
      return { error: e.message };
    }
  }
}
