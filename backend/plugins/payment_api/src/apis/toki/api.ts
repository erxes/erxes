import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { BaseAPI } from '~/apis/base';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { ITokiInvoice } from '../types';
import { redis } from 'erxes-api-shared/utils';
import * as QRCode from 'qrcode';

export const tokiCallbackHandler = async (models: IModels, data: any) => {
  console.log('[TOKI][CALLBACK] Handler called', data);

  const { traceOrderId, merchantId, status, amount } = data;

  if (!traceOrderId) {
    throw new Error('traceOrderId is required');
  }

  console.log('[TOKI][CALLBACK] traceOrderId:', traceOrderId);

  const transaction = await models.Transactions.getTransaction({
    _id: traceOrderId,
  });

  console.log('[TOKI][CALLBACK] Transaction:', transaction);

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  console.log('[TOKI][CALLBACK] Payment:', {
    paymentId: payment._id,
    kind: payment.kind,
    merchantId: payment.config.tokiMerchantId,
  });

  if (payment.kind !== 'toki') {
    throw new Error('Payment config type is mismatched');
  }

  if (payment.config.tokiMerchantId !== merchantId) {
    throw new Error('Merchant ID mismatch');
  }

  if (transaction.amount !== amount) {
    throw new Error('Amount mismatch');
  }

  console.log('[TOKI][CALLBACK] Callback values:', {
    merchantId,
    status,
    amount,
  });

  if (status !== 'APPROVED') {
    return transaction;
  }

  try {
    console.log('[TOKI][CALLBACK] Creating TokiAPI');
    const api = new TokiAPI(payment.config);

    console.log('[TOKI][CALLBACK] Invoice status check...');
    const invoiceStatus = await api.checkInvoice(transaction);

    console.log('[TOKI][CALLBACK] Invoice status:', invoiceStatus);

    if (invoiceStatus !== PAYMENT_STATUS.PAID) {
      return transaction;
    }

    console.log('[TOKI][CALLBACK] Updating transaction to PAID');
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

    console.log('[TOKI] Constructor', {
      apiUrl: PAYMENTS.toki.apiUrl,
      merchantId: config.tokiMerchantId,
      username: config.tokiUsername,
      hasPassword: !!config.tokiPassword,
      domain,
    });
  }

  async authorize() {
    console.log('[TOKI][AUTH] authorize()');
    try {
      console.log('[TOKI][AUTH] Request', {
        apiUrl: this.apiUrl,
        path: PAYMENTS.toki.actions.getToken,
      });

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

      console.log('[TOKI][AUTH] Response', res);

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
    console.log('[TOKI][HEADERS] getHeaders()');

    const cacheKey = `toki_token_${this.tokiMerchantId}`;
    console.log('[TOKI][HEADERS] cacheKey:', cacheKey);

    const token = await redis.get(cacheKey);
    console.log('[TOKI][HEADERS] cached token:', !!token);

    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }

    const basicToken = Buffer.from(
      `${this.tokiUsername}:${this.tokiPassword}`,
    ).toString('base64');

    console.log('[TOKI][HEADERS] has basic token:', !!basicToken);

    if (!basicToken) {
      throw new Error('tokiBasicToken is not configured');
    }

    try {
      console.log('[TOKI][HEADERS] Request', {
        apiUrl: this.apiUrl,
        path: '/third-party-service/v1/auth/token',
        merchantId: this.tokiMerchantId,
        username: this.tokiUsername,
      });

      const response = await this.request({
        method: 'GET',
        path: '/third-party-service/v1/auth/token',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${basicToken}`,
        },
      });

      console.log('[TOKI][HEADERS] HTTP status:', response.status);

      const res = await response.json().catch(() => ({}));

      console.log('[TOKI][HEADERS] Body:', res);

      if (response.status !== 200 || res.error || !res.data?.accessToken) {
        throw new Error(
          `Token request failed: ${response.status} - ${
            res.error?.message || JSON.stringify(res)
          }`,
        );
      }

      console.log('[TOKI][HEADERS] Access token received successfully');

      console.log('[TOKI][HEADERS] Saving token to redis');
      await redis.set(cacheKey, res.data.accessToken, 'EX', 3600);

      return {
        Authorization: `Bearer ${res.data.accessToken}`,
        'Content-Type': 'application/json',
      };
    } catch (e: any) {
      console.error('[TOKI][HEADERS] Error', e);

      console.error('[TOKI] Failed to get access token', {
        apiUrl: this.apiUrl,
        merchantId: this.tokiMerchantId,
        username: this.tokiUsername,
        error: e.message,
      });

      throw new Error(`Failed to get Toki access token: ${e.message}`);
    }
  }

  async createInvoice(transaction: ITransactionDocument) {
    console.log('[TOKI][CREATE] createInvoice()', {
      transactionId: transaction._id,
      paymentId: transaction.paymentId,
    });

    try {
      const data = {
        successUrl: `${this.domain}/callback/toki/payment-success?transactionId=${transaction._id}`,
        failureUrl: `${this.domain}/callback/toki/payment-failure?transactionId=${transaction._id}`,
        orderId: transaction.id,
        amount: transaction.amount,
        notes: transaction.description || 'Payment',
        merchantId: this.tokiMerchantId,
      };

      console.log('[TOKI][CREATE] Request payload', data);

      console.log('[TOKI][CREATE] Calling getHeaders()');
      const headers = await this.getHeaders();
      console.log('[TOKI][CREATE] Headers received');

      console.log('[TOKI][CREATE] Calling invoice API');
      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.toki.actions.invoice,
        headers,
        data,
      }).then((r) => r.json());

      console.log('[TOKI][CREATE] Invoice response', res);

      if (res.error || res.code !== 200) {
        throw new Error(res.error?.message || 'Failed to create invoice');
      }

      console.log('[TOKI][CREATE] QR generated');
      const qrDataUrl = await QRCode.toDataURL(res.data.requestId);

      const result = {
        requestId: res.data.requestId,
        transactionId: res.data.transactionId,
        qrData: qrDataUrl,
      };

      console.log('[TOKI][CREATE] Success', {
        requestId: result.requestId,
        transactionId: result.transactionId,
      });

      return result;
    } catch (e) {
      console.error('[TOKI][CREATE] Error', e);
      return { error: e.message };
    }
  }

  private async check(transaction: ITransactionDocument) {
    console.log('[TOKI][CHECK] check()', {
      transactionId: transaction._id,
      response: transaction.response,
    });

    try {
      const res = await this.request({
        method: 'GET',
        path: `${PAYMENTS.toki.actions.checkInvoice}/status?requestId=${transaction.response.transactionId}`,
        headers: await this.getHeaders(),
      }).then((r) => r.json());

      console.log('[TOKI][CHECK] Response', res);

      if (res.error || res.code !== 200) {
        throw new Error(res.error?.message || 'Failed to check invoice status');
      }

      console.log('[TOKI][CHECK] Status:', res.data?.status);

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
    console.log('[TOKI][CANCEL] cancelInvoice()', invoice._id);

    try {
      const res = await this.request({
        method: 'PATCH',
        path: `${PAYMENTS.toki.actions.cancelInvoice}/${invoice.response.requestId}`,
        headers: await this.getHeaders(),
      }).then((r) => r.json());

      console.log('[TOKI][CANCEL] Response', res);

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