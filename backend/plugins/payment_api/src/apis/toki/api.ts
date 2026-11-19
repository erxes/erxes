import fetch from 'node-fetch';
import * as QRCode from 'qrcode';
import { redis } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { BaseAPI } from '~/apis/base';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';

/**
 * One Toki payment method, two ways to pay:
 *
 * 1. Mini program: the shop page runs inside the Toki app and calls Toki's
 *    `buy()` bridge with the data returned by createInvoice(). Toki then POSTs
 *    { orderID, transRequestId, token, amount, ... } to our callback.
 *    Needs only the merchant id.
 * 2. QR (merchant QR): erxes creates a QR through Toki's third-party API.
 *    Needs a username and password, so it is only used when both are set.
 *
 * The widget picks the flow: Toki bridge present -> mini program, else QR.
 */

// Static key from Toki's mini-program doc; the same for every merchant
const MINI_PROGRAM_API_KEY = 'shoppy123';
// Toki's fixed merchant id for its staging environment
const STAGING_MERCHANT_ID = '61adea785b8283f5752485b3';
// The customer token from the callback stays valid until Toki issues a new one
const MINI_PROGRAM_TTL = 7 * 24 * 60 * 60;

// The customer's token is kept in Redis, not in transaction.response,
// because transaction.response is readable through GraphQL.
const miniProgramKey = (transactionId: string) => `toki_mp_${transactionId}`;

type MiniProgramPayment = { transRequestId: string; token: string };

const getMiniProgramPayment = async (
  transactionId: string,
): Promise<MiniProgramPayment | null> => {
  const raw = await redis.get(miniProgramKey(transactionId));
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const markPaid = async (models: IModels, transaction: ITransactionDocument) => {
  await models.Transactions.updateOne(
    { _id: transaction._id },
    { status: PAYMENT_STATUS.PAID, updatedAt: new Date() },
  );

  return models.Transactions.getTransaction({ _id: transaction._id });
};

const getTokiTransaction = async (models: IModels, _id: string) => {
  const transaction = await models.Transactions.getTransaction({ _id });
  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== PAYMENTS.toki.kind) {
    throw new Error('Payment config type is mismatched');
  }

  return { transaction, payment };
};

// Mini-program callback, per Toki's doc:
// { orderID, transactionID, status, statusCode, transRequestId, token, amount }
const miniProgramCallback = async (models: IModels, data: any) => {
  const { orderID, transRequestId, token, amount } = data;

  if (!orderID) {
    throw new Error('orderID is required');
  }

  const { transaction, payment } = await getTokiTransaction(models, orderID);

  if (amount !== undefined && Number(amount) !== Number(transaction.amount)) {
    throw new Error('Amount mismatch');
  }

  if (!transRequestId || !token) {
    throw new Error('transRequestId and token are required');
  }

  await redis.set(
    miniProgramKey(String(transaction._id)),
    JSON.stringify({ transRequestId, token }),
    'EX',
    MINI_PROGRAM_TTL,
  );

  // Source of truth: ask Toki, never trust the callback body alone
  const status = await new TokiAPI(payment.config).checkInvoice(transaction);

  if (status !== PAYMENT_STATUS.PAID) {
    return transaction;
  }

  return markPaid(models, transaction);
};

// QR flow: Toki's notification or the success/failure redirect
const qrCallback = async (models: IModels, data: any) => {
  const id = data.traceOrderId || data.orderId || data.transactionId;

  if (!id) {
    throw new Error('transaction id is required');
  }

  const { transaction, payment } = await getTokiTransaction(models, id);

  if (
    data.merchantId &&
    payment.config.tokiMerchantId &&
    data.merchantId !== payment.config.tokiMerchantId
  ) {
    throw new Error('Merchant ID mismatch');
  }

  if (
    data.amount !== undefined &&
    Number(data.amount) !== Number(transaction.amount)
  ) {
    throw new Error('Amount mismatch');
  }

  const status = await new TokiAPI(payment.config).checkInvoice(transaction);

  if (status !== PAYMENT_STATUS.PAID) {
    return transaction;
  }

  return markPaid(models, transaction);
};

