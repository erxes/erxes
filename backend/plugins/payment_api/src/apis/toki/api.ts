import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { BaseAPI } from '~/apis/base';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { ITokiInvoice } from '../types';
import { redis } from 'erxes-api-shared/utils';
import * as QRCode from 'qrcode';

export const tokiCallbackHandler = async (models: IModels, data: any) => {
  const { traceOrderId, merchantId, status, amount } = data;

  if (!traceOrderId) {
    throw new Error('traceOrderId is required');
  }

  const transaction = await models.Transactions.getTransaction({
    _id: traceOrderId,
  });

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== 'toki') {
    throw new Error('Payment config type is mismatched');
  }

  // Validate merchantId and amount match original request
  if (payment.config.tokiMerchanId !== merchantId) {
    throw new Error('Merchant ID mismatch');
  }

  if (transaction.amount !== amount) {
    throw new Error('Amount mismatch');
  }

  // Status comes directly from callback - no need to call checkInvoice
  if (status !== 'APPROVED') {
    return transaction;
  }

  try {
    const api = new TokiAPI(payment.config);

    const invoiceStatus = await api.checkInvoice(transaction);

    if (invoiceStatus !== PAYMENT_STATUS.PAID) {
      return transaction;
    }

    await models.Transactions.updateOne(
      { _id: transaction._id },
      { status: PAYMENT_STATUS.PAID, updatedAt: new Date() },
    );

    return models.Transactions.getTransaction({ _id: transaction._id });
  } catch (e) {
    throw new Error(e.message);
  }
};

export interface ITokiConfig {
  tokiMerchanId: string;
  tokiUsername: string;
  tokiPassword: string;
}

export class TokiAPI extends BaseAPI {
  private tokiMerchanId: string;
  private tokiUsername: string;
  private tokiPassword: any;

  private domain?: string;

  constructor(config: ITokiConfig, domain?: string) {
    super(config);

    this.tokiPassword = config.tokiPassword;
    this.tokiUsername = config.tokiUsername;
    this.tokiMerchanId = config.tokiMerchanId;
    this.domain = domain;
    this.apiUrl = PAYMENTS.toki.apiUrl;
  }

  async authorize() {
    try {
      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.toki.actions.getToken,
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${this.tokiMerchanId}:${this.tokiUsername}`).toString(
              'base64',
            ),
        },
      }).then((r) => r.json());

      if (res.error) {
        if (res.error === 'NO_CREDENDIALS') {
          throw new Error(
            'Invalid credentials!!! Please check your credentials',
          );
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
    const token = await redis.get(`toki_token_${this.tokiMerchanId}`);

    if (token) {
      return {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      };
    }

    try {
      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.toki.actions.getToken,
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${this.tokiUsername}:${this.tokiPassword}`).toString(
              'base64',
            ),
        },
      }).then((r) => r.json());

      // Check for errors in the response
      if (res.error || res.code !== 200) {
        throw new Error(res.error?.message || 'Failed to get token');
      }

      // Access token from nested data object
      await redis.set(
        `toki_token_${this.tokiMerchanId}`,
        res.data.accessToken,
        'EX',
        3600,
      );

      return {
        Authorization: 'Bearer ' + res.data.accessToken,
        'Content-Type': 'application/json',
      };
    } catch (e) {
      console.error('error', e);
      throw new Error(e.message);
    }
  }

  async createInvoice(transaction: ITransactionDocument) {
    try {
      const data = {
        successUrl: `${this.domain}/callback/toki/payment-success?transactionId=${transaction._id}`,
        failureUrl: `${this.domain}/callback/toki/payment-failure?transactionId=${transaction._id}`,
        orderId: transaction.id, // Must be 24 characters or less
        amount: transaction.amount,
        notes: transaction.description || 'Payment',
        merchantId: this.tokiMerchanId, // From config
      };

      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.toki.actions.invoice,
        headers: await this.getHeaders(),
        data,
      }).then((r) => r.json());

      // Check for errors in response
      if (res.error || res.code !== 200) {
        throw new Error(res.error?.message || 'Failed to create invoice');
      }

      // Generate QR code from requestId text
      const qrDataUrl = await QRCode.toDataURL(res.data.requestId);

      // Return the requestId, transactionId, and generated QR code
      return {
        requestId: res.data.requestId,
        transactionId: res.data.transactionId,
        qrData: qrDataUrl, // PNG data URL
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  private async check(transaction) {
    try {
      const res = await this.request({
        method: 'GET',
        path: `${PAYMENTS.toki.actions.checkInvoice}/status?requestId=${transaction.response.transactionId}`,
        headers: await this.getHeaders(),
      }).then((r) => r.json());

      if (res.error || res.code !== 200) {
        throw new Error(res.error?.message || 'Failed to check invoice status');
      }

      switch (res.data.status) {
        case 'APPROVED':
          return PAYMENT_STATUS.PAID;
        case 'CANCELLED':
          return PAYMENT_STATUS.CANCELLED;
        case 'EXPIRED':
          return PAYMENT_STATUS.FAILED;
        default:
          return PAYMENT_STATUS.PENDING;
      }
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
      const res = await this.request({
        method: 'PATCH',
        path: `${PAYMENTS.toki.actions.cancelInvoice}/${invoice.response.requestId}`,
        headers: await this.getHeaders(),
      }).then((r) => r.json());

      if (res.error || res.code !== 200) {
        throw new Error(res.error?.message || 'Failed to cancel invoice');
      }

      return res.data;
    } catch (e) {
      return { error: e.message };
    }
  }
}
