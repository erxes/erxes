import { Model, model } from 'mongoose';
import {
  IQPayInvoice,
  IQpayInvoiceDocument,
  qpayInvoiceSchema
} from './definitions/qpayInvoices';

export interface IQpayInvoiceModel extends Model<IQpayInvoiceDocument> {
  getInvoice(_id: string): Promise<IQpayInvoiceDocument>;
  createInvoice(doc: IQPayInvoice): Promise<IQpayInvoiceDocument>;
  updateInvoice(_id, invoiceData): void;
  getPaidAmount(orderId: string): Promise<number>;
}

export const loadQPayInvoiceClass = models => {
  class QPayInvoice {
    public static async getInvoice(_id: string) {
      const invoice = await models.QPayInvoices.findOne({ _id });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    }

    public static createInvoice(doc: IQPayInvoice) {
      return models.QPayInvoices.create({ ...doc });
    }

    public static async updateInvoice(_id: string, invoiceData) {
      const qpayInvoiceId = invoiceData.invoice_id;
      const qrText = invoiceData.qr_text;
      const urls = invoiceData.urls;

      await models.QPayInvoices.updateOne(
        { _id },
        { $set: { qpayInvoiceId, qrText, urls } }
      );
    }

    public static async getPaidAmount(orderId: string) {
      let amount = 0;

      const invoices = await models.QPayInvoices.find({
        senderInvoiceNo: orderId,
        status: 'PAID',
        qpayPaymentId: { $exists: true, $ne: null },
        paymentDate: { $exists: true, $ne: null }
      }).lean();

      for (const i of invoices) {
        amount += Number(i.amount || 0);
      }

      return amount;
    }
  }

  qpayInvoiceSchema.loadClass(QPayInvoice);
  return qpayInvoiceSchema;
};

export const QPayInvoices = model<IQpayInvoiceDocument, IQpayInvoiceModel>(
  'qpay_invoices',
  qpayInvoiceSchema
);