export const tokiCallbackHandler = async (models: IModels, data: any) => {
  try {
    if (data.orderID || data.transRequestId) {
      return await miniProgramCallback(models, data);
    }

    return await qrCallback(models, data);
  } catch (e) {
    console.error('[TOKI][CALLBACK] Error', e);
    throw new Error(`Toki callback failed: ${e.message}`);
  }
};

export interface ITokiConfig {
  tokiMerchantId: string;
  tokiEnvironment?: 'production' | 'staging';
  // QR only; leave both empty to use the mini program only
  tokiUsername?: string;
  tokiPassword?: string;
}

export class TokiAPI extends BaseAPI {
  private merchantId: string;
  private environment: 'production' | 'staging';
  private username?: string;
  private password?: string;
  private domain?: string;

  constructor(config: ITokiConfig, domain?: string) {
    super(config);

    this.environment =
      config.tokiEnvironment === 'staging' ? 'staging' : 'production';
    this.merchantId =
      config.tokiMerchantId ||
      (this.environment === 'staging' ? STAGING_MERCHANT_ID : '');
    this.username = config.tokiUsername;
    this.password = config.tokiPassword;
    this.domain = domain;
    this.apiUrl = PAYMENTS.toki.apiUrl;
  }

  private get hasQrCredentials() {
    return !!(this.username && this.password);
  }

  private get callbackUrl() {
    return `${this.domain}/pl:payment/callback/${PAYMENTS.toki.kind}`;
  }

  // Runs when the payment method is saved
  async authorize() {
    if (!this.merchantId) {
      throw new Error('Merchant ID is required');
    }

    if (!!this.username !== !!this.password) {
      throw new Error(
        'Fill in both username and password for Toki QR, or leave both empty',
      );
    }

    if (!this.hasQrCredentials) {
      return { success: true, message: 'Mini program only' };
    }

    // Throws with Toki's message if the login is rejected
    await this.getHeaders();

    return { success: true, message: 'Authorized' };
  }

