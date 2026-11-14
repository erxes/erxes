import { Model } from 'mongoose';
import ErxesPayment from '~/apis/ErxesPayment';
import { IModels } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { transactionSchema } from '~/modules/payment/db/definitions/transactions';
import { PAYMENT_STATUS } from '~/constants';
import {
  markInvoicePaymentKindsStale,
  syncMarkedInvoicePaymentKinds,
} from '~/modules/payment/services/invoicePaymentKinds';
import { scheduleInvoiceRecheck } from '~/modules/payment/services/invoiceRecheckQueue';
export interface ITransactionModel extends Model<ITransactionDocument> {
  getTransaction(doc: any, leanObject?: boolean): Promise<ITransactionDocument>;
  createTransaction({
    invoiceId,
    paymentId,
    amount,
    subdomain,
    description,
    details,
  }: {
    invoiceId: string;
    paymentId: string;
    amount: number;
    subdomain: string;
    description?: string;
    details?: any;
  }): Promise<ITransactionDocument>;
  updateTransaction(_id: string, doc: any): Promise<ITransactionDocument>;
  cancelTransaction(_id: string): Promise<string>;
  checkTransaction(_id: string, subdomain: string): Promise<string>;
  removeTransactions(_ids: string[]): Promise<any>;
}

const generateCode = async (models: IModels) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
  const day = ('0' + currentDate.getDate()).slice(-2);
  const currentDateString = `${year}${month}${day}`;

  const last = await models.Transactions.findOne(
    {},
    {},
    { sort: { createdAt: -1 } },
  );

  let code = `${currentDateString}-0001`;
  if (last?.code) {
    const lastInvoiceDate = last.code.split('-')[0];
    const lastValue = Number(last.code.split('-')[1] || '0000');

    if (lastInvoiceDate === currentDateString) {
      const newIncrementalValue = lastValue + 1;
      const formattedIncrementalValue = ('0000' + newIncrementalValue).slice(
        -4,
      );
      code = `${currentDateString}-${formattedIncrementalValue}`;
    } else {
      code = `${currentDateString}-0001`;
    }
  } else {
    code = `${currentDateString}-0001`;
  }

  const codeExists = await models.Transactions.findOne({ code });

  if (codeExists) {
    code = await generateCode(models);
  }

  return code;
};

export const loadTransactionClass = (models: IModels) => {
  class Transactions {
    public static async getTransaction(doc: any, leanObject?: boolean) {
      const transaction = leanObject
        ? await models.Transactions.findOne(doc).lean()
        : await models.Transactions.findOne(doc);

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return transaction;
    }

    public static async createTransaction(doc: any) {
      const { subdomain } = doc;
      if (!doc.amount || doc.amount === 0) {
        throw new Error('Amount is required');
      }

      const paymentMethod = await models.PaymentMethods.getPayment(
        doc.paymentId,
      );

      const updatedDoc = {
        ...doc,
        paymentKind: paymentMethod.kind,
        status: 'pending',
        code: await generateCode(models),
      };

      await markInvoicePaymentKindsStale(models, [doc.invoiceId]);

      const transaction = await models.Transactions.create(updatedDoc);


      try {
        const api = new ErxesPayment(paymentMethod, subdomain, models);
        const reponse = await api.createInvoice(transaction.toObject());
        console.log('[MODEL] api.createInvoice returned', reponse); // reponse, not response
        transaction.response = reponse;
        await transaction.save();
      } catch (e) {
        await models.Transactions.deleteOne({ _id: transaction._id });
        await syncMarkedInvoicePaymentKinds(models, [transaction.invoiceId]);
        throw new Error(`Error creating transaction: ${e.message}`);
      }

      // outside the try: a failure here must not delete a created transaction
      await syncMarkedInvoicePaymentKinds(models, [transaction.invoiceId]);

      // Re-checks the invoice with its provider later, in case the paid
      // callback never arrives (customer closed the page, provider push lost).
      // A failure to queue must not fail the payment the customer is making.
      try {
        await scheduleInvoiceRecheck(subdomain, transaction.invoiceId);
      } catch (e) {
        console.error(
          `Failed to schedule re-check for invoice ${transaction.invoiceId}: ${e.message}`,
        );
      }

      return transaction;
    }

    public static async updateTransaction(_id: string, doc: any) {
      const result = await models.Transactions.updateOne(
        { _id },
        { $set: doc },
      );

      if (result.matchedCount === 0) {
        throw new Error('Transaction not found');
      }

      return models.Transactions.getTransaction({ _id });
    }

    public static async cancelTransaction(_id: string) {
      const transaction = await models.Transactions.getTransaction({ _id });

      if (transaction.status !== 'pending') {
        throw new Error('Already settled');
      }

      const payment = await models.PaymentMethods.getPayment(
        transaction.paymentId,
      );
      const api = new ErxesPayment(payment);

      await markInvoicePaymentKindsStale(models, [transaction.invoiceId]);

      try {
        api.cancelInvoice(transaction);
        await models.Transactions.deleteOne({ _id });
      } catch (e) {
        console.error(e);

        return 'error';
      } finally {
        await syncMarkedInvoicePaymentKinds(models, [transaction.invoiceId]);
      }

      return 'success';
    }

    public static async checkTransaction(_id: string, subdomain: string) {
      const transaction = await models.Transactions.getTransaction({ _id });

      const payment = await models.PaymentMethods.getPayment(
        transaction.paymentId,
      );

      const api = new ErxesPayment(payment, subdomain, models);

      const status = await api.manualCheck(transaction);
      if (
        [
          PAYMENT_STATUS.PAID,
          PAYMENT_STATUS.FAILED,
          PAYMENT_STATUS.CANCELLED,
          PAYMENT_STATUS.REJECTED,
          PAYMENT_STATUS.EXPIRED,
        ].includes(status)
      ) {
        transaction.status = status;
        await transaction.save();
      }

      if (status === 'paid') {
        transaction.status = status;
        await transaction.save();
      }

      return status;
    }

    public static async removeTransactions(_ids: string[]) {
      const transactions = await models.Transactions.find({
        _id: { $in: _ids },
      });

      if (!transactions) {
        throw new Error('Transactions not found');
      }

      const invoiceIds = transactions.map(
        (transaction) => transaction.invoiceId,
      );

      await markInvoicePaymentKindsStale(models, invoiceIds);

      await models.Transactions.deleteMany({ _id: { $in: _ids } });

      await syncMarkedInvoicePaymentKinds(models, invoiceIds);

      return 'success';
    }
  }
  transactionSchema.loadClass(Transactions);
  return transactionSchema;
};
