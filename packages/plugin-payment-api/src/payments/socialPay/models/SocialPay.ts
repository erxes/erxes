import { Model } from 'mongoose';

import { IModels } from '../../../connectionResolver';
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
  getSocialPayInvoice(doc: any): ISocialPayInvoiceDocument;
  socialPayInvoiceCreate(doc: any): ISocialPayInvoiceDocument;
  socialPayInvoiceUpdate(invoice: any, qrText: any): ISocialPayInvoiceDocument;
  socialPayInvoiceStatusUpdate(
    invoice: any,
    status: any
  ): ISocialPayInvoiceDocument;
  checkInvoice(data: any): any;
  createInvoice(data: any, config: any): any;
}

export const loadSocialPayInvoiceClass = (models: IModels) => {
  class SocialPayInvoices {
    public static async checkInvoice(data) {
      const { config, invoiceId } = data;
      const { inStoreSPTerminal, inStoreSPKey } = config;
      const invoice = await models.SocialPayInvoices.getSocialPayInvoice({
        _id: invoiceId
      });

      const amount = invoice.amount;
      const checksum = await hmac256(
        inStoreSPKey,
        inStoreSPTerminal + invoice.invoiceNo + amount
      );

      const requestBody = {
        amount,
        checksum,
        invoice: invoice.invoiceNo,
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

        return { status: 'paid', _id: invoice._id };
      }

      if (response.body.error) {
        return { status: 'open', message: response.body.error.errorDesc };
      }
    }

    public static async createInvoice(data, config) {
      const {
        amount,
        phone,
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

      const invoice = await models.SocialPayInvoices.socialPayInvoiceCreate(
        docLast
      );

      const requestBody = {
        amount,
        checksum,
        invoice: invoiceNo,
        terminal: inStoreSPTerminal
      };

      const requestBodyPhone = phone ? { ...requestBody, phone } : requestBody;

      try {
        const invoiceQrData: any = phone
          ? await socialPayInvoicePhone(requestBodyPhone)
          : await socialPayInvoiceQR(requestBody);

        const qrText =
          invoiceQrData.body &&
          invoiceQrData.body.response &&
          invoiceQrData.body.response.desc
            ? invoiceQrData.body.response.desc
            : '';

        if (qrText) {
          await models.SocialPayInvoices.socialPayInvoiceUpdate(
            invoice,
            qrText
          );
        }

        return {
          status: 'success',
          data: { _id: invoice._id, qr: qrText, invoiceNo }
        };
      } catch (e) {
        throw new Error(e.message);
      }
    }

    public static async getSocialPayInvoice(doc: any) {
      const invoice = await models.SocialPayInvoices.findOne(doc);

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
      await models.SocialPayInvoices.updateOne(
        { _id: invoice._id },
        { $set: { qrText } }
      );
    }

    public static async socialPayInvoiceStatusUpdate(invoice, status) {
      if (invoice.status !== 'canceled payment') {
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
