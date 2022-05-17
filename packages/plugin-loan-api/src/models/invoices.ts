import { invoiceSchema } from './definitions/invoices';
import { IInvoiceDocument } from '../models/definitions/invoices';
import { Model } from 'mongoose';
export interface IInvoiceModel extends Model<IInvoiceDocument> {
  getInvoice(models, selector: any);
  createInvoice(models, doc);
  updateInvoice(models, _id, doc);
  removeInvoices(models, _ids);
}
export const loadInvoiceClass = models => {
  class Invoice {
    /**
     *
     * Get Invoice
     */

    public static async getInvoice(selector: any) {
      const invoice = await models.LoanInvoices.findOne(selector);

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    }

    /**
     * Create a invoice
     */
    public static async createInvoice(doc) {
      doc.total =
        (doc.payment || 0) +
        (doc.interestEve || 0) +
        (doc.interestNonce || 0) +
        (doc.insurance || 0) +
        (doc.undue || 0) +
        (doc.debt || 0);
      return models.LoanInvoices.create(doc);
    }

    /**
     * Update Invoice
     */
    public static async updateInvoice(_id, doc) {
      await models.LoanInvoices.updateOne({ _id }, { $set: doc });

      return models.LoanInvoices.findOne({ _id });
    }

    /**
     * Remove Invoice
     */
    public static async removeInvoices(_ids) {
      return models.LoanInvoices.deleteMany({ _id: { $in: _ids } });
    }
  }
  invoiceSchema.loadClass(Invoice);
  return invoiceSchema;
};
