import { IModels } from '~/connectionResolvers';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { redis } from 'erxes-api-shared/utils';
import { BaseAPI } from '~/apis/base';
import { IQpayInvoice } from '../types';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';

export const wechatCallbackHandler = async (models: IModels, data: any) => {
  const { _id } = data;

  if (!_id) {
    throw new Error('Invoice id is required');
  }

  const transaction = await models.Transactions.getTransaction({
    _id,
  });

  const payment = await models.PaymentMethods.getPayment(transaction._id);

  if (payment.kind !== 'wechatpay') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new WechatPayAPI(payment.config);
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

export class WechatPayAPI extends BaseAPI {
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
    this.apiUrl = PAYMENTS.wechatpay.apiUrl;
  }

  async authorize() {
    try {
      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.wechatpay.actions.getToken,
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${this.qpayMerchantUser}:${this.qpayMerchantPassword}`,
            ).toString('base64'),
        },
      }).then((r) => r.json());

      if (res.error) {
        if (res.error === 'CLIENT_NOTFOUND') {
          throw new Error(
            'Invalid credentials!!! Please check your credentials',
          );
        }

        throw new Error(res.error);
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getHeaders() {
    const token = await redis.get(`wechatpay_token_${this.qpayMerchantUser}`);

    if (token) {
      return {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      };
    }

    try {
      const { access_token } = await this.request({
        method: 'POST',
        path: PAYMENTS.wechatpay.actions.getToken,
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${this.qpayMerchantUser}:${this.qpayMerchantPassword}`,
            ).toString('base64'),
        },
      }).then((r) => r.json());

      await redis.set(
        `wechatpay_token_${this.qpayMerchantUser}`,
        access_token,
        'EX',
        3600,
      );

      return {
        Authorization: 'Bearer ' + access_token,
        'Content-Type': 'application/json',
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async createInvoice(invoice: ITransactionDocument) {
    const { qpayInvoiceCode } = this;

    try {
      const data: IQpayInvoice = {
        invoice_code: qpayInvoiceCode,
        sender_invoice_no: invoice._id,
        sender_terminal_code: 'kktt_wechat_test',
        invoice_receiver_code: 'terminal',
        invoice_description: invoice.description || 'test invoice',
        amount: invoice.amount,
        callback_url: `${this.domain}/pl:payment/callback/${PAYMENTS.wechatpay.kind}?_id=${invoice._id}`,
      };

      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.wechatpay.actions.invoice,
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
    try {
      const res = await this.request({
        method: 'GET',
        path: `${PAYMENTS.wechatpay.actions.getPayment}/${invoice.response.invoice_id}`,
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
        path: `${PAYMENTS.wechatpay.actions.invoice}/${invoice.response.invoice_id}`,
        headers: await this.getHeaders(),
      });
    } catch (e) {
      return { error: e.message };
    }
  }
}
