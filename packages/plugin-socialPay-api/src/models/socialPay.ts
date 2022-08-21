import { Model } from 'mongoose';
import {
  socialPayInvoiceSchema,
  ISocialPayInvoiceDocument
} from './definitions/socialPay';

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
