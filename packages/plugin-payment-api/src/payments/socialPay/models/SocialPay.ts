import { Model } from 'mongoose';

import { makeInvoiceNo } from '../../../utils';
import {
  hmac256,
  socialPayInvoiceCheck,
  socialPayInvoicePhone,
  socialPayInvoiceQR
} from '../utils';
import {
  ISocialPayInvoiceDocument,
  socialPayInvoiceSchema
} from './definitions/socialPayInvoices';

export interface ISocialPayInvoiceModel
  extends Model<ISocialPayInvoiceDocument> {
  getSocialPayInvoice(invoiceNo: string): ISocialPayInvoiceDocument;
  socialPayInvoiceCreate(doc: any): ISocialPayInvoiceDocument;
  socialPayInvoiceUpdate(invoice: any, qrText: any): ISocialPayInvoiceDocument;
  socialPayInvoiceStatusUpdate(
    invoice: any,
    status: any
  ): ISocialPayInvoiceDocument;
  checkInvoice(data: any): any;
  createInvoice(data: any): any;
}

export const loadSocialPayInvoiceClass = models => {
  class SocialPayInvoices {
    public static async checkInvoice(data) {
      const { config, invoiceId } = data;
      const { inStoreSPTerminal, inStoreSPKey } = config;
      const invoice = await models.SocialPayInvoices.getSocialPayInvoice(
        invoiceId
      );

      const amount = invoice.amount;
      const checksum = await hmac256(
        inStoreSPKey,
        inStoreSPTerminal + invoiceId + amount
      );

      const requestBody = {
        amount,
        checksum,
        invoice: invoiceId,
        terminal: inStoreSPTerminal
      };
      const response: any = await socialPayInvoiceCheck(requestBody);

      if (
        response &&
        response.header.code === 200 &&
        response.body.response.resp_desc &&
        response.body.response.resp_desc === 'Амжилттай'
      ) {
        await models.SocialPayInvoices.socialPayInvoiceStatusUpdate(
          invoice,
          'paid'
        );
      }

      return {
        status: 'success',
        data: response
      };
    }

    public static async createInvoice(data) {
      const {
        amount,
        phone,
        config,
        customerId,
        companyId,
        contentType,
        contentTypeId
      } = data;
      const invoiceNo = await makeInvoiceNo(32);
      const { inStoreSPTerminal, inStoreSPKey } = config;

      const checksum = phone
        ? await hmac256(
            inStoreSPKey,
            inStoreSPTerminal + invoiceNo + amount + phone
          )
        : await hmac256(inStoreSPKey, inStoreSPTerminal + invoiceNo + amount);

      const doc = {
        amount,
        invoiceNo,
        customerId,
        companyId,
        contentType,
        contentTypeId
      };
      const docLast = phone ? { ...doc, phone } : doc;

      const invoiceLog = await models.SocialPayInvoices.socialPayInvoiceCreate(
        docLast
      );

      const requestBody = {
        amount,
        checksum,
        invoice: invoiceNo,
        terminal: inStoreSPTerminal
      };

      const requestBodyPhone = phone ? { ...requestBody, phone } : requestBody;

      const invoiceQrData: any = phone
        ? await socialPayInvoicePhone(requestBodyPhone)
        : await socialPayInvoiceQR(requestBody);

      const qrText =
        invoiceQrData.body &&
        invoiceQrData.body.response &&
        invoiceQrData.body.response.desc
          ? invoiceQrData.body.response.desc
          : '';

      console.log(requestBody, invoiceQrData);

      if (qrText) {
        await models.SocialPayInvoices.socialPayInvoiceUpdate(
          invoiceLog,
          qrText
        );
      }

      return {
        status: 'success',
        data: {
          status: 'socialPay success',
          data: { qr: qrText, invoiceNo }
        }
      };
    }

    public static async getSocialPayInvoice(invoiceNo: string) {
      const invoice = await models.SocialPayInvoices.findOne({ invoiceNo });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    }

    public static async socialPayInvoiceCreate(doc) {
      const invoice = await models.SocialPayInvoices.create({
        ...doc
      });

      if (!invoice) {
        throw new Error('Invoice not logged on collection');
      }

      return invoice;
    }

    public static async socialPayInvoiceUpdate(invoice, qrText) {
      console.log('invoiceQrData');
      console.log(qrText);

      await models.SocialPayInvoices.updateOne(
        { _id: invoice._id },
        { $set: { qrText } }
      );
    }

    public static async socialPayInvoiceStatusUpdate(invoice, status) {
      const invoiceOne = await models.SocialPayInvoices.findOne({
        _id: invoice._id
      });

      if (invoiceOne.status !== 'canceled payment') {
        console.log('status');
        console.log(status, invoice._id);

        await models.SocialPayInvoices.updateOne(
          { _id: invoice._id },
          { $set: { status } }
        );
      } else {
        console.log('already canceled payment, not change');
      }
    }
  }
  socialPayInvoiceSchema.loadClass(SocialPayInvoices);
  return socialPayInvoiceSchema;
};
