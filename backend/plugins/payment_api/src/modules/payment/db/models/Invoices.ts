import { Model } from 'mongoose';
import ErxesPayment from '~/apis/ErxesPayment';
import { IModels } from '~/connectionResolvers';
import { PAYMENT_STATUS } from '~/constants';
import { IInvoice, IInvoiceDocument } from '~/modules/payment/@types/invoices';
import { invoiceSchema } from '~/modules/payment/db/definitions/invoices';
import redis from '~/utils/redis';

export interface IInvoiceModel extends Model<IInvoiceDocument> {
  getInvoice(doc: any, leanObject?: boolean): Promise<IInvoiceDocument>;
  createInvoice(doc: IInvoice, subdomain?: string): Promise<IInvoiceDocument>;
  updateInvoice(_id: string, doc: any): Promise<IInvoiceDocument>;
  cancelInvoice(_id: string): Promise<string>;
  checkInvoice(_id: string, subdomain: string): Promise<string>;
  removeInvoices(_ids: string[]): Promise<any>;
  markAsPaid(_id: string): Promise<string>;
  scanBarcode(code: string, eventSlug?: string): Promise<IInvoiceDocument>;
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
      console.log('[createInvoice] called');

      if (!doc.amount || doc.amount === 0) {
        throw new Error('Amount is required');
      }

      const invoice = await models.Invoices.create(doc);

      if (doc.paymentIds?.length === 1) {
        const payment = await models.PaymentMethods.getPayment(
          doc.paymentIds[0],
        );

        if (!payment) {
          throw new Error('Payment not found');
        }

        await models.Transactions.createTransaction({
          invoiceId: invoice._id,
          paymentId: payment._id,
          subdomain: subdomain || '',
          amount: invoice.amount,
          description: invoice.description,
        });

        return invoice;
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
              models.Transactions.checkTransaction(transaction._id, subdomain),
            ),
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
                  status: statusChecks[index],
                },
              },
            },
          }));

          if (bulkOps.length > 0) {
            await models.Transactions.bulkWrite(bulkOps);
          }
        } catch (error) {
          console.error(
            `Error checking transaction statuses: ${error.message}`,
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
        const failed = await models.Transactions.exists({
          invoiceId: _id,
          status: PAYMENT_STATUS.FAILED,
        });

        if (failed) {
          return PAYMENT_STATUS.FAILED;
        }

        return PAYMENT_STATUS.PENDING;
      }

      if (totalAmount[0].total < invoice.amount) {
        return PAYMENT_STATUS.PENDING;
      }

      await models.Invoices.updateOne(
        { _id },
        { $set: { status: PAYMENT_STATUS.PAID, resolvedAt: new Date() } },
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

    public static async scanBarcode(code: string, eventSlug?: string) {
      const invoice =
        (await models.Invoices.findOne({ 'ticketCodes.code': code })) ||
        (await models.Invoices.findOne({ invoiceNumber: code }));

      if (!invoice) {
        throw new Error(`Invoice not found for barcode: ${code}`);
      }

      if (invoice.status !== 'paid') {
        throw new Error('Invoice is not paid');
      }

      const expectedEventSlug = eventSlug?.trim();
      let storedEventSlug: string | undefined;
      if (expectedEventSlug) {
        storedEventSlug =
          typeof invoice.data?.eventSlug === 'string'
            ? invoice.data.eventSlug
            : undefined;
        if (storedEventSlug?.trim() !== expectedEventSlug) {
          throw new Error('Ticket belongs to a different event');
        }
      }

      const eventFilter = storedEventSlug
        ? { 'data.eventSlug': storedEventSlug }
        : {};

      const hasTicketCodes =
        Array.isArray(invoice.ticketCodes) && invoice.ticketCodes.length > 0;

      if (hasTicketCodes) {
        const scanned = await models.Invoices.findOneAndUpdate(
          {
            _id: invoice._id,
            ...eventFilter,
            ticketCodes: { $elemMatch: { code, scannedAt: null } },
          },
          {
            $set: {
              'ticketCodes.$.scannedAt': new Date(),
              scannedAt: new Date(),
            },
          },
          { new: true },
        );

        if (!scanned) {
          throw new Error('Barcode already scanned');
        }

        return scanned;
      }

      const scanned = await models.Invoices.findOneAndUpdate(
        { _id: invoice._id, ...eventFilter, scannedAt: null },
        { $set: { scannedAt: new Date() } },
        { new: true },
      );

      if (!scanned) {
        throw new Error('Barcode already scanned');
      }

      return scanned;
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
