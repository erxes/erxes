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

// ---- Untrusted input and provider replies ----

// Callback bodies come from outside, so every field is unknown until checked
export type TokiCallbackData = {
  // mini-program callback (per Toki's doc)
  orderID?: unknown;
  transactionID?: unknown;
  status?: unknown;
  statusCode?: unknown;
  transRequestId?: unknown;
  token?: unknown;
  amount?: unknown;
  // QR notification / success-failure redirect
  traceOrderId?: unknown;
  orderId?: unknown;
  transactionId?: unknown;
  merchantId?: unknown;
};

type TokiReply<T> = {
  code?: number;
  statusCode?: number;
  message?: string;
  error?: { message?: string };
  data?: T;
};

type TokiTokenData = { accessToken?: unknown };
type TokiQrData = { requestId?: unknown; transactionId?: unknown };
type TokiQrStatusData = { status?: unknown };
type TokiMiniProgramStatusData = {
  status?: unknown;
  orderId?: unknown;
  orderID?: unknown;
  amount?: unknown;
  merchantId?: unknown;
};

// What the shop page passes to Toki's buy() inside the Toki app
export type TokiMiniProgramData = {
  merchantId: string;
  amount: number;
  orderId: string;
  description: string;
  callbackUrl: string;
};

// Saved as transaction.response and read by the payment widget
export type TokiInvoiceResult = {
  miniProgram: TokiMiniProgramData;
  requestId?: string;
  transactionId?: string;
  qrData?: string;
  qrError?: string;
};

// A non-empty string or number from untrusted input, as a string
const asText = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
};

// A finite number from untrusted input ("5" and 5 both work)
const asAmount = (value: unknown): number | undefined => {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
};

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));

// Parses a provider reply; null when the body is not JSON
const readReply = async <T>(response: {
  json: () => Promise<unknown>;
}): Promise<TokiReply<T> | null> => {
  const body = await response.json().catch(() => null);
  return body && typeof body === 'object' ? (body as TokiReply<T>) : null;
};

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
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const { transRequestId, token } = parsed as Record<string, unknown>;
    const id = asText(transRequestId);
    const tok = asText(token);

    return id && tok ? { transRequestId: id, token: tok } : null;
  } catch {
    return null;
  }
};

// Remembers the Toki payment so check() can poll it later. An unverified
// callback never replaces one that is already stored; a verified one does.
const rememberMiniProgramPayment = async (
  transactionId: string,
  payment: MiniProgramPayment,
  verified: boolean,
) => {
  const key = miniProgramKey(transactionId);
  const value = JSON.stringify(payment);

  if (verified) {
    await redis.set(key, value, 'EX', MINI_PROGRAM_TTL);
  } else {
    await redis.set(key, value, 'EX', MINI_PROGRAM_TTL, 'NX');
  }
};

// How long a claimed Toki payment stays locked in Redis; the paid transaction
// keeps the id permanently (response.tokiTransRequestId) after that.
const CLAIM_TTL = 365 * 24 * 60 * 60;

// One Toki payment (transRequestId) may settle only one erxes transaction.
// Toki's status check does not say which order a payment was for, so without
// this the same completed payment could be replayed against other orders.
const claimMiniProgramPayment = async (
  models: IModels,
  transactionId: string,
  transRequestId: string,
) => {
  const claimKey = `toki_mp_claim_${transRequestId}`;

  await redis.set(claimKey, transactionId, 'EX', CLAIM_TTL, 'NX');
  const owner = await redis.get(claimKey);

  const settledElsewhere = await models.Transactions.findOne({
    _id: { $ne: transactionId },
    'response.tokiTransRequestId': transRequestId,
  });

  if ((owner && owner !== transactionId) || settledElsewhere) {
    throw new Error('This Toki payment was already used for another order');
  }
};

// The one place a verified mini-program payment is settled, used by both
// Toki's callback and status polling: claim the Toki payment for this
// transaction, then record it on the transaction so the binding outlives the
// Redis claim. Call only after Toki has confirmed the payment as paid.
const settleMiniProgramPayment = async (
  models: IModels,
  transactionId: string,
  payment: MiniProgramPayment,
) => {
  await claimMiniProgramPayment(models, transactionId, payment.transRequestId);

  await models.Transactions.updateOne(
    { _id: transactionId },
    { $set: { 'response.tokiTransRequestId': payment.transRequestId } },
  );

  await rememberMiniProgramPayment(transactionId, payment, true);
};

