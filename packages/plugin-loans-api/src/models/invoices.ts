import { IInvoice, invoiceSchema } from './definitions/invoices';
import { IInvoiceDocument } from './definitions/invoices';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongodb';
import { CONTRACT_STATUS, LEASE_TYPES } from './definitions/constants';
import { getFullDate } from './utils/utils';
import { getCalcedAmounts } from './utils/transactionUtils';
export interface IInvoiceModel extends Model<IInvoiceDocument> {
  getInvoice(selector: FilterQuery<IInvoiceDocument>);
  createCreditMassInvoice(subdomain, date);
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
     * Create a invoice
     */
    public static async createCreditMassInvoice(subdomain, date = new Date()) {
      const contracts = await models.Contracts.find({
        leaseType: LEASE_TYPES.CREDIT,
        status: CONTRACT_STATUS.NORMAL
      });
      const nowDate = getFullDate(date);

      for await (let contract of contracts) {
        const lastSchedule = await models.Schedules.findOne({
          contractId: contract._id
        })
          .sort({ payDate: -1 })
          .lean();
        const payAmount = (lastSchedule?.balance || 0) * 0.1;

        const invoiceDate = new Date(
          nowDate.getFullYear(),
          nowDate.getMonth(),
          contract.scheduleDays[0] || 1
        );

        const isExistCurrentInvoice = await models.Invoices.findOne({
          contractId: contract._id,
          payDate: invoiceDate
        });

        if (
          payAmount === 0 ||
          isExistCurrentInvoice ||
          invoiceDate <= contract.startDate
        )
          continue;
        const calcInfo: any = getCalcedAmounts(models, subdomain, {
          contractId: contract._id,
          payDate: nowDate
        });
        calcInfo.payment = payAmount;
        calcInfo.payDate = invoiceDate;
        calcInfo.interestEve = contract.storedInterest;

        calcInfo.contractId = contract._id;
        calcInfo.total =
          (calcInfo.payment || 0) +
          (calcInfo.undue || 0) +
          (calcInfo.interestEve || 0) +
          (calcInfo.interestNonce || 0);

        await models.Invoices.create(calcInfo);
      }
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
