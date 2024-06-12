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
      return models.PaymentMethods.create(doc);
    }

    public static async removePayment(_id: string) {
      return models.PaymentMethods.deleteOne({ _id });
    }

    public static async updatePayment(_id: string, doc: IPayment) {
      await models.PaymentMethods.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.PaymentMethods.findOne({ _id }).lean();

      return updated;
    }

    public static async getPayment(_id: string) {
      const payment = await models.PaymentMethods.findOne({ _id }).lean();

      if (!payment) {
        console.error(`Payment not found with given id ${_id}`);
        return null;
      }

      return payment;
    }
  }

  paymentSchema.loadClass(Payment);

  return paymentSchema;
};
