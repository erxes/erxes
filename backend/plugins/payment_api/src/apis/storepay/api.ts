import fetch from 'node-fetch';
import { BaseAPI } from '../base';
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { redis } from 'erxes-api-shared/utils';

export const storepayCallbackHandler = async (
  models: IModels,
  data: any
): Promise<ITransactionDocument> => {
  const { id } = data;

  if (!id) {
    throw new Error('id is required');
  }

  const transaction = await models.Transactions.getTransaction(
    {
      $or: [{ 'response.value': id }, { 'response.value': Number(id) }],
    },
    true
  );

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== 'storepay') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new StorePayAPI(payment.config);
    const invoiceStatus = await api.checkInvoice(id);

    if (invoiceStatus !== PAYMENT_STATUS.PAID) {
      return transaction;
    }

    transaction.status = invoiceStatus;
    transaction.updatedAt = new Date();
    await transaction.save();

    return transaction;
  } catch (e) {
    throw new Error(e.message);
  }
};
export interface IStorePayParams {
  merchantUsername: string;
  merchantPassword: string;

  appUsername: string;
  appPassword: string;

  storeId: string;
}

export class StorePayAPI extends BaseAPI {
  private username: string;
  private password: string;
  private app_username: string;
  private app_password: string;
  private store_id: string;
  private domain?: string;

  constructor(config: IStorePayParams, domain?: string) {
    super(config);

    const {
      merchantPassword,
      merchantUsername,
      appPassword,
      appUsername,
      storeId,
    } = config || {
      merchantPassword: '',
      merchantUsername: '',
      appPassword: '',
      appUsername: '',
      storeId: '',
    };

    this.username = merchantUsername;
    this.password = merchantPassword;
    this.app_username = appUsername;
    this.app_password = appPassword;
    this.store_id = storeId;
    this.apiUrl = PAYMENTS.storepay.apiUrl;
    this.domain = domain;
  }

  async authorize() {
    const { username, password, app_password, app_username } = this;
    const data = {
      username,
      password,
    };
    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${app_username}:${app_password}`
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };

      const res = await fetch(
        'http://service-merchant.storepay.mn:7701/oauth/token?' +
          new URLSearchParams({
            grant_type: 'password',
            username,
            password,
          }),
        requestOptions
      ).then((res) => res.json());

      if (res.error) {
        if (res.error === 'invalid_client') {
          throw new Error(
            'Invalid credentials!!! Please check your credentials'
          );
        }

        if (res.error_description) {
          throw new Error(res.error_description);
        }
        throw new Error(res.error);
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getHeaders() {
    const { username, password, app_password, app_username, store_id } = this;
    const data = {
      username,
      password,
    };

    const token = await redis.get(`storepay_token_${store_id}`);

    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }

    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${app_username}:${app_password}`
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };

      const res = await fetch(
        'http://service-merchant.storepay.mn:7701/oauth/token?' +
          new URLSearchParams({
            grant_type: 'password',
            username,
            password,
          }),
        requestOptions
      ).then((res) => res.json());

      await redis.set(
        `storepay_token_${store_id}`,
        res.access_token,
        'EX',
        res.expires_in - 60
      );

      return {
        Authorization: `Bearer ${res.access_token}`,
        'Content-Type': 'application/json',
      };
    } catch (e) {
      console.error('error ', e);
      throw new Error(e.message);
    }
  }

  /**
   * create invoice on monpay
   * @param {number} amount - amount
   * @param {string} description - description
   * @return {[object]} - Returns invoice object
   * TODO: update return type
   */
  async createInvoice(invoice: ITransactionDocument) {
    const details = invoice.details || {};

    try {
      const data = {
        amount: invoice.amount,
        mobileNumber: details.phone,
        description: invoice.description || 'transaction',
        storeId: this.store_id,
        callbackUrl: `${this.domain}/pl:payment/callback/${PAYMENTS.storepay.kind}`,
      };

      const possibleAmount = await this.checkLoanAmount(details.phone);

      if (possibleAmount < invoice.amount) {
        return {
          error: 'Insufficient amount',
        };
      }

      const res = await this.request({
        method: 'POST',
        path: 'merchant/loan',
        data,
        headers: await this.getHeaders(),
      }).then((res) => res.json());

      if (res.status !== 'Success') {
        const error =
          res.msgList.length > 0 ? res.msgList[0].code : 'Unknown error';

        return { error };
      }

      return { ...res, text: `Invoice has sent to ${details.phone}` };
    } catch (e) {
      return { error: e.message };
    }
  }

  /**
   * check invoice status
   * @param {string} uuid - unique identifier of storepay invoice
   * @return {string} - Returns invoice status
   */
  async checkInvoice(invoiceNumber: string) {
    try {
      const res = await this.request({
        headers: await this.getHeaders(),
        method: 'GET',
        path: `merchant/loan/check/${invoiceNumber}`,
      }).then((res) => res.json());

      if (!res.value) {
        return PAYMENT_STATUS.PENDING;
      }

      return PAYMENT_STATUS.PAID;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async manualCheck(invoice: ITransactionDocument) {
    // if (invoice.apiResponse.error) {
    //   return invoice.apiResponse.error;
    // }

    try {
      const res = await this.request({
        headers: await this.getHeaders(),
        method: 'GET',
        path: `merchant/loan/check/${invoice.response.value}`,
      }).then((res) => res.json());

      if (!res.value) {
        return PAYMENT_STATUS.PENDING;
      }

      return PAYMENT_STATUS.PAID;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async checkLoanAmount(mobileNumber: string) {
    try {
      const res = await this.request({
        headers: await this.getHeaders(),
        method: 'POST',
        path: `user/possibleAmount`,
        data: {
          mobileNumber,
        },
      }).then((res) => res.json());

      const { msgList = [], status } = res;
      if (status === 'Failed' && msgList.length > 0) {
        throw new Error(msgList[0].code);
      }

      if (!res.value || res.value === 0) {
        throw new Error('Insufficient loan amount');
      }

      return res.value;
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
