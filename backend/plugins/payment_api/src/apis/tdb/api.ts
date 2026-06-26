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
  const { ID, STATUS } = data;

  if (!ID || !STATUS) {
    throw new Error('Missing ID or STATUS in callback query parameters');
  }

  const transaction = await models.Transactions.findOne({
    $or: [
      { code: ID },
      { code: Number(ID) },
      { 'details.tdbOrderId': ID },
      { 'details.tdbOrderId': Number(ID) },
    ],
  });

  if (!transaction) {
    throw new Error(`Transaction not found for TDB order ID: ${ID}`);
  }

  // Early exit: already paid → no need to call TDB again
  if (transaction.status === PAYMENT_STATUS.PAID) {
    return transaction;
  }

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);
  if (payment.kind !== 'tdb') {
    throw new Error('Payment method kind is not tdb');
  }

  const api = new TDBAPI(payment.config, process.env.DOMAIN || '');
  
  // checkInvoice uses caching – will avoid GET if recent data exists
  const orderDetail = await api.checkInvoice(transaction);

  if (!orderDetail) {
    return transaction;
  }

  const invoice = await models.Invoices.getInvoice({ _id: transaction.invoiceId });
  const expectedAmount = invoice.amount;
  const expectedCurrency = invoice.currency;

  if (orderDetail.amount !== expectedAmount) {
    throw new Error(`Amount mismatch: expected ${expectedAmount}, got ${orderDetail.amount}`);
  }
  if (orderDetail.currency !== expectedCurrency) {
    throw new Error(`Currency mismatch: expected ${expectedCurrency}, got ${orderDetail.currency}`);
  }

  const successStatuses = ['FULLYPAID', 'PARTPAID', 'AUTHORIZED', 'PAID'];
  const isPaid = successStatuses.includes(orderDetail.status.toUpperCase());

  if (isPaid && transaction.status !== PAYMENT_STATUS.PAID) {
    transaction.status = PAYMENT_STATUS.PAID;
    transaction.updatedAt = new Date();
    transaction.details = {
      ...transaction.details,
      tdbOrderDetail: orderDetail,
      tdbLastChecked: new Date(),
    };
    await transaction.save();

    graphqlPubsub.publish(`transactionUpdated:${transaction.invoiceId}`, {
      transactionUpdated: {
        _id: transaction._id,
        status: PAYMENT_STATUS.PAID,
        amount: transaction.amount,
        paymentKind: transaction.paymentKind,
      },
    });

    const result = await models.Invoices.checkInvoice(invoice._id, subdomain);

    if (result === PAYMENT_STATUS.PAID) {
      graphqlPubsub.publish(`invoiceUpdated:${invoice._id}`, {
        invoiceUpdated: { _id: transaction.invoiceId, status: PAYMENT_STATUS.PAID },
      });
    }

    const [pluginName, moduleName, collectionType] = splitType(invoice.contentType);
    if (await isEnabled(pluginName)) {
      try {
        await sendWorkerMessage({
          subdomain,
          pluginName,
          queueName: 'payments',
          jobName: 'transactionCallback',
          data: {
            ...transaction.toObject(),
            moduleName,
            collectionType,
            apiResponse: 'success',
          },
          defaultValue: null,
        });

        if (result === PAYMENT_STATUS.PAID) {
          await sendWorkerMessage({
            subdomain,
            pluginName,
            queueName: 'payments',
            jobName: 'callback',
            data: {
              ...invoice.toObject(),
              moduleName,
              collectionType,
              status: PAYMENT_STATUS.PAID,
            },
            defaultValue: null,
          });

          if (invoice.callback) {
            await fetch(invoice.callback, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                _id: invoice._id,
                amount: invoice.amount,
                status: PAYMENT_STATUS.PAID,
              }),
            }).catch(e => console.error('External callback error:', e));
          }
        }
      } catch (e) {
        console.error('Worker message error:', e);
      }
    }
  }

  return transaction;
};

// API CLIENT
export class TDBAPI extends BaseAPI {
  private username: string;
  private password: string;
  private domain: string;
  private cacheTTL: number; // in seconds

  constructor(config: ITDBConfig, domain: string = '') {
    super({ apiUrl: config.apiUrl || PAYMENTS.tdb?.apiUrl || 'https://acsmc.tdbmlabs.mn:8000' });
    this.username = config.username;
    this.password = config.password;
    this.domain = domain;
    this.cacheTTL = 300; // 5 minutes – adjust as needed
  }

  async createInvoice(transaction: ITransactionDocument): Promise<ITDBCreateOrderResponse> {
    const redirectUrl = `${this.domain}/pl:payment/callback/tdb`;
    const currency = (transaction as any).currency || 'MNT';

    const payload: ITDBCreateOrderRequest = {
      typeRid: 'purch',
      amount: transaction.amount,
      currency,
      description: transaction.description || `Payment for invoice ${transaction.invoiceId}`,
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
      throw new Error(`TDB create order failed: ${json.errorCode} - ${json.errorDescription}`);
    }

    if (!json.order?.id || !json.order?.password || !json.order?.hppUrl) {
      throw new Error('Invalid TDB create order response: missing id, password, or hppUrl');
    }

    // Return the response – caller will save the transaction
    return json as ITDBCreateOrderResponse;
  }

  /**
   * Fetches order detail with caching.
   * Returns cached data if it is recent (< cacheTTL) and the status is terminal.
   * Otherwise makes a fresh GET request.
   */
  async checkInvoice(transaction: ITransactionDocument): Promise<ITDBOrderDetail | null> {
    const details = transaction.details || {};
    const cached = details.tdbOrderDetail;
    const lastChecked = details.tdbLastChecked;

    // Terminal statuses that don't need further updates
    const terminalStatuses = ['FULLYPAID', 'PARTPAID', 'AUTHORIZED', 'PAID', 'CANCELLED', 'REFUNDED'];

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
  private async fetchOrderDetail(transaction: ITransactionDocument): Promise<ITDBOrderDetail | null> {
    const tdbResponse = transaction.response as any;
    let orderId = tdbResponse?.order?.id;
    let password = tdbResponse?.order?.password;

    if (!orderId && transaction.details?.tdbOrderId) {
      orderId = transaction.details.tdbOrderId;
      password = transaction.details.tdbPassword;
    }

    if (!orderId || !password) {
      console.warn(`Missing TDB order ID or password for transaction ${transaction._id}`);
      return null;
    }

    try {
      const response = await this.request({
        method: 'GET',
        path: `order/${orderId}?password=${encodeURIComponent(password)}`,
      });

      const json = await response.json();
      if (json.errorCode) {
        console.error(`TDB getOrderDetail error: ${json.errorCode} - ${json.errorDescription}`);
        return null;
      }
      return (json as ITDBGetOrderDetailResponse).order || null;
    } catch (err) {
      console.error(`Failed to fetch order detail for ${orderId}:`, err);
      return null;
    }
  }

  /**
   * Alias for checkInvoice – used by external polling jobs.
   * Caching is already applied inside checkInvoice.
   */
  async manualCheck(transaction: ITransactionDocument): Promise<ITDBOrderDetail | null> {
    return this.checkInvoice(transaction);
  }

  async cancelInvoice(_transaction: ITransactionDocument): Promise<{ error: string }> {
    return { error: 'Cancel invoice is not supported by TDB payment gateway' };
  }
}