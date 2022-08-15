import { Model } from 'mongoose';
import { qpayInvoiceSchema, IQpayInvoiceDocument } from './definitions/qpay';

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
      console.log(doc, 'mmmmmmmmmmmmmmmmm');
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
