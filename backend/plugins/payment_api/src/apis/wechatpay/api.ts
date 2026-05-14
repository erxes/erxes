import { IModels } from '~/connectionResolvers';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { redis } from 'erxes-api-shared/utils';
import { BaseAPI } from '~/apis/base';
import { IQpayInvoice } from '../types';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { extractErrorMessage } from '~/utils/extractErrorMessage';

export const wechatCallbackHandler = async (models: IModels, data: any) => {
  const { _id } = data;

  if (!_id) {
    throw new Error('Invoice id is required');
  }

  const transaction = await models.Transactions.getTransaction({ _id });

  const payment = await models.PaymentMethods.getPayment(
    transaction.paymentId 
  );

  if (payment.kind !== 'wechatpay') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new WechatPayAPI(payment.config);
    const status = await api.checkInvoice(transaction);

    if (status === PAYMENT_STATUS.PAID) {
      transaction.status = PAYMENT_STATUS.PAID;
    }

    if (status === PAYMENT_STATUS.FAILED) {
      transaction.status = PAYMENT_STATUS.FAILED;
    }

    transaction.updatedAt = new Date();
    await transaction.save();

    return transaction;
  } catch (e: any) {
    throw new Error(extractErrorMessage(e));
  }
};

export interface IQpayConfig {
  qpayMerchantUser: string;
  qpayMerchantPassword: string;
  qpayInvoiceCode: string;
}

export class WechatPayAPI extends BaseAPI {
  private readonly qpayMerchantUser: string;
  private readonly qpayMerchantPassword: string;
  private readonly qpayInvoiceCode: string;
  private readonly domain?: string;

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
              `${this.qpayMerchantUser}:${this.qpayMerchantPassword}`
            ).toString('base64'),
        },
      }).then((r) => r.json());

      if (res.error) {
        if (res.error === 'CLIENT_NOTFOUND') {
          throw new Error('Invalid credentials. Please check configuration.');
        }
        throw new Error(res.error);
      }

      return { success: true };
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async getHeaders() {
    const cacheKey = `wechatpay_token_${this.qpayMerchantUser}`;
    const token = await redis.get(cacheKey);

    if (token) {
      return {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      };
    }

    try {
      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.wechatpay.actions.getToken,
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${this.qpayMerchantUser}:${this.qpayMerchantPassword}`
            ).toString('base64'),
        },
      }).then((r) => r.json());

      if (!res.access_token) {
        throw new Error(res.error || 'Failed to obtain access token');
      }

      await redis.set(cacheKey, res.access_token, 'EX', 3600);

      return {
        Authorization: 'Bearer ' + res.access_token,
        'Content-Type': 'application/json',
      };
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async createInvoice(invoice: ITransactionDocument) {
    try {
      const data: IQpayInvoice = {
        invoice_code: this.qpayInvoiceCode,
        sender_invoice_no: invoice._id,
        sender_terminal_code: 'wechat_terminal',
        invoice_receiver_code: 'terminal',
        invoice_description: invoice.description || 'Invoice',
        amount: invoice.amount,
        callback_url: `${this.domain}/pl:payment/callback/${PAYMENTS.wechatpay.kind}?_id=${invoice._id}`,
      };

      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.wechatpay.actions.invoice,
        headers: await this.getHeaders(),
        data,
      }).then((r) => r.json());

      if (res.error) {
        throw new Error(res.error);
      }

      return {
        ...res,
        qrData: res.qr_image
          ? `data:image/png;base64,${res.qr_image}`
          : undefined,
      };
    } catch (e: any) {
      return { error: extractErrorMessage(e) };
    }
  }

  async checkInvoice(invoice: ITransactionDocument) {
    try {
      const res = await this.request({
        method: 'GET',
        path: `${PAYMENTS.wechatpay.actions.getPayment}/${invoice.response.invoice_id}`,
        headers: await this.getHeaders(),
      }).then((r) => r.json());

      /**
       * ✅ Correct status mapping
       * We trust payment_status, NOT invoice_status
       */
      if (res.payment_status === 'PAID') {
        return PAYMENT_STATUS.PAID;
      }

      if (
        res.payment_status === 'FAILED' ||
        res.invoice_status === 'CLOSED'
      ) {
        return PAYMENT_STATUS.FAILED;
      }

      return PAYMENT_STATUS.PENDING;
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async cancelInvoice(invoice: ITransactionDocument) {
    try {
      await this.request({
        method: 'DELETE',
        path: `${PAYMENTS.wechatpay.actions.invoice}/${invoice.response.invoice_id}`,
        headers: await this.getHeaders(),
      });

      return { success: true };
    } catch (e: any) {
      return { error: extractErrorMessage(e) };
    }
  }
}
