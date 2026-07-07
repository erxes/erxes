import { IModels } from '~/connectionResolvers';
import { BaseAPI } from '~/apis/base';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import {
  graphqlPubsub,
  isEnabled,
  sendWorkerMessage,
} from 'erxes-api-shared/utils';
import { splitType } from 'erxes-api-shared/core-modules';

//  TYPES
export interface ITDBConfig {
  username: string;
  password: string;
  apiUrl?: string;
}

export interface ITDBCreateOrderRequest {
  typeRid?: 'purch';
  amount: number;
  currency: string;
  description: string;
  language?: string;
  hppRedirectUrl: string;
}

export interface ITDBCreateOrderResponse {
  order: {
    id: number;
    password: string;
    hppUrl: string;
  };
}

export interface ITDBOrderDetail {
  id: number;
  typeRid: string;
  status: string;
  prevStatus: string;
  lastStatusLogin: string;
  amount: number;
  currency: string;
  createTime: string;
  type: { title: string };
}

export interface ITDBGetOrderDetailResponse {
  order: ITDBOrderDetail;
}

export interface ITDBErrorResponse {
  errorCode: string;
  errorDescription: string;
}

export interface ITDBCallbackQuery {
  ID: string;
  STATUS: string;
}

// HELPERS
const buildBasicAuth = (username: string, password: string): string => {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
};

//  CALLBACK HANDLER
export const tdbCallbackHandler = async (
  models: IModels,
  subdomain: string,
  data: ITDBCallbackQuery,
): Promise<ITransactionDocument> => {
  console.log('========== TDB CALLBACK ==========');
  console.log('Callback payload:', data);

  const { ID, STATUS } = data;

  console.log('Order ID:', ID);
  console.log('Callback STATUS:', STATUS);

  if (!ID || !STATUS) {
    throw new Error('Missing ID or STATUS in callback query parameters');
  }

  const transaction = await models.Transactions.findOne({
    $or: [
      { code: ID },
      { code: Number(ID) },
      { 'response.order.id': ID },
      { 'response.order.id': Number(ID) },
    ],
  });

  console.log('Transaction found:', !!transaction);

  if (transaction) {
    console.log({
      transactionId: transaction._id,
      invoiceId: transaction.invoiceId,
      paymentId: transaction.paymentId,
      paymentKind: transaction.paymentKind,
      status: transaction.status,
      responseOrderId: transaction.response?.order?.id,
    });
  }

  if (!transaction) {
    throw new Error(`Transaction not found for TDB order ID: ${ID}`);
  }

  if (transaction.status === PAYMENT_STATUS.PAID) {
    console.log('Transaction already paid. Returning.');
    return transaction;
  }

  console.log('Loading payment method...');
  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);
  console.log('Payment kind:', payment.kind);

  const api = new TDBAPI(payment.config, process.env.DOMAIN || '');

  console.log('Checking TDB order...');
  const orderDetail = await api.checkInvoice(transaction);

  console.log('Order detail:', orderDetail);

  if (!orderDetail) {
    console.log('No order detail returned.');
    return transaction;
  }

  const invoice = await models.Invoices.getInvoice({
    _id: transaction.invoiceId,
  });

  console.log({
    invoiceId: invoice._id,
    invoiceStatus: invoice.status,
    invoiceAmount: invoice.amount,
    invoiceCurrency: invoice.currency,
  });

  console.log({
    tdbAmount: orderDetail.amount,
    tdbCurrency: orderDetail.currency,
    tdbStatus: orderDetail.status,
    tdbPrevStatus: orderDetail.prevStatus,
  });

  const status = (orderDetail.status || '').toUpperCase();
  const prevStatus = (orderDetail.prevStatus || '').toUpperCase();

  const isPaid =
    status === 'FULLYPAID' ||
    status === 'PARTPAID' ||
    status === 'AUTHORIZED' ||
    status === 'PAID' ||
    (status === 'CLOSED' && prevStatus === 'FULLYPAID');

  console.log('isPaid =', isPaid);

  if (isPaid && transaction.status !== PAYMENT_STATUS.PAID) {
    console.log('Marking transaction as PAID...');

    transaction.status = PAYMENT_STATUS.PAID;
    transaction.updatedAt = new Date();
    transaction.details = {
      ...transaction.details,
      tdbOrderDetail: orderDetail,
      tdbLastChecked: new Date(),
    };

    await transaction.save();

    console.log('Transaction saved.');

    const result = await models.Invoices.checkInvoice(invoice._id, subdomain);

    console.log('checkInvoice() returned:', result);

    const updatedInvoice = await models.Invoices.getInvoice({
      _id: invoice._id,
    });

    console.log('Invoice status after checkInvoice:', updatedInvoice.status);
  }

  console.log('========== END CALLBACK ==========');

  return transaction;
};

// API CLIENT
export class TDBAPI extends BaseAPI {
  private username: string;
  private password: string;
  private domain: string;
  private cacheTTL: number; // in seconds

