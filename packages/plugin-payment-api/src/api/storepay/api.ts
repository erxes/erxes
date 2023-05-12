import { sendRequest } from '@erxes/api-utils/src/requests';

import { BaseAPI } from '../../api/base';
import { IModels } from '../../connectionResolver';
import { PAYMENTS, PAYMENT_STATUS } from '../constants';
import { IInvoiceDocument } from '../../models/definitions/invoices';
import redis from '../../redis';

export const storepayCallbackHandler = async (
  models: IModels,
  data: any
): Promise<IInvoiceDocument> => {
  const { id } = data;

  if (!id) {
    throw new Error('id is required');
  }

  const invoice = await models.Invoices.getInvoice(
    {
      'apiResponse.value': id
    },
    true
  );

  const payment = await models.Payments.getPayment(invoice.selectedPaymentId);

  if (payment.kind !== 'storepay') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new StorePayAPI(payment.config);
    const invoiceStatus = await api.checkInvoice(id);

    if (invoiceStatus !== PAYMENT_STATUS.PAID) {
      return invoice;
    }

    await models.Invoices.updateOne(
      { _id: invoice._id },
      { $set: { status: invoiceStatus, resolvedAt: new Date() } }
    );

    invoice.status = invoiceStatus;

    return invoice;
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
      storeId
    } = config || {
      merchantPassword: '',
      merchantUsername: '',
      appPassword: '',
      appUsername: '',
      storeId: ''
    };

    this.username = merchantUsername;
    this.password = merchantPassword;
    this.app_username = appUsername;
    this.app_password = appPassword;
    this.store_id = storeId;
    this.apiUrl = PAYMENTS.storepay.apiUrl;
    this.domain = domain;
  }

  async getHeaders() {
    const { username, password, app_password, app_username, store_id } = this;
    const data = {
      username,
      password
    };

    const token = await redis.get(`storepay_token_${store_id}`);

    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }

    try {
      const requestOptions = {
        url: 'http://service-merchant.storepay.mn:7701/oauth/token',
        params: {
          grant_type: 'password',
          username,
          password
        },
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${app_username}:${app_password}`
          ).toString('base64')}`
        },
        body: data
      };

      const res = await sendRequest(requestOptions);

      await redis.set(
        `storepay_token_${store_id}`,
        res.access_token,
        'EX',
        res.expires_in - 60
      );

      return {
        Authorization: `Bearer ${res.access_token}`,
        'Content-Type': 'application/json'
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
  async createInvoice(invoice: IInvoiceDocument) {
    try {
      const data = {
        amount: invoice.amount,
        mobileNumber: invoice.phone,
        description: invoice.description || 'transaction',
        storeId: this.store_id,
        callbackUrl: `${this.domain}/pl:payment/callback/${PAYMENTS.storepay.kind}`
      };

      const possibleAmount = await this.checkLoanAmount(invoice.phone);

      if (possibleAmount < invoice.amount) {
        return {
          error: 'Insufficient amount'
        };
      }

      const res = await this.request({
        method: 'POST',
        path: 'merchant/loan',
        data,
        headers: await this.getHeaders()
      });

      if (res.status !== 'Success') {
        const error =
          res.msgList.length > 0 ? res.msgList[0].code : 'Unknown error';

        return { error };
      }

      return { ...res, text: `Invoice has sent to ${invoice.phone}` };
    } catch (e) {
      return { error: e.message };
    }
  }

  /**
   * check invoice status
   * @param {string} uuid - unique identifier of monpay invoice
   * @return {string} - Returns invoice status
   */
  async checkInvoice(invoiceNumber: string) {
    try {
      const res = await this.request({
        headers: await this.getHeaders(),
        method: 'GET',
        path: `merchant/loan/check/${invoiceNumber}`
      });

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
          mobileNumber
        }
      });

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
