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

// TYPES 
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

//HELPERS 
const buildBasicAuth = (username: string, password: string): string => {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
};

// CALLBACK HANDLER 
export const tdbCallbackHandler = async (
  models: IModels,
  subdomain: string,
  data: Record<string, any>,   
): Promise<ITransactionDocument> => {
  const { ID, STATUS } = data;

  if (!ID || !STATUS) {
    throw new Error('Missing ID or STATUS in callback query parameters');
  }

  const transaction = await models.Transactions.findOne({
    $or: [{ code: ID }, { 'details.tdbOrderId': ID }],
  });

  if (!transaction) {
    throw new Error(`Transaction not found for TDB order ID: ${ID}`);
  }

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);
  if (payment.kind !== 'tdb') {
    throw new Error('Payment method kind is not tdb');
  }

  const api = new TDBAPI(payment.config, process.env.DOMAIN || '');
  const orderDetail = await api.checkInvoice(transaction);

  if (!orderDetail) {
    // Not yet paid or not found – return transaction unchanged
    return transaction;
  }

  // Validate amount & currency
  const transactionAmount = (transaction as any).amount as number;
  const transactionCurrency = (transaction as any).currency as string;
  if (orderDetail.amount !== transactionAmount) {
    throw new Error(`Amount mismatch: expected ${transactionAmount}, got ${orderDetail.amount}`);
  }
  if (orderDetail.currency !== transactionCurrency) {
    throw new Error(`Currency mismatch: expected ${transactionCurrency}, got ${orderDetail.currency}`);
  }

  const successStatuses = ['FULLYPAID', 'PARTPAID', 'AUTHORIZED', 'PAID'];
  const isPaid = successStatuses.includes(orderDetail.status.toUpperCase());

  if (isPaid && transaction.status !== PAYMENT_STATUS.PAID) {
    transaction.status = PAYMENT_STATUS.PAID;
    transaction.updatedAt = new Date();
    transaction.details = {
      ...transaction.details,
      tdbOrderDetail: orderDetail,
    };
    await transaction.save();

    graphqlPubsub.publish(`transactionUpdated:${transaction.invoiceId}`, {
      transactionUpdated: {
        _id: transaction._id,
        status: PAYMENT_STATUS.PAID,
        amount: transactionAmount,
        paymentKind: transaction.paymentKind,
      },
    });

    const invoice = await models.Invoices.getInvoice({ _id: transaction.invoiceId });
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

  constructor(config: ITDBConfig, domain: string = '') {
    super({ apiUrl: config.apiUrl || PAYMENTS.tdb?.apiUrl || 'https://acsmc.tdbmlabs.mn:8000' });
    this.username = config.username;
    this.password = config.password;
    this.domain = domain;
  }

  async createInvoice(transaction: ITransactionDocument): Promise<ITDBCreateOrderResponse> {
    const redirectUrl = `${this.domain}/pl:payment/callback/tdb`;

    const payload: ITDBCreateOrderRequest = {
      typeRid: 'purch',
      amount: (transaction as any).amount,
      currency: (transaction as any).currency,
      description: transaction.description || `Payment for invoice ${transaction.invoiceId}`,
      language: 'en',
      hppRedirectUrl: redirectUrl,
    };

    const response = await this.request({
      method: 'POST',
      path: 'order',
      headers: {
        Authorization: buildBasicAuth(this.username, this.password),
      },
      data: { order: payload },
    });

    const json = await response.json();
    if (!json.order?.id || !json.order?.password || !json.order?.hppUrl) {
      throw new Error('Invalid TDB create order response');
    }
    return json as ITDBCreateOrderResponse;
  }

  private async getOrderDetail(transaction: ITransactionDocument): Promise<ITDBOrderDetail | null> {
    const orderId = transaction.details?.tdbOrderId;
    const password = transaction.details?.tdbPassword;
    if (!orderId || !password) {
      throw new Error('Missing TDB order ID or password in transaction details');
    }

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
  }

  async checkInvoice(transaction: ITransactionDocument): Promise<ITDBOrderDetail | null> {
    const orderDetail = await this.getOrderDetail(transaction);
    if (!orderDetail) return null;

    const successStatuses = ['FULLYPAID', 'PARTPAID', 'AUTHORIZED', 'PAID'];
    const isPaid = successStatuses.includes(orderDetail.status.toUpperCase());

    transaction.details = {
      ...transaction.details,
      tdbOrderDetail: orderDetail,
      tdbLastChecked: new Date(),
    };
    if (isPaid && transaction.status !== PAYMENT_STATUS.PAID) {
      transaction.status = PAYMENT_STATUS.PAID;
    }
    await transaction.save();

    return orderDetail;
  }

  async manualCheck(transaction: ITransactionDocument): Promise<ITDBOrderDetail | null> {
    return this.checkInvoice(transaction);
  }

  async cancelInvoice(_transaction: ITransactionDocument): Promise<{ error: string }> {
    return { error: 'Cancel invoice is not supported by TDB payment gateway' };
  }
}