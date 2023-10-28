import { IInvoice, invoiceSchema } from './definitions/invoices';
import { IInvoiceDocument } from './definitions/invoices';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongodb';
export interface IInvoiceModel extends Model<IInvoiceDocument> {
  getInvoice(selector: FilterQuery<IInvoiceDocument>);
  createInvoice(doc: IInvoice);
  updateInvoice(_id: string, doc: IInvoice);
  removeInvoices(_ids: string[]);
}
export const loadInvoiceClass = (models: IModels) => {
  class Invoice {
    /**
     *
     * Get Invoice
     */

    public static async getInvoice(selector: FilterQuery<IInvoiceDocument>) {
      const invoice = await models.Invoices.findOne(selector);

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    }

    /**
     * Create a invoice
     */
    public static async createInvoice(doc: IInvoice) {
      doc.total =
        (doc.payment || 0) +
        (doc.interestEve || 0) +
        (doc.interestNonce || 0) +
        (doc.insurance || 0) +
        (doc.undue || 0) +
        (doc.debt || 0);
      return models.Invoices.create(doc);
    }

    /**
     * Update Invoice
     */
    public static async updateInvoice(_id: string, doc: IInvoiceDocument) {
      await models.Invoices.updateOne({ _id }, { $set: doc });

      return models.Invoices.findOne({ _id });
    }

    /**
     * Remove Invoice
     */
    public static async removeInvoices(_ids: string[]) {
      return models.Invoices.deleteMany({ _id: { $in: _ids } });
    }
  }
  invoiceSchema.loadClass(Invoice);
  return invoiceSchema;
};
