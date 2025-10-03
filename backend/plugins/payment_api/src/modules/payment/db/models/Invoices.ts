import { Model } from 'mongoose';
import ErxesPayment from '~/apis/ErxesPayment';
import { IModels } from '~/connectionResolvers';
import { PAYMENT_STATUS } from '~/constants';
import { IInvoice, IInvoiceDocument } from '~/modules/payment/@types/invoices';
import { invoiceSchema } from '~/modules/payment/db/definitions/invoices';
import redis from '~/utils/redis';



export interface IInvoiceModel extends Model<IInvoiceDocument> {
  getInvoice(doc: any, leanObject?: boolean): IInvoiceDocument;
  createInvoice(doc: IInvoice, subdomain?: string): Promise<IInvoiceDocument>;
  updateInvoice(_id: string, doc: any): Promise<IInvoiceDocument>;
  cancelInvoice(_id: string): Promise<string>;
  checkInvoice(_id: string, subdomain: string): Promise<string>;
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

    public static async createInvoice(doc: IInvoice, subdomain?: string) {
      if (!doc.amount && doc.amount === 0) {
        throw new Error('Amount is required');
      }

      const invoice = await models.Invoices.create(doc);

      if (doc.paymentIds && doc.paymentIds.length === 1) {
        const payment = await models.PaymentMethods.getPayment(
          doc.paymentIds[0]
        );

        if (!payment) {
          throw new Error('Payment not found');
        }

        const transaction = await models.Transactions.createTransaction({
          invoiceId: invoice._id,
          paymentId: payment._id,
          subdomain: subdomain || '',
          amount: invoice.amount,
          description: invoice.description,
        });

        const api = new ErxesPayment(payment);

        try {
          const reponse = await api.createInvoice(transaction);
          transaction.response = reponse;
          invoice.save();

          return invoice;
        } catch (e) {
          await models.Invoices.deleteOne({ _id: invoice._id });
          await models.Transactions.deleteOne({ _id: transaction._id });
          throw new Error(`Error creating invoice: ${e.message}`);
        }
      }

      return invoice;
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

    public static async checkInvoice(_id: string, subdomain: string) {
      const unpaidTransactions = await models.Transactions.find({
        invoiceId: _id,
        status: 'pending',
      });

      if (unpaidTransactions.length > 0) {
        try {
          // Process transactions in parallel for better performance
          const statusChecks = await Promise.all(
            unpaidTransactions.map((transaction) =>
              models.Transactions.checkTransaction(transaction._id, subdomain)
            )
          );

          // Update transactions atomically using bulkWrite
          const bulkOps = unpaidTransactions.map((transaction, index) => ({
            updateOne: {
              filter: {
                _id: transaction._id,
                status: 'pending', // Ensure status hasn't changed
              },
              update: {
                $set: {
                  status: statusChecks[index] === 'paid' ? 'paid' : 'pending',
                },
              },
            },
          }));

          if (bulkOps.length > 0) {
            await models.Transactions.bulkWrite(bulkOps);
          }
        } catch (error) {
          console.error(
            `Error checking transaction statuses: ${error.message}`
          );
        }
      }

      const invoice = await models.Invoices.getInvoice({ _id });

      const totalAmount = await models.Transactions.aggregate([
        {
          $match: {
            invoiceId: _id,
            status: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      if (totalAmount.length === 0) {
        return PAYMENT_STATUS.PENDING;
      }

      if (totalAmount[0].total < invoice.amount) {
        return PAYMENT_STATUS.PENDING;
      }

      await models.Invoices.updateOne(
        { _id },
        { $set: { status: PAYMENT_STATUS.PAID, resolvedAt: new Date() } }
      );

      return PAYMENT_STATUS.PAID;
    }

    public static async removeInvoices(_ids: string[]) {
      const invoiceIds = await models.Invoices.find({
        _id: { $in: _ids },
        status: { $ne: 'paid' },
      }).distinct('_id');

      const transactions = await models.Transactions.find({
        invoiceId: { $in: invoiceIds },
        status: { $ne: 'paid' },
      }).distinct('_id');

      await models.Transactions.deleteMany({ _id: { $in: transactions } });

      await models.Invoices.deleteMany({ _id: { $in: invoiceIds } });

      redis.removeInvoices(_ids);

      return 'removed';
    }

    public static async markAsPaid(_id: string) {
      const invoice = await models.Invoices.getInvoice({ _id });

      if (invoice.status === 'paid') {
        throw new Error('Already paid');
      }

      await models.Invoices.updateOne(
        { _id },
        { $set: { status: 'paid', resolvedAt: new Date() } }
      );

      return 'success';
    }
  }

  invoiceSchema.loadClass(Invoices);
  return invoiceSchema;
};
