import * as QRCode from 'qrcode';

import { IModels } from '../../connectionResolver';
import { ITransactionDocument } from '../../models/definitions/transactions';
import { BaseAPI } from '../base';
import { PAYMENTS, PAYMENT_STATUS } from '../constants';
import { IMonpayInvoice } from '../types';

export const monpayCallbackHandler = async (models: IModels, data: any) => {
  const { uuid, status, amount = 0 } = data;

  if (!uuid) {
    throw new Error('uuid is required');
  }

  if (status !== 'SUCCESS') {
    throw new Error('Payment failed');
  }

  const transaction = await models.Transactions.getTransaction({
    'response.uuid': uuid,
  });

  if (transaction.amount !== Number(amount)) {
    throw new Error('Payment amount is not correct');
  }

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== 'monpay') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new MonpayAPI(payment.config);
    const invoiceStatus = await api.checkInvoice(transaction);

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

export interface IMonpayConfig {
  username: string;
  accountId: string;
}

export class MonpayAPI extends BaseAPI {
  private username: string;
  private accountId: string;
  private headers: any;
  private domain?: string;

  constructor(config: IMonpayConfig, domain?: string) {
    super(config);

    this.username = config.username;
    this.accountId = config.accountId;
    this.apiUrl = PAYMENTS.monpay.apiUrl;
    this.domain = domain;
    this.headers = {
      Authorization:
        'Basic ' +
        Buffer.from(`${this.username}:${this.accountId}`).toString('base64'),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  async createInvoice(invoice: ITransactionDocument) {
    const data: IMonpayInvoice = {
      amount: invoice.amount,
      generateUuid: true,
      displayName: invoice.description || 'monpay transaction',
      callbackUrl: `${this.domain}/pl:payment/callback/${PAYMENTS.monpay.kind}`,
    };

    try {
      const res = await this.request({
        method: 'POST',
        headers: this.headers,
        path: PAYMENTS.monpay.actions.invoiceQr,
        data,
      }).then((r) => r.json());

      if (res.code !== 0) {
        return { error: 'Failed to create invoice, please try again' };
      }

      const { result } = res;
      const qrData = await QRCode.toDataURL(result.qrcode);

      return { ...result, qrData };
    } catch (e) {
      return { error: e.message };
    }
  }

  async checkInvoice(invoice: ITransactionDocument) {
    try {
      const res = await this.request({
        method: 'GET',
        headers: this.headers,
        path: PAYMENTS.monpay.actions.invoiceCheck,
        params: { uuid: invoice.response.uuid },
      }).then((r) => r.json());

      switch (res.code) {
        case 0:
          return PAYMENT_STATUS.PAID;
        case 23:
          return PAYMENT_STATUS.PENDING;
        default:
          return PAYMENT_STATUS.FAILED;
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async manualCheck(invoice: ITransactionDocument) {
    try {
      const res = await this.request({
        method: 'GET',
        headers: this.headers,
        path: PAYMENTS.monpay.actions.invoiceCheck,
        params: { uuid: invoice.response.uuid },
      }).then((r) => r.json());

      switch (res.code) {
        case 0:
          return PAYMENT_STATUS.PAID;
        case 23:
          return res.info;
        default:
          return PAYMENT_STATUS.FAILED;
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async couponScan(couponCode: string) {
    try {
      const loginRes = await this.request({
        method: 'POST',
        headers: this.headers,
        path: PAYMENTS.monpay.actions.branchLogin,
        data: {
          username: process.env.MONPAY_COUPON_USERNAME || '',
          password: process.env.MONPAY_COUPON_PASSWORD || '',
        },
      }).then((r) => r.json());

      if (loginRes.code !== 0) {
        return { error: 'Failed to login' };
      }

      const token = loginRes.result.token;

      try {
        const res = await this.request({
          method: 'GET',
          headers: {
            ...this.headers,
            Authorization: `Bearer ${token}`,
          },
          path: PAYMENTS.monpay.actions.couponScan,
          params: { couponCode },
        }).then((r) => r.json());

        if (res.code !== 0) {
          return { error: 'Coupon is not valid' };
        }

        //   {
        //     "code": 0,
        //     "info": "Амжилттай",
        //     "result": {
        //         "couponCategory": "MOBI_BDAY_JURUR15000",
        //         "couponCode": "jurur_4kYE7uOQYFJRc",
        //         "couponEndDate": 1701360000000,
        //         "userPhone": "90371041",
        //         "isUsable": true,
        //         "description": "COUPON IS AVAILABLE",
        //         "couponAmount": 15000
        //     }
        // }

        return { ...res.result };
      } catch (e) {
        console.error(e);
        return { error: e.message };
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
