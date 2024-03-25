import { IModels } from '../../connectionResolver';
import { ITransactionDocument } from '../../models/definitions/transactions';
import redis from '@erxes/api-utils/src/redis';
import { BaseAPI } from '../base';
import { PAYMENTS, PAYMENT_STATUS } from '../constants';
import { IQpayInvoice } from '../types';

export const qpayCallbackHandler = async (models: IModels, data: any) => {
  const { _id } = data;

  if (!_id) {
    throw new Error('Transaction id is required');
  }

  const transaction = await models.Transactions.getTransaction({
    _id,
  });

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== 'qpay') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new QpayAPI(payment.config);
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

export interface IQpayConfig {
  qpayMerchantUser: string;
  qpayMerchantPassword: string;
  qpayInvoiceCode: string;
}

export class QpayAPI extends BaseAPI {
  private qpayMerchantUser: string;
  private qpayMerchantPassword: string;
  private qpayInvoiceCode: any;
  private domain?: string;

  constructor(config: IQpayConfig, domain?: string) {
    super(config);

    this.qpayInvoiceCode = config.qpayInvoiceCode;
    this.qpayMerchantPassword = config.qpayMerchantPassword;
    this.qpayMerchantUser = config.qpayMerchantUser;
    this.domain = domain;
    this.apiUrl = PAYMENTS.qpay.apiUrl;
  }

  async getHeaders() {
    const token = await redis.get(`qpay_token_${this.qpayMerchantUser}`);

    if (token) {
      return {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      };
    }

    try {
      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.qpay.actions.getToken,
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${this.qpayMerchantUser}:${this.qpayMerchantPassword}`
            ).toString('base64'),
        },
      }).then((r) => r.json());

      await redis.set(
        `qpay_token_${this.qpayMerchantUser}`,
        res.access_token,
        'EX',
        3600
      );


      return {
        Authorization: 'Bearer ' + res.access_token,
        'Content-Type': 'application/json',
      };
    } catch (e) {
      console.error('error', e);
      throw new Error(e.message);
    }
  }

  async createInvoice(invoice: ITransactionDocument) {
    const { qpayInvoiceCode } = this;

    try {
      const data: IQpayInvoice = {
        invoice_code: qpayInvoiceCode,
        sender_invoice_no: invoice._id,
        invoice_receiver_code: 'terminal',
        invoice_description: invoice.description || 'test invoice',
        amount: invoice.amount,
        callback_url: `${this.domain}/pl:payment/callback/${PAYMENTS.qpay.kind}?_id=${invoice._id}`,
      };

      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.qpay.actions.invoice,
        headers: await this.getHeaders(),
        data,
      }).then((r) => r.json());

      return {
        ...res,
        qrData: `data:image/jpg;base64,${res.qr_image}`,
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  async checkInvoice(invoice: ITransactionDocument) {
    return PAYMENT_STATUS.PAID;
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
