import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

import { IModels } from '../../connectionResolver';
import { PAYMENTS, PAYMENT_STATUS } from '../constants';
import { ITransactionDocument } from '../../models/definitions/transactions';
import { BaseAPI } from '../base';
import { IGolomtInvoice } from '../types';
import { randomAlphanumeric } from '@erxes/api-utils/src/random';

export const hmac256 = (key, message) => {
  const hash = crypto.createHmac('sha256', key).update(message);
  return hash.digest('hex');
};

export const golomtCallbackHandler = async (models: IModels, data: any) => {
  console.log('GOLOMT CALL BACK DATA', data);
  return {} as any;
};

export interface IGolomtParams {
  merchant: string;
  key: string;
  token: string;
}

export class GolomtAPI extends BaseAPI {
  private merchant: string;
  private key: string;
  private token: string;

  constructor(config: IGolomtParams) {
    super(config);
    this.merchant = config.merchant;
    this.token = config.token;
    this.key = config.key;
    this.apiUrl = PAYMENTS.golomt.apiUrl;
  }

  async createInvoice(invoice: ITransactionDocument) {
    console.log('merchant ', this.merchant);
    const amount = invoice.amount.toString();

    const data: IGolomtInvoice = {
      amount,
      checksum: hmac256(
        this.key,
        invoice._id +
          amount +
          'GET' +
          'http://localhost:4000/pl:payment/callback/golomt',
      ),
      transactionId: invoice._id,
      genToken: 'N',
      socialDeeplink: 'Y',
      callback: 'http://localhost:4000/pl:payment/callback/golomt',
      returnType: 'GET',
    };

    // if (details.phone) {
    //   data.phone = details.phone;

    //   data.checksum = hmac256(
    //     this.token,
    //     this.key + invoice._id + amount + details.phone
    //   );
    // }

    try {
      const res = await this.request({
        path: PAYMENTS.golomt.actions.invoice,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.token,
        },
        data,
      }).then((r) => r.json());
      console.log('res', res);
      return res;
    } catch (e) {
      console.error('eerrrrr', e);
      return { error: e.message };
    }
  }

  //   async cancelInvoice(invoice: ITransactionDocument) {
  //     const amount = invoice.amount.toString();

  //     const data: IGolomtInvoice = {
  //       amount,
  //       checksum: hmac256(this.token, this.key + invoice._id + amount),
  //       invoice: invoice._id,
  //       terminal: this.key,
  //     };

  //     try {
  //       return await this.request({
  //         path: PAYMENTS.golomt.actions.invoiceCancel,
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         data,
  //       });
  //     } catch (e) {
  //       throw new Error(e.message);
  //     }
  //   }

  //   async checkInvoice(data: any) {
  //     try {
  //       const { body } = await this.request({
  //         path: PAYMENTS.golomt.actions.invoiceCheck,
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         data,
  //       }).then((r) => r.json());

  //       if (body.response.resp_code !== '00') {
  //         throw new Error(body.response.resp_desc);
  //       }

  //       return PAYMENT_STATUS.PAID;
  //     } catch (e) {
  //       throw new Error(e.message);
  //     }
  //   }

  //   async manualCheck(invoice: ITransactionDocument) {
  //     const amount = invoice.amount.toString();

  //     const data: IGolomtInvoice = {
  //       amount,
  //       checksum: hmac256(this.token, this.key + invoice._id + amount),
  //       invoice: invoice._id,
  //       terminal: this.key,
  //     };

  //     try {
  //       const { body } = await this.request({
  //         path: PAYMENTS.golomt.actions.invoiceCheck,
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         data,
  //       }).then((r) => r.json());

  //       if (body.error) {
  //         return body.error.errorDesc;
  //       }

  //       if (body.response.resp_code !== '00') {
  //         throw new Error(body.response.resp_desc);
  //       }

  //       return PAYMENT_STATUS.PAID;
  //     } catch (e) {
  //       throw new Error(e.message);
  //     }
  //   }
}
