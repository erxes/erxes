import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { BaseAPI } from '~/apis/base';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { IQpayInvoice } from '../types';
import { redis } from 'erxes-api-shared/utils';

export const qpayCallbackHandler = async (models: IModels, data: any) => {
  const { _id } = data;

  if (!_id) {
    throw new Error('Transaction id is required');
  }

  const transaction = await models.Transactions.getTransaction({
    $or: [{ _id }, { code: _id }],
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

    await models.Transactions.updateOne(
      { _id: transaction._id },
      { status, updatedAt: new Date() }
    );

    return models.Transactions.getTransaction({ _id: transaction._id });
  } catch (e) {
    throw new Error(e.message);
  }
};

export interface IQpayConfig {
  qpayMerchantUser: string;
  qpayMerchantPassword: string;
  qpayInvoiceCode: string;
  branchCode: string;
}

export class QpayAPI extends BaseAPI {
  private qpayMerchantUser: string;
  private qpayMerchantPassword: string;
  private qpayInvoiceCode: any;
  private branchCode: string;
  private domain?: string;

  constructor(config: IQpayConfig, domain?: string) {
    super(config);

    this.qpayInvoiceCode = config.qpayInvoiceCode;
    this.qpayMerchantPassword = config.qpayMerchantPassword;
    this.qpayMerchantUser = config.qpayMerchantUser;
    this.branchCode = config.branchCode;
    this.domain = domain;
    this.apiUrl = PAYMENTS.qpay.apiUrl;
  }

  async authorize() {
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

      if (res.error) {

        if (res.error === 'NO_CREDENDIALS')  {
          throw new Error('Invalid credentials!!! Please check your credentials');
        }

        throw new Error(res.error);
      }

      return { success: true, message: 'Authorized' };
    } catch (e) {
      console.error('error', e);
      throw new Error(e.message);
    }
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

  async createInvoice(transaction: ITransactionDocument) {
    const { qpayInvoiceCode } = this;

    try {
      const data: IQpayInvoice = {
        invoice_code: qpayInvoiceCode,
        sender_invoice_no:
        transaction.details?.sender_invoice_no || transaction.description || transaction.code,
        invoice_receiver_code: 'terminal',
        invoice_description: transaction.description || 'test invoice',
        // sender_branch_code: this.branchCode, TODO: renable after proper branch code config
        amount: transaction.amount,
        callback_url: `${this.domain}/pl-payment/callback/${PAYMENTS.qpay.kind}?_id=${transaction._id}`,
      };

      // console.debug("callback_url", `${this.domain}/pl:payment/callback/${PAYMENTS.qpay.kind}?_id=${transaction._id}`)

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

  private async check(transaction) {
    try {
      const res = await this.request({
        method: 'GET',
        path: `${PAYMENTS.qpay.actions.invoice}/${transaction.response.invoice_id}`,
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

  async checkInvoice(transaction: ITransactionDocument) {
    // NOTE: uncomment next line for testing purposes
    // return PAYMENT_STATUS.PAID;
    return this.check(transaction);
  }

  async manualCheck(transaction: ITransactionDocument) {
    return this.check(transaction);
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