const markPaid = async (
  models: IModels,
  transaction: ITransactionDocument,
  extra: Record<string, unknown> = {},
) => {
  await models.Transactions.updateOne(
    { _id: transaction._id },
    { $set: { status: PAYMENT_STATUS.PAID, updatedAt: new Date(), ...extra } },
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

// QR statuses after which the payment can no longer succeed
const QR_TERMINAL_STATUSES: string[] = [
  PAYMENT_STATUS.CANCELLED,
  PAYMENT_STATUS.FAILED,
  PAYMENT_STATUS.EXPIRED,
];

// Mini-program callback, per Toki's doc:
// { orderID, transactionID, status, statusCode, transRequestId, token, amount }
const miniProgramCallback = async (
  models: IModels,
  data: TokiCallbackData,
) => {
  const orderID = asText(data.orderID);
  const transRequestId = asText(data.transRequestId);
  const token = asText(data.token);
  const amount = asAmount(data.amount);

  if (!orderID) {
    throw new Error('orderID is required');
  }

  const { transaction, payment } = await getTokiTransaction(models, orderID);

  if (transaction.status === PAYMENT_STATUS.PAID) {
    return transaction;
  }

  if (amount === undefined || amount !== Number(transaction.amount)) {
    throw new Error('Amount mismatch');
  }

  if (!transRequestId || !token) {
    throw new Error('transRequestId and token are required');
  }

  const supplied: MiniProgramPayment = { transRequestId, token };

  const transactionId = String(transaction._id);

  // Source of truth: Toki must say the payment is COMPLETED. If Toki's reply
  // names an order, amount or merchant, they must match this transaction.
  const status = await new TokiAPI(
    payment.config,
    undefined,
    models,
  ).checkMiniProgramPayment(transaction, supplied);

  if (status !== PAYMENT_STATUS.PAID) {
    // Unverified: kept for later polling, never replaces a stored payment,
    // and claims nothing
    await rememberMiniProgramPayment(transactionId, supplied, false);
    return transaction;
  }

  // Rejects a Toki payment that was already used for another order
  await settleMiniProgramPayment(models, transactionId, supplied);

  return markPaid(models, transaction);
};

// QR flow: Toki's notification or the success/failure redirect
const qrCallback = async (models: IModels, data: TokiCallbackData) => {
  const id =
    asText(data.traceOrderId) ||
    asText(data.orderId) ||
    asText(data.transactionId);
  const merchantId = asText(data.merchantId);
  const amount = asAmount(data.amount);

  if (!id) {
    throw new Error('transaction id is required');
  }

  const { transaction, payment } = await getTokiTransaction(models, id);

  if (
    merchantId &&
    payment.config.tokiMerchantId &&
    merchantId !== payment.config.tokiMerchantId
  ) {
    throw new Error('Merchant ID mismatch');
  }

  if (
    data.amount !== undefined &&
    amount !== Number(transaction.amount)
  ) {
    throw new Error('Amount mismatch');
  }

  const status = await new TokiAPI(
    payment.config,
    undefined,
    models,
  ).checkInvoice(transaction);

  if (status === PAYMENT_STATUS.PAID) {
    return markPaid(models, transaction);
  }

  // Cancelled, failed or expired at Toki: record it, so the customer sees the
  // outcome instead of a payment that stays pending. Never downgrades a paid one.
  if (QR_TERMINAL_STATUSES.includes(status)) {
    await models.Transactions.updateOne(
      { _id: transaction._id, status: PAYMENT_STATUS.PENDING },
      { $set: { status, updatedAt: new Date() } },
    );

    return models.Transactions.getTransaction({ _id: transaction._id });
  }

  return transaction;
};

export const tokiCallbackHandler = async (
  models: IModels,
  data: TokiCallbackData,
) => {
  try {
    if (asText(data.orderID) || asText(data.transRequestId)) {
      return await miniProgramCallback(models, data);
    }

    return await qrCallback(models, data);
  } catch (e) {
    console.error('[TOKI][CALLBACK] Error', e);
    throw new Error(`Toki callback failed: ${errorMessage(e)}`);
  }
};

/**
 * Settings rules shared by add (`authorize`) and edit (`paymentEdit`):
 * a merchant ID is required unless the environment is staging, and the QR
 * username and password are set together or not at all.
 */
export const validateTokiConfig = (config: {
  tokiMerchantId?: unknown;
  tokiEnvironment?: unknown;
  tokiUsername?: unknown;
  tokiPassword?: unknown;
}) => {
  if (!asText(config.tokiMerchantId) && config.tokiEnvironment !== 'staging') {
    throw new Error('Merchant ID is required');
  }

  if (!!asText(config.tokiUsername) !== !!asText(config.tokiPassword)) {
    throw new Error(
      'Fill in both username and password for Toki QR, or leave both empty',
    );
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
  // Needed to settle mini-program payments found by status polling
  private models?: IModels;
  // The settings as saved, for validation in authorize()
  private settings: ITokiConfig;

  constructor(config: ITokiConfig, domain?: string, models?: IModels) {
    super(config);

    this.models = models;
    this.settings = config;

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
    validateTokiConfig(this.settings);

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

    const res = await readReply<TokiTokenData>(response);
    const accessToken = asText(res?.data?.accessToken);

    if (response.status !== 200 || res?.error || !accessToken) {
      console.error('[TOKI][AUTH] Login failed', {
        status: response.status,
        merchantId: this.merchantId,
        username: this.username,
        error: res?.error?.message,
      });

      throw new Error(
        `Toki login failed (HTTP ${response.status}): ${
          res?.error?.message || 'unknown error'
        }`,
      );
    }

    // The token lasts 14 days; refresh hourly to be safe
    await redis.set(cacheKey, accessToken, 'EX', 3600);

    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async createInvoice(transaction: ITransactionDocument) {
    const transactionId = String(transaction._id);
    const description = transaction.description || 'Payment';

    // What the shop page passes to Toki's buy() inside the Toki app
    const result: TokiInvoiceResult = {
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
      result.qrError = errorMessage(e);
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

    const res = await readReply<TokiQrData>(response);

    if (!res) {
      throw new Error(`Toki returned a non-JSON response (HTTP ${response.status})`);
    }

    if (res.error || res.code !== 200) {
      throw new Error(
        res.error?.message || `Failed to create Toki QR (HTTP ${response.status})`,
      );
    }

    const requestId = asText(res.data?.requestId);

    if (!requestId) {
      throw new Error('Toki QR response has no requestId');
    }

    return {
      requestId,
      transactionId: asText(res.data?.transactionId),
      qrData: await QRCode.toDataURL(requestId),
    };
  }

  // Paid only when Toki confirms COMPLETED for this order id and amount
  async checkMiniProgramPayment(
    transaction: ITransactionDocument,
    { transRequestId, token }: MiniProgramPayment,
  ) {
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

    const res = await readReply<TokiMiniProgramStatusData>(response);

    if (!res || res.statusCode !== 200) {
      throw new Error(
        res?.message ||
          `Toki transaction-status failed (HTTP ${response.status})`,
      );
    }

    const data: TokiMiniProgramStatusData = res.data || {};

    if (data.status !== 'COMPLETED') {
      return PAYMENT_STATUS.PENDING;
    }

    // Toki's documented reply is only { status }. If it does name the order,
    // amount or merchant, they must match this transaction.
    const providerOrderId = data.orderId ?? data.orderID;
    const providerMerchantId = asText(data.merchantId);

    if (
      providerOrderId !== undefined &&
      asText(providerOrderId) !== String(transaction._id)
    ) {
      throw new Error('Toki payment belongs to another order');
    }

    if (
      data.amount !== undefined &&
      asAmount(data.amount) !== Number(transaction.amount)
    ) {
      throw new Error('Toki payment amount does not match');
    }

    if (
      data.merchantId !== undefined &&
      providerMerchantId !== this.merchantId
    ) {
      throw new Error('Toki payment merchant does not match');
    }

    return PAYMENT_STATUS.PAID;
  }

  private async checkQr(requestId: string) {
    const response = await this.request({
      method: 'GET',
      path: `${PAYMENTS.toki.actions.checkInvoice}/status`,
      params: { requestId },
      headers: await this.getHeaders(),
    });

    const res = await readReply<TokiQrStatusData>(response);

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
        return PAYMENT_STATUS.EXPIRED;
      default:
        return PAYMENT_STATUS.PENDING;
    }
  }

  private async check(transaction: ITransactionDocument) {
    try {
      // Paid inside the Toki app: Toki's callback stored these
      const transactionId = String(transaction._id);
      const miniProgram = await getMiniProgramPayment(transactionId);
      if (miniProgram) {
        const status = await this.checkMiniProgramPayment(
          transaction,
          miniProgram,
        );

        if (status !== PAYMENT_STATUS.PAID) {
          return status;
        }

        // Without models the payment cannot be claimed, so it is not paid yet
        if (!this.models) {
          console.warn('[TOKI][CHECK] No models; cannot settle', transactionId);
          return PAYMENT_STATUS.PENDING;
        }

        await settleMiniProgramPayment(this.models, transactionId, miniProgram);

        return PAYMENT_STATUS.PAID;
      }

      const requestId = transaction.response?.requestId;
      if (requestId && this.hasQrCredentials) {
        return await this.checkQr(requestId);
      }

      // Nothing to check yet (mini-program payment without a callback so far)
      return PAYMENT_STATUS.PENDING;
    } catch (e) {
      console.error('[TOKI][CHECK] Error', e);
      throw new Error(errorMessage(e));
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

      const res = await readReply<unknown>(response);

      if (!res || res.error || res.code !== 200) {
        throw new Error(res?.error?.message || 'Failed to cancel Toki QR');
      }

      return res.data;
    } catch (e) {
      console.error('[TOKI][CANCEL] Error', e);
      return { error: errorMessage(e) };
    }
  }
}
