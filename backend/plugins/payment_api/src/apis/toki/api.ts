import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { BaseAPI } from '~/apis/base';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
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

  if (payment.config.tokiMerchantId !== merchantId) {
    throw new Error('Merchant ID mismatch');
  }

  if (transaction.amount !== amount) {
    throw new Error('Amount mismatch');
  }


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
    console.error('[TOKI][CALLBACK] Error', e);
    throw new Error(`Toki payment verification failed: ${e.message}`);
  }
};

export interface ITokiConfig {
  tokiMerchantId: string;
  tokiUsername: string;
  tokiPassword: string;
}

export class TokiAPI extends BaseAPI {
  private tokiMerchantId: string;
  private tokiUsername: string;
  private tokiPassword: string;

  private domain?: string;

  constructor(config: ITokiConfig, domain?: string) {
    super(config);

    this.tokiPassword = config.tokiPassword;
    this.tokiUsername = config.tokiUsername;
    this.tokiMerchantId = config.tokiMerchantId;
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
            Buffer.from(`${this.tokiUsername}:${this.tokiPassword}`).toString(
              'base64',
            ),
        },
      }).then((r) => r.json());


      if (res.error) {
        if (res.error === 'NO_CREDENTIALS') {
          throw new Error(
            'Invalid credentials!!! Please check your credentials',
          );
        }

        throw new Error(res.error);
      }

      return { success: true, message: 'Authorized' };
    } catch (e) {
      console.error('[TOKI][AUTH] Error', e);
      throw new Error(e.message);
    }
  }

  async getHeaders() {

    const cacheKey = `toki_token_${this.tokiMerchantId}`;

    const token = await redis.get(cacheKey);

    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }

    const basicToken = Buffer.from(
      `${this.tokiUsername}:${this.tokiPassword}`,
    ).toString('base64');


    if (!basicToken) {
      throw new Error('tokiBasicToken is not configured');
    }

    try {

      const response = await this.request({
        method: 'GET',
        path: '/third-party-service/v1/auth/token',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${basicToken}`,
        },
      });


      const res = await response.json().catch(() => ({}));

      // Security: do not log raw response body, just token presence

      if (response.status !== 200 || res.error || !res.data?.accessToken) {
        throw new Error(
          `Token request failed: ${response.status} - ${
            res.error?.message || JSON.stringify(res)
          }`,
        );
      }


      await redis.set(cacheKey, res.data.accessToken, 'EX', 3600);

      return {
        Authorization: `Bearer ${res.data.accessToken}`,
        'Content-Type': 'application/json',
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('[TOKI][HEADERS] Error', { message });

      console.error('[TOKI] Failed to get access token', {
        apiUrl: this.apiUrl,
        merchantId: this.tokiMerchantId,
        username: this.tokiUsername,
        error: message,
      });

      throw new Error(`Failed to get Toki access token: ${message}`);
    }
  }

  async createInvoice(transaction: ITransactionDocument) {

    try {
      const data = {
        successUrl: `${this.domain}/callback/toki/payment-success?transactionId=${transaction._id}`,
        failureUrl: `${this.domain}/callback/toki/payment-failure?transactionId=${transaction._id}`,
        orderId: transaction.id,
        amount: transaction.amount,
        notes: transaction.description || 'Payment',
        merchantId: this.tokiMerchantId,
      };


      const headers = await this.getHeaders();

      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.toki.actions.invoice,
        headers,
        data,
      }).then((r) => r.json());


      if (res.error || res.code !== 200) {
        throw new Error(res.error?.message || 'Failed to create invoice');
      }

      const qrDataUrl = await QRCode.toDataURL(res.data.requestId);

      const result = {
        requestId: res.data.requestId,
        transactionId: res.data.transactionId,
        qrData: qrDataUrl,
      };


      return result;
    } catch (e) {
      console.error('[TOKI][CREATE] Error', e);
      return { error: e.message };
    }
  }

  private async check(transaction: ITransactionDocument) {

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
      console.error('[TOKI][CHECK] Error', e);
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
      console.error('[TOKI][CANCEL] Error', e);
      return { error: e.message };
    }
  }
}