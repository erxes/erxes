import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

import { IModels } from '~/connectionResolvers';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { BaseAPI } from '~/apis/base';
import { ISocialPayInvoice } from '../types';
import { random } from 'erxes-api-shared/utils';
import { extractErrorMessage } from '~/utils/extractErrorMessage';

export const hmac256 = (key: string, message: string): string =>
  crypto.createHmac('sha256', key).update(message).digest('hex');


export const socialpayCallbackHandler = async (
  models: IModels,
  data: any,
) => {
  const { resp_code, amount, checksum, invoice, terminal } = data;

  const transaction = await models.Transactions.getTransaction({
    _id: invoice,
  });

  const payment = await models.PaymentMethods.getPayment(
    transaction.paymentId,
  );

  try {
    if (resp_code !== '00') {
      transaction.status = PAYMENT_STATUS.FAILED;
      transaction.updatedAt = new Date();

      // Ensure response object exists
      if (!transaction.response) {
        transaction.response = {};
      }

      transaction.response.resp_code = resp_code;
      transaction.response.error = 'SocialPay callback failed';

      await transaction.save();

      return transaction;
    }

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
    const amount = '100';

    const data: ISocialPayInvoice = {
      amount,
      invoice: invoiceId,
      terminal: this.inStoreSPTerminal,
      checksum: hmac256(
        this.inStoreSPKey,
        this.inStoreSPTerminal + invoiceId + amount,
      ),
    };

    try {
      const { header, body } = await this.request({
        path: PAYMENTS.socialpay.actions.invoiceQr,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data,
      }).then((r) => r.json());

      if (header?.code !== 200) {
        throw new Error(body?.error?.errorDesc || 'Authorization failed');
      }

      if (body?.error?.errorDesc) {
        throw new Error(body.error.errorDesc);
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
        this.inStoreSPTerminal + invoice._id + amount,
      ),
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

      if (header?.code !== 200) {
        return { error: body?.error?.errorDesc || 'Create invoice failed' };
      }

      if (body?.response?.status !== 'SUCCESS') {
        return {
          error:
            body?.response?.desc || 'Error occurred while creating invoice',
        };
      }

      if (details.phone) {
        return {
          message:
            'Invoice has been sent to your phone. Please open SocialPay app to pay.',
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
        throw new Error(body?.response?.resp_desc || 'Not paid');
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
        this.inStoreSPTerminal + invoice._id + amount,
      ),
    });
  }

  async cancelInvoice(invoice: ITransactionDocument) {
    const amount = invoice.amount.toString();

    try {
      const { header, body } = await this.request({
        path: PAYMENTS.socialpay.actions.invoiceCancel,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          amount,
          invoice: invoice._id,
          terminal: this.inStoreSPTerminal,
          checksum: hmac256(
            this.inStoreSPKey,
            this.inStoreSPTerminal + invoice._id + amount,
          ),
        },
      }).then((r) => r.json());

      // HTTP-level validation
      if (header?.code !== 200) {
        throw new Error(body?.error?.errorDesc || 'Cancel invoice failed');
      }

      // Provider-level validation
      if (body?.response?.resp_code !== '00') {
        throw new Error(
          body?.response?.resp_desc || 'Invoice cancellation rejected',
        );
      }

      return { success: true };
    } catch (e: any) {
      return { error: extractErrorMessage(e) };
    }
  }
}
