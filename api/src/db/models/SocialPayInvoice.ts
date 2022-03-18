import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import {
  ISocialPayInvoice,
  ISocialPayInvoiceDocument,
  socialPayInvoiceSchema
} from './definitions/socialPayInvoice';

export interface ISocialPayInvoiceModel
  extends Model<ISocialPayInvoiceDocument> {
  getInvoice(_id: string): Promise<ISocialPayInvoiceDocument>;
  createInvoice(doc: ISocialPayInvoice): Promise<ISocialPayInvoiceDocument>;
  updateInvoice(
    _id: string,
    doc: ISocialPayInvoice
  ): Promise<ISocialPayInvoiceDocument>;
  removeInvoice(_id: string): void;
}

export const loadClass = () => {
  class SocialPayInvoice {
    public static async getInvoice(_id: string) {
      const invoice = await SocialPayInvoices.findOne({ _id });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    }

    public static async createInvoice(doc: ISocialPayInvoice) {
      const invoice = await SocialPayInvoices.create({
        ...doc,
        createdAt: new Date()
      });

      return invoice;
    }

    public static async updateInvoice(_id: string, doc: ISocialPayInvoice) {
      await SocialPayInvoices.updateOne({ _id }, { $set: { ...doc } });

      return SocialPayInvoices.findOne({ _id });
    }

    public static async removeInvoice(_id: string) {
      await SocialPayInvoices.getInvoice(_id);

      return SocialPayInvoices.deleteOne({ _id });
    }
  }

  socialPayInvoiceSchema.loadClass(SocialPayInvoice);

  return socialPayInvoiceSchema;
};

loadClass();

// tslint:disable-next-line
const SocialPayInvoices = model<
  ISocialPayInvoiceDocument,
  ISocialPayInvoiceModel
>('social_pay_invoices', socialPayInvoiceSchema);

export default SocialPayInvoices;
