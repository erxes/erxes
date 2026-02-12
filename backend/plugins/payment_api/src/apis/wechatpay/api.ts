import { IModels } from '~/connectionResolvers';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { redis } from 'erxes-api-shared/utils';
import { BaseAPI } from '~/apis/base';
import { IQpayInvoice } from '../types';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { extractErrorMessage } from '~/utils/extractErrorMessage';

type FetchResponse = {
  text(): Promise<string>;
};

async function safeJson(res: FetchResponse) {
  const text = await res.text();

  if (!text) {
    throw new Error('Empty response from WeChatPay');
  }

  if (text.trim().startsWith('<')) {
    throw new Error(
      'WeChatPay returned HTML instead of JSON (credentials or endpoint issue)',
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from WeChatPay: ${text.slice(0, 200)}`);
  }
}

export const wechatCallbackHandler = async (
  models: IModels,
  data: any,
) => {
  const { _id } = data;

  if (!_id) {
    throw new Error('Invoice id is required');
  }

  const transaction = await models.Transactions.getTransaction({ _id });
  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

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
  private domain?: string;

  constructor(config: IQpayConfig, domain?: string) {
    super(config);

    this.qpayMerchantUser = config.qpayMerchantUser;
    this.qpayMerchantPassword = config.qpayMerchantPassword;
    this.qpayInvoiceCode = config.qpayInvoiceCode;
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
      });

      const json = await safeJson(res);

      if (json.error === 'CLIENT_NOTFOUND') {
        throw new Error(
          'Invalid credentials. Please check your configuration.',
        );
      }

      if (json.error) {
        throw new Error(json.error);
      }

      return { success: true };
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async getHeaders() {
    const cacheKey = `wechatpay_token_${this.qpayMerchantUser}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return {
        Authorization: 'Bearer ' + cached,
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
              `${this.qpayMerchantUser}:${this.qpayMerchantPassword}`,
            ).toString('base64'),
        },
      });

      const json = await safeJson(res);

      if (!json.access_token) {
        throw new Error(json.error || 'Failed to get access token');
      }

      await redis.set(cacheKey, json.access_token, 'EX', 3600);

      return {
        Authorization: 'Bearer ' + json.access_token,
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
        sender_terminal_code: 'kktt_wechat',
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
      });

      const json = await safeJson(res);

      return {
        ...json,
        qrData: json.qr_image
          ? `data:image/png;base64,${json.qr_image}`
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
      });

      const json = await safeJson(res);

      if (json.invoice_status === 'CLOSED') {
        return PAYMENT_STATUS.PAID;
      }

      return PAYMENT_STATUS.PENDING;
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async cancelInvoice(invoice: ITransactionDocument) {
    try {
      const res = await this.request({
        method: 'DELETE',
        path: `${PAYMENTS.wechatpay.actions.invoice}/${invoice.response.invoice_id}`,
        headers: await this.getHeaders(),
      });

      const json = await safeJson(res);

      if (json.error) {
        throw new Error(json.error);
      }

      return { success: true };
    } catch (e: any) {
      return { error: extractErrorMessage(e) };
    }
  }
}
