import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

import { IModels } from '~/connectionResolvers';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { BaseAPI } from '~/apis/base';
import { ISocialPayInvoice } from '../types';
import { random } from 'erxes-api-shared/utils';

function extractErrorMessage(e: any): string {
  if (!e) return 'Unknown error';
  if (typeof e === 'string') return e;
  if (e.message) return e.message;
  if (e.response?.data?.message) return e.response.data.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

export const hmac256 = (key: string, message: string): string => {
  return crypto.createHmac('sha256', key).update(message).digest('hex');
};

export const socialpayCallbackHandler = async (models: IModels, data: any) => {
  const { amount, checksum, invoice, terminal } = data;

  const transaction = await models.Transactions.getTransaction({ _id: invoice });
  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  try {
    const api = new SocialPayAPI(payment.config);
    const status = await api.checkInvoice({
      amount,
      checksum,
      invoice,
      terminal,
    });

    if (status !== PAYMENT_STATUS.PAID) {
      return transaction;
    }

    transaction.status = PAYMENT_STATUS.PAID;
    transaction.updatedAt = new Date();
    await transaction.save();

    return transaction;
  } catch (e: any) {
    throw new Error(extractErrorMessage(e));
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
    const amount = '0';

    try {
      const data: ISocialPayInvoice = {
        amount,
        invoice: invoiceId,
        terminal: this.inStoreSPTerminal,
        checksum: hmac256(
          this.inStoreSPKey,
          `${this.inStoreSPTerminal}${invoiceId}${amount}`
        ),
      };

      const { header, body } = await this.request({
        path: PAYMENTS.socialpay.actions.invoiceQr,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data,
      }).then((r) => r.json());

      if (header?.code !== 200) {
        throw new Error(
          body?.error?.errorDesc || 'SocialPay authorization failed'
        );
      }

      return { success: true };
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
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
      invoice: invoice._id,
      terminal: this.inStoreSPTerminal,
      checksum: hmac256(
        this.inStoreSPKey,
        `${this.inStoreSPTerminal}${invoice._id}${amount}`
      ),
    };

    if (details.phone) {
      data.phone = details.phone;
      data.checksum = hmac256(
        this.inStoreSPKey,
        `${this.inStoreSPTerminal}${invoice._id}${amount}${details.phone}`
      );
    }

    try {
      const { header, body } = await this.request({
        path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data,
      }).then((r) => r.json());

      if (header?.code !== 200) {
        return {
          error: body?.error?.errorDesc || 'Failed to create SocialPay invoice',
        };
      }

      if (details.phone) {
        return {
          message:
            'Invoice sent to phone. Please open the SocialPay app to pay.',
        };
      }

      const qrData = await QRCode.toDataURL(body.response.desc);
      return {
        qrData,
        deeplink: body.response.desc,
      };
    } catch (e: any) {
      return { error: extractErrorMessage(e) };
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

      if (body?.response?.resp_code !== '00') {
        throw new Error(body?.response?.resp_desc || 'Payment not completed');
      }

      return PAYMENT_STATUS.PAID;
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async manualCheck(invoice: ITransactionDocument) {
    const amount = invoice.amount.toString();

    return this.checkInvoice({
      amount,
      invoice: invoice._id,
      terminal: this.inStoreSPTerminal,
      checksum: hmac256(
        this.inStoreSPKey,
        `${this.inStoreSPTerminal}${invoice._id}${amount}`
      ),
    });
  }

  async cancelInvoice(invoice: ITransactionDocument) {
    const amount = invoice.amount.toString();

    try {
      await this.request({
        path: PAYMENTS.socialpay.actions.invoiceCancel,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          amount,
          invoice: invoice._id,
          terminal: this.inStoreSPTerminal,
          checksum: hmac256(
            this.inStoreSPKey,
            `${this.inStoreSPTerminal}${invoice._id}${amount}`
          ),
        },
      });

      return { success: true };
    } catch (e: any) {
      return { error: extractErrorMessage(e) };
    }
  }
}
