import { IModels } from '../../connectionResolver';
import { PAYMENTS, PAYMENT_STATUS } from '../constants';
import { IInvoiceDocument } from '../../models/definitions/invoices';
import redis from '../../redis';
import { BaseAPI } from '../base';
import { IQpayInvoice } from '../types';

export const wechatCallbackHandler = async (models: IModels, data: any) => {
  const { identifier } = data;

  if (!identifier) {
    throw new Error('Invoice id is required');
  }

  const invoice = await models.Invoices.getInvoice({
    identifier
  });

  const payment = await models.Payments.getPayment(invoice.selectedPaymentId);

  if (payment.kind !== 'wechatpay') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new WechatPayAPI(payment.config);
    const status = await api.checkInvoice(invoice);

    if (status !== PAYMENT_STATUS.PAID) {
      return invoice;
    }

    await models.Invoices.updateOne(
      { _id: invoice._id },
      {
        $set: {
          status,
          resolvedAt: new Date()
        }
      }
    );

    invoice.status = status;

    return invoice;
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

  async getHeaders() {
    const token = await redis.get(`wechatpay_token_${this.qpayMerchantUser}`);

    if (token) {
      return {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
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
              `${this.qpayMerchantUser}:${this.qpayMerchantPassword}`
            ).toString('base64')
        }
      });

      await redis.set(
        `wechatpay_token_${this.qpayMerchantUser}`,
        access_token,
        'EX',
        3600
      );

      return {
        Authorization: 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async createInvoice(invoice: IInvoiceDocument) {
    const { qpayInvoiceCode } = this;

    try {
      const data: IQpayInvoice = {
        invoice_code: qpayInvoiceCode,
        sender_invoice_no: invoice._id,
        sender_terminal_code: 'kktt_wechat_test',
        invoice_receiver_code: 'terminal',
        invoice_description: invoice.description || 'test invoice',
        amount: invoice.amount,
        callback_url: `${this.domain}/pl:payment/callback/${PAYMENTS.wechatpay.kind}?identifier=${invoice.identifier}`
      };

      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.wechatpay.actions.invoice,
        headers: await this.getHeaders(),
        data
      });

      return {
        ...res,
        qrData: `data:image/jpg;base64,${res.qr_image}`
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  async checkInvoice(invoice: IInvoiceDocument) {
    try {
      const res = await this.request({
        method: 'GET',
        path: `${PAYMENTS.wechatpay.actions.getPayment}/${invoice.apiResponse.invoice_id}`,
        headers: await this.getHeaders()
      });

      if (res.invoice_status === 'CLOSED') {
        return PAYMENT_STATUS.PAID;
      }

      return PAYMENT_STATUS.PENDING;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async cancelInvoice(invoice: IInvoiceDocument) {
    try {
      await this.request({
        method: 'DELETE',
        path: `${PAYMENTS.wechatpay.actions.invoice}/${invoice.apiResponse.invoice_id}`,
        headers: await this.getHeaders()
      });
    } catch (e) {
      return { error: e.message };
    }
  }
}
