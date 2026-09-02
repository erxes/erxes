import fetch from 'node-fetch';
import { BaseAPI } from '../base';
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { redis } from 'erxes-api-shared/utils';

export const storepayCallbackHandler = async (
  models: IModels,
  data: any,
): Promise<ITransactionDocument> => {
  const { id } = data;

  if (!id) {
    throw new Error('id is required');
  }

  const transaction = await models.Transactions.getTransaction(
    {
      $or: [{ 'response.value': id }, { 'response.value': Number(id) }],
    },
    true,
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
    const { username, password, app_username, app_password } = this;

    try {
      const response = await fetch(
        'https://service.storepay.mn/merchant-uaa/oauth/token?' +
          new URLSearchParams({
            grant_type: 'password',
            username,
            password,
          }),
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${app_username}:${app_password}`,
            ).toString('base64')}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const res = await response.json();

      if (res.error) {
        if (res.error === 'invalid_client') {
          throw new Error(
            'Invalid credentials!!! Please check your credentials',
          );
        }

        throw new Error(res.error_description || res.error);
      }

      if (!res.access_token) {
        throw new Error('StorePay access token was not returned');
      }

      return res;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getHeaders() {
    const token = await redis.get(`storepay_token_${this.store_id}`);

    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }

    try {
      const res = await this.authorize();

      const expiresIn = Number(res.expires_in) || 7200;

      await redis.set(
        `storepay_token_${this.store_id}`,
        res.access_token,
        'EX',
        Math.max(expiresIn - 60, 1),
      );

      return {
        Authorization: `Bearer ${res.access_token}`,
        'Content-Type': 'application/json',
      };
    } catch (e) {
      console.error('StorePay authorization error:', e);
      throw new Error(e.message);
    }
  }

  /**
   * Create StorePay invoice.
   *
   * requestId is supported from StorePay API v3.0.
   */
  async createInvoice(invoice: ITransactionDocument) {
    const details = invoice.details || {};

    try {
      const data = {
        storeId: this.store_id,
        mobileNumber: details.phone,
        description: invoice.description || 'transaction',
        amount: invoice.amount,
        callbackUrl: `${this.domain}/pl:payment/callback/${PAYMENTS.storepay.kind}`,
        requestId: invoice._id,
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
          res.msgList?.length > 0 ? res.msgList[0].code : 'Unknown error';

        return { error };
      }
      return {
        ...res,
        text: `Invoice has sent to ${details.phone}`,
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  /**
   * Check invoice status by StorePay invoice number.
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

  /**
   * Check invoice status by requestId.
   *
   * StorePay API v3.0:
   * GET /merchant/loan/checkRequest/{requestId}
   */
  async checkRequest(requestId: string) {
    try {
      const res = await this.request({
        headers: await this.getHeaders(),
        method: 'GET',
        path: `merchant/loan/checkRequest/${requestId}`,
      }).then((res) => res.json());

      return res;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  /**
   * Manually check invoice status.
   *
   * Uses the StorePay invoice number, which is stored in
   * transaction.response.value after invoice creation.
   */
  async manualCheck(invoice: ITransactionDocument) {
    try {
      const invoiceNumber = invoice.response?.value;

      if (!invoiceNumber) {
        return PAYMENT_STATUS.PENDING;
      }

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

  async checkLoanAmount(mobileNumber: string) {
    try {
      const res = await this.request({
        headers: await this.getHeaders(),
        method: 'POST',
        path: 'user/possibleAmount',
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

  /**
   * Change loan amount or request cancellation of a confirmed invoice.
   *
   * changeTypeId:
   * 1 = Change amount
   * 2 = Cancel
   */
  async loanChange({
    changeTypeId,
    loanId,
    reason,
    amount,
  }: {
    changeTypeId: number;
    loanId: number;
    reason: string;
    amount?: number;
  }) {
    try {
      if (![1, 2].includes(changeTypeId)) {
        throw new Error('Invalid changeTypeId');
      }

      if (changeTypeId === 1 && amount === undefined) {
        throw new Error('Amount is required when changing the loan amount');
      }

      const data: {
        changeTypeId: number;
        loanId: number;
        reason: string;
        amount?: number;
      } = {
        changeTypeId,
        loanId,
        reason,
      };

      if (changeTypeId === 1) {
        data.amount = amount;
      }

      const res = await this.request({
        method: 'POST',
        path: 'merchant/loanChange',
        data,
        headers: await this.getHeaders(),
      }).then((res) => res.json());

      if (res.status !== 'success') {
        return {
          error: res.msgList?.[0]?.code || 'Unknown error',
        };
      }

      return res;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  /**
   * Get loan amount change/cancellation request list.
   */
  async loanChangeList() {
    try {
      const response = await this.request({
        method: 'POST',
        path: 'merchant/ds/dtable',
        data: {
          code: 'MerchantLoanChangeList',
        },
        headers: await this.getHeaders(),
      });

      const text = await response.text();

      if (!text) {
        return {
          status: response.status,
          body: null,
        };
      }

      try {
        return JSON.parse(text);
      } catch {
        return {
          status: response.status,
          body: text,
        };
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
