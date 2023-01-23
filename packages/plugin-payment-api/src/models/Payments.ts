import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IPayment,
  IPaymentDocument,
  paymentSchema
} from './definitions/payments';

export interface IPaymentModel extends Model<IPaymentDocument> {
  createPayment(doc: IPayment): Promise<IPaymentDocument>;
  removePayment(_id: string): void;
  updatePayment(_id: string, doc: IPayment): Promise<IPaymentDocument>;
  getPayment(_id: string): Promise<IPaymentDocument>;
}

export const loadPaymentClass = (models: IModels) => {
  class Payment {
    public static async createPayment(doc: IPayment) {
      return models.Payments.create(doc);
    }

    public static async removePayment(_id: string) {
      return models.Payments.deleteOne({ _id });
    }

    public static async updatePayment(_id: string, doc: IPayment) {
      await models.Payments.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.Payments.findOne({ _id }).lean();

      return updated;
    }

    public static async getPayment(_id: string) {
      const payment = await models.Payments.findOne({ _id }).lean();

      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment;
    }
  }

  paymentSchema.loadClass(Payment);

  return paymentSchema;
};
