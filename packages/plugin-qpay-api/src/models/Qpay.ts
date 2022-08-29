import { Model } from 'mongoose';
import {
  qpayInvoiceSchema,
  socialPayInvoiceSchema,
  IQpayInvoiceDocument,
  ISocialPayInvoiceDocument
} from './definitions/qpay';

export interface IQpayInvoiceModel extends Model<IQpayInvoiceDocument> {
  getQpayInvoice(_id: string): IQpayInvoiceDocument;
  qpayInvoiceCreate(doc: any): IQpayInvoiceDocument;
  qpayInvoiceUpdate(invoice: any, invoiceData: any): IQpayInvoiceDocument;
}

export const loadQpayInvoiceClass = models => {
  class QpayInvoice {
    public static async getQpayInvoice(_id: string) {
      const invoice = await models.QpayInvoice.findOne({ _id });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    }

    public static async qpayInvoiceCreate(doc) {
      const invoice = await models.QpayInvoice.findOne({
        senderInvoiceNo: doc.senderInvoiceNo
      });

      if (invoice) {
        throw new Error('senderInvoiceNo duplicated');
      }

      return await models.QpayInvoice.create({
        ...doc
      });
    }

    public static async qpayInvoiceUpdate(invoice, invoiceData) {
      const qpayInvoiceId = invoiceData.invoice_id;
      const qrText = invoiceData.qr_text;
      await models.QpayInvoice.updateOne(
        { _id: invoice._id },
        { $set: { qpayInvoiceId, qrText } }
      );
    }
  }
  qpayInvoiceSchema.loadClass(QpayInvoice);
  return qpayInvoiceSchema;
};

export interface ISocialPayInvoiceModel
  extends Model<ISocialPayInvoiceDocument> {
  getSocialPayInvoice(invoiceNo: string): ISocialPayInvoiceDocument;
  socialPayInvoiceCreate(doc: any): ISocialPayInvoiceDocument;
  socialPayInvoiceUpdate(invoice: any, qrText: any): ISocialPayInvoiceDocument;
  socialPayInvoiceStatusUpdate(
    invoice: any,
    status: any
  ): ISocialPayInvoiceDocument;
}

export const loadSocialPayInvoiceClass = models => {
  class SocialPayInvoice {
    public static async getSocialPayInvoice(invoiceNo: string) {
      const invoice = await models.SocialPayInvoice.findOne({ invoiceNo });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    }

    public static async socialPayInvoiceCreate(doc) {
      const invoice = await models.SocialPayInvoice.create({
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

      await models.SocialPayInvoice.updateOne(
        { _id: invoice._id },
        { $set: { qrText } }
      );
    }

    public static async socialPayInvoiceStatusUpdate(invoice, status) {
      const invoiceOne = await models.SocialPayInvoice.findOne({
        _id: invoice._id
      });

      if (invoiceOne.status !== 'canceled payment') {
        console.log('status');
        console.log(status, invoice._id);

        await models.SocialPayInvoice.updateOne(
          { _id: invoice._id },
          { $set: { status } }
        );
      } else {
        console.log('already canceled payment, not change');
      }
    }
  }
  socialPayInvoiceSchema.loadClass(SocialPayInvoice);
  return socialPayInvoiceSchema;
};

// export default [
//   {
//     name: '',
//     schema: qpayInvoiceSchema,
//     klass: QpayInvoice,
//   },
//   {
//     name: '',
//     schema: socialPayInvoiceSchema,
//     klass: SocialPayInvoice,
//   },
// ];