  constructor(config: ITDBConfig, domain: string = '') {
    super({
      apiUrl:
        config.apiUrl ||
        PAYMENTS.tdb.apiUrl ||
        'https://acsmc.tdbmlabs.mn:8000',
    });
    this.username = config.username;
    this.password = config.password;
    this.domain = domain;
    this.cacheTTL = 300; // 5 minutes – adjust as needed
  }

  async createInvoice(
    transaction: ITransactionDocument,
  ): Promise<ITDBCreateOrderResponse> {
    const redirectUrl = `${this.domain}/pl:payment/callback/tdb`;
    const currency = (transaction as any).currency || 'MNT';

    const payload: ITDBCreateOrderRequest = {
      typeRid: 'purch',
      amount: transaction.amount,
      currency,
      description:
        transaction.description ||
        `Payment for invoice ${transaction.invoiceId}`,
      language: 'en',
      hppRedirectUrl: redirectUrl,
    };

    const response = await this.request({
      method: 'POST',
      path: 'order',
      headers: {
        Authorization: buildBasicAuth(this.username, this.password),
        'Content-Type': 'application/json',
      },
      data: { order: payload },
    });

    const json = await response.json();
    if (json.errorCode) {
      throw new Error(
        `TDB create order failed: ${json.errorCode} - ${json.errorDescription}`,
      );
    }

    if (!json.order?.id || !json.order?.password || !json.order?.hppUrl) {
      throw new Error(
        'Invalid TDB create order response: missing id, password, or hppUrl',
      );
    }

    // Return the response – caller will save the transaction
    return json as ITDBCreateOrderResponse;
  }

  /**
   * Fetches order detail with caching.
   * Returns cached data if it is recent (< cacheTTL) and the status is terminal.
   * Otherwise makes a fresh GET request.
   */
  async checkInvoice(
    transaction: ITransactionDocument,
  ): Promise<ITDBOrderDetail | null> {
    const details = transaction.details || {};
    const cached = details.tdbOrderDetail;
    const lastChecked = details.tdbLastChecked;

    // Terminal statuses that don't need further updates
    const terminalStatuses = [
      'FULLYPAID',
      'PARTPAID',
      'AUTHORIZED',
      'PAID',
      'CLOSED',
      'CANCELLED',
      'REFUNDED',
    ];

    if (cached && lastChecked) {
      const elapsed = (Date.now() - new Date(lastChecked).getTime()) / 1000;
      const status = cached.status?.toUpperCase() || '';
      if (elapsed < this.cacheTTL && terminalStatuses.includes(status)) {
        // Cache is fresh and status is terminal – reuse it
        return cached;
      }
    }

    // No valid cache – fetch fresh
    const orderDetail = await this.fetchOrderDetail(transaction);
    if (orderDetail && typeof transaction.save === 'function') {
      transaction.details = {
        ...details,
        tdbOrderDetail: orderDetail,
        tdbLastChecked: new Date(),
      };
      await transaction.save();
    }
    return orderDetail;
  }

  /**
   * Performs the actual GET request to TDB.
   * Returns null if credentials are missing or the API returns an error.
   */
  private async fetchOrderDetail(
    transaction: ITransactionDocument,
  ): Promise<ITDBOrderDetail | null> {
    const tdbResponse = transaction.response as any;
    let orderId = tdbResponse?.order?.id;
    let password = tdbResponse?.order?.password;

    if (!orderId && transaction.details?.tdbOrderId) {
      orderId = transaction.details.tdbOrderId;
      password = transaction.details.tdbPassword;
    }

    if (!orderId || !password) {
      console.warn('Missing orderId or password');
      console.warn({
        orderId,
        hasPassword: !!password,
        details: transaction.details,
      });
      return null;
    }

    const response = await this.request({
      method: 'GET',
      path: `order/${orderId}`,
      params: {
        password,
      },
      headers: {
        Authorization: buildBasicAuth(this.username, this.password),
      },
    });

    const text = await response.text();

    if (!response.ok) {
      console.error(`TDB returned HTTP ${response.status}`);
      console.error(text);
      return null;
    }

    let json: any;

    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON');
      console.error(e);
      console.error(text);
      return null;
    }

    if (json.errorCode) {
      console.error('TDB returned an error');
      console.error('errorCode:', json.errorCode);
      console.error('errorDescription:', json.errorDescription);
      return null;
    }

    return json.order || null;
  }
  /**
   * Alias for checkInvoice – used by external polling jobs.
   * Caching is already applied inside checkInvoice.
   */
  async manualCheck(
    transaction: ITransactionDocument,
  ): Promise<ITDBOrderDetail | null> {
    return this.checkInvoice(transaction);
  }

  async cancelInvoice(
    _transaction: ITransactionDocument,
  ): Promise<{ error: string }> {
    return { error: 'Cancel invoice is not supported by TDB payment gateway' };
  }
}
