import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import redisUtils from '../redisUtils';
import {
  IInvoice,
  IInvoiceDocument,
  invoiceSchema,
} from './definitions/invoices';
import { PAYMENT_STATUS } from '../api/constants';

export interface IInvoiceModel extends Model<IInvoiceDocument> {
  getInvoice(doc: any, leanObject?: boolean): IInvoiceDocument;
  createInvoice(doc: IInvoice): Promise<IInvoiceDocument>;
  updateInvoice(_id: string, doc: any): Promise<IInvoiceDocument>;
  cancelInvoice(_id: string): Promise<string>;
  checkInvoice(_id: string): Promise<string>;
  removeInvoices(_ids: string[]): Promise<any>;
  markAsPaid(_id: string): Promise<string>;
}

export const loadInvoiceClass = (models: IModels) => {
  class Invoices {
    public static async getInvoice(doc: any, leanObject?: boolean) {
      const invoice = leanObject
        ? await models.Invoices.findOne(doc).lean()
        : await models.Invoices.findOne(doc);

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    }

    public static async createInvoice(doc: IInvoice) {
      if (!doc.amount && doc.amount === 0) {
        throw new Error('Amount is required');
      }

      return models.Invoices.create(doc);
    }

    public static async updateInvoice(_id: string, doc: any) {
      const result = await models.Invoices.updateOne({ _id }, { $set: doc });

      if (result.matchedCount === 0) {
        throw new Error('Invoice not found');
      }

      return models.Invoices.getInvoice({ _id });
    }

    public static async cancelInvoice(_id: string) {
      const invoice = await models.Invoices.getInvoice({ _id });

      // if (invoice.status !== 'pending') {
      //   throw new Error('Already settled');
      // }

      // const payment = await models.PaymentMethods.getPayment(
      //   invoice.selectedPaymentId
      // );

      // const api = new ErxesPayment(payment);

      // api.cancelInvoice(invoice);

      // await models.Invoices.deleteOne({ _id });

      // redisUtils.removeInvoice(_id);

      return 'success';
    }

    public static async checkInvoice(_id: string) {
      const invoice = await models.Invoices.getInvoice({ _id });

      const transactions = await models.Transactions.find({
        invoiceId: invoice._id,
        status: 'paid',
      });

      // sum of paid transactions
      const paidAmount = transactions.reduce(
        (acc, transaction) => acc + transaction.amount,
        0
      );

      if (paidAmount >= invoice.amount) {
        await models.Invoices.updateOne(
          { _id },
          { $set: { status: PAYMENT_STATUS.PAID, resolvedAt: new Date() } },
        );
        return PAYMENT_STATUS.PAID;
      }

      return PAYMENT_STATUS.PENDING;
    }

    public static async removeInvoices(_ids: string[]) {
      const invoiceIds = await models.Invoices.find({
        _id: { $in: _ids },
        status: { $ne: 'paid' },
      }).distinct('_id');

      const transactions = await models.Transactions.find({
        invoiceId: { $in: invoiceIds },
        status: { $ne: 'paid'}
      }).distinct('_id');

      await models.Transactions.deleteMany({ _id: { $in: transactions } });

      await models.Invoices.deleteMany({ _id: { $in: invoiceIds } });

      redisUtils.removeInvoices(_ids);

      return 'removed';
    }

    public static async markAsPaid(_id: string) {
      const invoice = await models.Invoices.getInvoice({ _id });

      if (invoice.status === 'paid') {
        throw new Error('Already paid');
      }

      await models.Invoices.updateOne(
        { _id },
        { $set: { status: 'paid', resolvedAt: new Date() } },
      );

      return 'success';
    }
  }

  invoiceSchema.loadClass(Invoices);
  return invoiceSchema;
};
