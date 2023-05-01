import * as QRCode from 'qrcode';

import { IModels } from '../../connectionResolver';

import { IInvoiceDocument } from '../../models/definitions/invoices';
import { BaseAPI } from '../base';
import { IMonpayInvoice } from '../types';
import { PAYMENTS, PAYMENT_STATUS } from '../constants';

export const monpayCallbackHandler = async (models: IModels, data: any) => {
  const { uuid, status, amount = 0 } = data;

  if (!uuid) {
    throw new Error('uuid is required');
  }

  if (status !== 'SUCCESS') {
    throw new Error('Payment failed');
  }

  const invoice = await models.Invoices.getInvoice({
    'apiResponse.uuid': uuid
  });

  if (invoice.amount !== Number(amount)) {
    throw new Error('Payment amount is not correct');
  }

  const payment = await models.Payments.getPayment(invoice.selectedPaymentId);

  if (payment.kind !== 'monpay') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new MonpayAPI(payment.config);
    const invoiceStatus = await api.checkInvoice(invoice);

    if (invoiceStatus !== PAYMENT_STATUS.PAID) {
      return invoice;
    }

    await models.Invoices.updateOne(
      { _id: invoice._id },
      { $set: { status, resolvedAt: new Date() } }
    );

    invoice.status = status;

    return invoice;
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
      Accept: 'application/json'
    };
  }

  async createInvoice(invoice: IInvoiceDocument) {
    const data: IMonpayInvoice = {
      amount: invoice.amount,
      generateUuid: true,
      displayName: invoice.description || 'monpay transaction',
      callbackUrl: `${this.domain}/pl:payment/callback/${PAYMENTS.monpay.kind}`
    };

    try {
      const res = await this.request({
        method: 'POST',
        headers: this.headers,
        path: PAYMENTS.monpay.actions.invoiceQr,
        data
      });

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

  async checkInvoice(invoice: IInvoiceDocument) {
    try {
      const res = await this.request({
        method: 'GET',
        headers: this.headers,
        path: PAYMENTS.monpay.actions.invoiceCheck,
        params: { uuid: invoice.apiResponse.uuid }
      });

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

  async couponCheck(couponCode: string) {
    const loginRes = await this.request({
      method: 'POST',
      headers: this.headers,
      path: PAYMENTS.monpay.actions.branchLogin,
      data: { username: this.username, password: 'qwerty' }
    });

    let token = '';

    if (loginRes.code !== 0) {
      return { error: 'Failed to login' };
    }

    token = loginRes.result.token;

    try {
      const res = await this.request({
        method: 'GET',
        headers: {
          ...this.headers,
          Authorization: `Bearer ${token}`
        },
        path: PAYMENTS.monpay.actions.couponScan,
        params: { couponCode }
      });

      if (res.code !== 0) {
        return { error: 'Coupon is not valid' };
      }

      return { ...res.result };
    } catch (e) {
      return { error: e.message };
    }
  }
}
