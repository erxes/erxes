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
  transactionId: string;
}

const buildBasicAuth = (username: string, password: string): string => {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
};

export const tdbCallbackHandler = async (
  models: IModels,
  subdomain: string,
  data: ITDBCallbackQuery,
): Promise<ITransactionDocument> => {
  const { transactionId } = data;

  console.log('data', data)

  const transaction = await models.Transactions.getTransaction({
    _id: transactionId,
  });

  console.log('1 transaction', transaction)

  if (!transaction) {
    throw new Error(`Transaction not found for TDB order ${transactionId}`);
  }

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  console.log('payment', payment)

  if (payment.kind !== 'tdb') {
    throw new Error('Payment config type is mismatched');
  }

  if (transaction.status === PAYMENT_STATUS.PAID) {
    return transaction;
  }

  try {
    const api = new TDBAPI(payment.config);

    const status = await api.checkInvoice(transaction);

    console.log('status', status)

    if (status !== PAYMENT_STATUS.PAID) {
      return transaction;
    }

    await models.Transactions.updateOne(
      { _id: transaction._id },
      { status, updatedAt: new Date() },
    );

    return models.Transactions.getTransaction({ _id: transaction._id });
  } catch (error) {
    throw new Error(error.message);
  }
};

export class TDBAPI extends BaseAPI {
  private username: string;
  private password: string;
  private domain?: string;

  constructor(config: ITDBConfig, domain?: string) {
    super({
      apiUrl:
        config.apiUrl ||
        PAYMENTS.tdb.apiUrl ||
        'https://acsmc.tdbmlabs.mn:8000',
    });
    this.username = config.username;
    this.password = config.password;
    this.domain = domain;
  }

  async createInvoice(
    transaction: ITransactionDocument,
  ): Promise<ITDBCreateOrderResponse> {
    const redirectUrl = `${this.domain}/pl:payment/callback/${PAYMENTS.tdb.kind}?transactionId=${transaction._id}`;

    console.log('redirectUrl', redirectUrl)

    const payload: ITDBCreateOrderRequest = {
      typeRid: 'purch',
      amount: transaction.amount,
      currency: 'MNT',
      description: transaction.description || `Invoice`,
      language: 'en',
      hppRedirectUrl: redirectUrl,
    };

    console.log('payload', JSON.stringify(payload))

    const response = await this.request({
      method: 'POST',
      path: 'order',
      headers: {
        Authorization: buildBasicAuth(this.username, this.password),
        'Content-Type': 'application/json',
      },
      data: { order: payload },
    }).then((r) => r.json());

    console.log('[createInvoice] response', response)

    return response;
  }

  async checkInvoice(transaction: ITransactionDocument): Promise<string> {
    const { id: orderId, password } = transaction?.response?.order || {};

    console.log('transaction', transaction)

    const response: ITDBGetOrderDetailResponse = await this.request({
      method: 'GET',
      path: `order/${orderId}`,
      params: {
        password,
      },
      headers: {
        Authorization: buildBasicAuth(this.username, this.password),
      },
    }).then((r) => r.json());

    console.log('[checkInvoice] response', response)

    const status = (response?.order?.status || '').toUpperCase();

    const SUCCESSFUL_STATUSES = ['FULLYPAID', 'PARTPAID', 'AUTHORIZED', 'PAID'];

    return SUCCESSFUL_STATUSES.includes(status)
      ? PAYMENT_STATUS.PAID
      : PAYMENT_STATUS.PENDING;
  }

  async manualCheck(transaction: ITransactionDocument): Promise<string> {
    return this.checkInvoice(transaction);
  }
}
