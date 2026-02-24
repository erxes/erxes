import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

import { IModels } from '~/connectionResolvers';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { BaseAPI } from '~/apis/base';
import { ISocialPayInvoice } from '../types';
import { random } from 'erxes-api-shared/utils';

export const hmac256 = (key, message) => {
  const hash = crypto.createHmac('sha256', key).update(message);
  return hash.digest('hex');
};

export const socialpayCallbackHandler = async (models: IModels, data: any) => {
  const { resp_code, amount, checksum, invoice, terminal } = data;

  let status = '';

  if (resp_code !== '00') {
    status = PAYMENT_STATUS.PENDING;
  }

  const transaction = await models.Transactions.getTransaction({
    _id: invoice,
  });

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  try {
    const api = new SocialPayAPI(payment.config);
    const res = await api.checkInvoice({
      amount,
      checksum,
      invoice,
      terminal,
    });

    if (res !== PAYMENT_STATUS.PAID) {
      return transaction;
    }

    transaction.status = res;
    transaction.updatedAt = new Date();

    await transaction.save();

    return transaction;
  } catch (e) {
    throw new Error(e.message);
  }
};

export interface ISocialPayParams {
  inStoreSPTerminal: string;
  inStoreSPKey: string;
}

export class SocialPayAPI extends BaseAPI {
  private inStoreSPTerminal: string;
  private inStoreSPKey: string;

  constructor(config: ISocialPayParams) {
    super(config);
    this.inStoreSPTerminal = config.inStoreSPTerminal;
    this.inStoreSPKey = config.inStoreSPKey;
    this.apiUrl = PAYMENTS.socialpay.apiUrl;
  }

  async authorize() {
    const invoiceId = random('aA0', 10);
    try {
      const data: ISocialPayInvoice = {
        amount: '0',
        checksum: hmac256(
          this.inStoreSPKey,
          this.inStoreSPTerminal + invoiceId + 0,
        ),
        invoice: invoiceId,
        terminal: this.inStoreSPTerminal,
      };

      const { header, body } = await this.request({
        path: PAYMENTS.socialpay.actions.invoiceQr,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data,
      }).then((r) => r.json());

      if (header.code !== 200) {
        throw new Error(body.error.errorDesc);
      }

      if (body.error.errorDesc) {
        throw new Error(body.error.errorDesc);
      }

      return {
        success: true,
        message: 'Authorized',
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async createInvoice(invoice: ITransactionDocument) {
    const amount = invoice.amount.toString();
    const details = invoice.details || {};

    const path = details.phone
      ? PAYMENTS.socialpay.actions.invoicePhone
      : PAYMENTS.socialpay.actions.invoiceQr;

    const data: ISocialPayInvoice = {
      amount,
      checksum: hmac256(
        this.inStoreSPKey,
        this.inStoreSPTerminal + invoice._id + amount,
      ),
      invoice: invoice._id,
      terminal: this.inStoreSPTerminal,
    };

    if (details.phone) {
      data.phone = details.phone;

      data.checksum = hmac256(
        this.inStoreSPKey,
        this.inStoreSPTerminal + invoice._id + amount + details.phone,
      );
    }

    try {
      const { header, body } = await this.request({
        path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data,
      }).then((r) => r.json());

      if (header.code !== 200) {
        return { error: body.error.errorDesc };
      }

      if (body.response.status !== 'SUCCESS') {
        return { error: 'Error occured while creating invoice' };
      }

      if (details.phone && body.response.desc.includes('success')) {
        return {
          message:
            'Invoice has been sent to your phone, Please go to SocialPay app to pay',
        };
      }

      const qrData = await QRCode.toDataURL(body.response.desc);

      return { qrData, deeplink: body.response.desc };
    } catch (e) {
      return { error: e.message };
    }
  }

  async cancelInvoice(invoice: ITransactionDocument) {
    const amount = invoice.amount.toString();

    const data: ISocialPayInvoice = {
      amount,
      checksum: hmac256(
        this.inStoreSPKey,
        this.inStoreSPTerminal + invoice._id + amount,
      ),
      invoice: invoice._id,
      terminal: this.inStoreSPTerminal,
    };

    try {
      return await this.request({
        path: PAYMENTS.socialpay.actions.invoiceCancel,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data,
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async checkInvoice(data: any) {
    try {
      const { body } = await this.request({
        path: PAYMENTS.socialpay.actions.invoiceCheck,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data,
      }).then((r) => r.json());

      if (body.response.resp_code !== '00') {
        throw new Error(body.response.resp_desc);
      }

      return PAYMENT_STATUS.PAID;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async manualCheck(invoice: ITransactionDocument) {
    const amount = invoice.amount.toString();

    const data: ISocialPayInvoice = {
      amount,
      checksum: hmac256(
        this.inStoreSPKey,
        this.inStoreSPTerminal + invoice._id + amount,
      ),
      invoice: invoice._id,
      terminal: this.inStoreSPTerminal,
    };

    try {
      const { body } = await this.request({
        path: PAYMENTS.socialpay.actions.invoiceCheck,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data,
      }).then((r) => r.json());

      if (body.error) {
        return body.error.errorDesc;
      }

      if (body.response.resp_code !== '00') {
        throw new Error(body.response.resp_desc);
      }

      return PAYMENT_STATUS.PAID;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
