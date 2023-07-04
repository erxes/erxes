import * as fetch from 'node-fetch';
import * as QRCode from 'qrcode';
import { IModels } from '../../connectionResolver';
import { IInvoiceDocument } from '../../models/definitions/invoices';
import redis from '../../redis';
import { BaseAPI } from '../base';
import { PAYMENTS, PAYMENT_STATUS } from '../constants';
import { IPocketInvoice } from '../types';

export const pocketCallbackHandler = async (models: IModels, data: any) => {
  const { paymentId, invoiceId } = data;

  if (!paymentId) {
    throw new Error('Payment id is required');
  }

  const invoice = await models.Invoices.getInvoice(
    {
      'apiResponse.invoiceId': invoiceId,
      selectedPaymentId: paymentId
    },
    true
  );

  const apiResponse: any = invoice.apiResponse;

  for (const key of Object.keys(data)) {
    apiResponse[key] = data[key];
  }

  const payment = await models.Payments.getPayment(paymentId);

  if (payment.kind !== 'pocket') {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new PocketAPI(payment.config);
    const status = await api.checkInvoice(invoice);

    if (status !== PAYMENT_STATUS.PAID) {
      return invoice;
    }

    await models.Invoices.updateOne(
      { _id: invoice._id },
      {
        $set: {
          status,
          apiResponse,
          resolvedAt: new Date()
        }
      }
    );

    invoice.status = status;

    return invoice;
  } catch (e) {
    throw new Error(e.message);
  }
};

export interface IPocketConfig {
  pocketMerchant: string;
  pocketClientId: string;
  pocketClientSecret: string;
}

export class PocketAPI extends BaseAPI {
  private pocketMerchant: string;
  private pocketClientId: string;
  private pocketClientSecret: any;
  private domain?: string;

  constructor(config: IPocketConfig, domain?: string) {
    super(config);

    this.pocketMerchant = config.pocketMerchant;
    this.pocketClientId = config.pocketClientId;
    this.pocketClientSecret = config.pocketClientSecret;

    this.domain = domain;
    this.apiUrl = PAYMENTS.pocket.apiUrl;
  }

  async getHeaders() {
    const { pocketMerchant } = this;

    const token = await redis.get(`pocket_token_${pocketMerchant}`);

    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }

    const requestBody = new URLSearchParams({
      client_id: this.pocketClientId,
      client_secret: this.pocketClientSecret,
      grant_type: 'client_credentials'
    }).toString();

    try {
      const authUrl =
        'https://sso.invescore.mn/auth/realms/invescore/protocol/openid-connect/token';

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
      });

      const res = await response.json();

      await redis.set(
        `pocket_token_${pocketMerchant}`,
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

  async createInvoice(invoice: IInvoiceDocument) {
    try {
      const data: IPocketInvoice = {
        amount: invoice.amount,
        info: invoice.description || invoice.contentTypeId
      };

      const res = await this.request({
        method: 'POST',
        path: PAYMENTS.pocket.actions.invoice,
        headers: await this.getHeaders(),
        data
      });

      return {
        ...res,
        invoiceId: res.id,
        qrData: await QRCode.toDataURL(res.qr)
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  async checkInvoice(invoice: IInvoiceDocument) {
    // return PAYMENT_STATUS.PAID;
    try {
      const res = await this.request({
        method: 'GET',
        path: `${PAYMENTS.pocket.actions.checkInvoice}/${invoice.apiResponse.invoiceId}`,
        headers: await this.getHeaders()
      });

      if (res.state === 'paid') {
        return PAYMENT_STATUS.PAID;
      }

      if (PAYMENT_STATUS.ALL.includes(res.state)) {
        return res.state;
      }

      return PAYMENT_STATUS.PENDING;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async manualCheck(invoice: IInvoiceDocument) {
    try {
      const res = await this.request({
        method: 'GET',
        path: `${PAYMENTS.pocket.actions.checkInvoice}/${invoice.apiResponse.id}`,
        headers: await this.getHeaders()
      });

      if (res.state === 'paid') {
        return PAYMENT_STATUS.PAID;
      }

      if (PAYMENT_STATUS.ALL.includes(res.state)) {
        return res.state;
      }

      return PAYMENT_STATUS.PENDING;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  // todo: cancel invoice
  // async cancelInvoice(invoice: IInvoiceDocument) {
  //
  //   // try {
  //   //   await this.request({
  //   //     method: 'PUT',
  //   //     path: `${PAYMENTS.pocket.actions.cancel}/${invoice.apiResponse.heldId}`,
  //   //     headers: await this.getHeaders(),
  //   //   });
  //   // } catch (e) {
  //   //   return { error: e.message };
  //   // }
  //   return
  // }

  async resiterWebhook(paymentId: string) {
    try {
      await this.request({
        method: 'POST',
        path: PAYMENTS.pocket.actions.webhook,
        headers: await this.getHeaders(),
        data: {
          fallBackUrl: `${this.domain}/pl:payment/callback/${PAYMENTS.pocket.kind}?paymentId=${paymentId}`
        }
      });
    } catch (e) {
      return { error: e.message };
    }
  }
}