  // QR flow only: logs in to Toki's third-party API
  async getHeaders() {
    if (!this.hasQrCredentials) {
      throw new Error('Toki QR username and password are not configured');
    }

    const cacheKey = `toki_token_${this.merchantId}_${this.username}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return {
        Authorization: `Bearer ${cached}`,
        'Content-Type': 'application/json',
      };
    }

    const basicToken = Buffer.from(
      `${this.username}:${this.password}`,
    ).toString('base64');

    const response = await this.request({
      method: 'GET',
      path: PAYMENTS.toki.actions.getToken,
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${basicToken}`,
      },
    });

    const res: any = await response.json().catch(() => ({}));

    if (response.status !== 200 || res.error || !res.data?.accessToken) {
      console.error('[TOKI][AUTH] Login failed', {
        status: response.status,
        merchantId: this.merchantId,
        username: this.username,
        error: res.error?.message,
      });

      throw new Error(
        `Toki login failed (HTTP ${response.status}): ${
          res.error?.message || 'unknown error'
        }`,
      );
    }

    // The token lasts 14 days; refresh hourly to be safe
    await redis.set(cacheKey, res.data.accessToken, 'EX', 3600);

    return {
      Authorization: `Bearer ${res.data.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async createInvoice(transaction: ITransactionDocument) {
    const transactionId = String(transaction._id);
    const description = transaction.description || 'Payment';

    // What the shop page passes to Toki's buy() inside the Toki app
    const result: any = {
      miniProgram: {
        merchantId: this.merchantId,
        amount: transaction.amount,
        orderId: transactionId,
        description,
        callbackUrl: this.callbackUrl,
      },
    };

    if (!this.hasQrCredentials) {
      return result;
    }

    try {
      Object.assign(
        result,
        await this.createQr(transactionId, transaction.amount, description),
      );
    } catch (e) {
      console.error('[TOKI][CREATE QR] Error', e);
      result.qrError = e.message;
    }

    return result;
  }

  private async createQr(
    transactionId: string,
    amount: number,
    description: string,
  ) {
    const returnUrl = `${this.callbackUrl}?transactionId=${transactionId}`;

    const response = await this.request({
      method: 'POST',
      path: PAYMENTS.toki.actions.invoice,
      headers: await this.getHeaders(),
      data: {
        successUrl: returnUrl,
        failureUrl: returnUrl,
        orderId: transactionId,
        amount,
        notes: description,
        merchantId: this.merchantId,
      },
    });

    const res: any = await response.json().catch(() => null);

    if (!res) {
      throw new Error(`Toki returned a non-JSON response (HTTP ${response.status})`);
    }

    if (res.error || res.code !== 200) {
      throw new Error(
        res.error?.message || `Failed to create Toki QR (HTTP ${response.status})`,
      );
    }

    if (!res.data?.requestId) {
      throw new Error('Toki QR response has no requestId');
    }

    return {
      requestId: res.data.requestId,
      transactionId: res.data.transactionId,
      qrData: await QRCode.toDataURL(res.data.requestId),
    };
  }

  private async checkMiniProgram({ transRequestId, token }: MiniProgramPayment) {
    const baseUrl = PAYMENTS.toki.miniProgramUrl[this.environment];
    const url = `${baseUrl}/jump/v1/shoppy/transaction-status?transRequestId=${encodeURIComponent(
      transRequestId,
    )}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `bearer ${token}`,
        im_api_key: MINI_PROGRAM_API_KEY,
      },
    });

    const res: any = await response.json().catch(() => null);

    if (!res || res.statusCode !== 200) {
      throw new Error(
        res?.message ||
          `Toki transaction-status failed (HTTP ${response.status})`,
      );
    }

    return res.data?.status === 'COMPLETED'
      ? PAYMENT_STATUS.PAID
      : PAYMENT_STATUS.PENDING;
  }

  private async checkQr(requestId: string) {
    const response = await this.request({
      method: 'GET',
      path: `${PAYMENTS.toki.actions.checkInvoice}/status`,
      params: { requestId },
      headers: await this.getHeaders(),
    });

    const res: any = await response.json().catch(() => null);

    if (!res || res.error || res.code !== 200) {
      throw new Error(
        res?.error?.message ||
          `Failed to check Toki QR status (HTTP ${response.status})`,
      );
    }

    switch (res.data?.status) {
      case 'APPROVED':
        return PAYMENT_STATUS.PAID;
      case 'CANCELLED':
        return PAYMENT_STATUS.CANCELLED;
      case 'EXPIRED':
        return PAYMENT_STATUS.FAILED;
      default:
        return PAYMENT_STATUS.PENDING;
    }
  }

  private async check(transaction: ITransactionDocument) {
    try {
      // Paid inside the Toki app: Toki's callback stored these
      const miniProgram = await getMiniProgramPayment(String(transaction._id));
      if (miniProgram) {
        return await this.checkMiniProgram(miniProgram);
      }

      const requestId = transaction.response?.requestId;
      if (requestId && this.hasQrCredentials) {
        return await this.checkQr(requestId);
      }

      // Nothing to check yet (mini-program payment without a callback so far)
      return PAYMENT_STATUS.PENDING;
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

  async cancelInvoice(transaction: ITransactionDocument) {
    const requestId = transaction.response?.requestId;

    // Mini-program payments have nothing to cancel on Toki's side
    if (!requestId || !this.hasQrCredentials) {
      return {};
    }

    try {
      const response = await this.request({
        method: 'PATCH',
        path: `${PAYMENTS.toki.actions.cancelInvoice}/${requestId}`,
        headers: await this.getHeaders(),
      });

      const res: any = await response.json().catch(() => null);

      if (!res || res.error || res.code !== 200) {
        throw new Error(res?.error?.message || 'Failed to cancel Toki QR');
      }

      return res.data;
    } catch (e) {
      console.error('[TOKI][CANCEL] Error', e);
      return { error: e.message };
    }
  }
}
