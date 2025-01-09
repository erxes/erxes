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
  getStripeKey(_id: string): Promise<string>;
}

export const loadPaymentClass = (models: IModels) => {
  class Payment {
    public static async createPayment(doc: IPayment) {
      console.debug('Creating payment', doc);
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

    public static async getStripeKey(_id: string) {
      const payment = await models.PaymentMethods.findOne({ _id }).lean();

      if (!payment) {
        console.error(`Payment not found with given id ${_id}`);
        return null;
      }

      if (payment.kind !== 'stripe') {
        return null;
      }

      return payment.config.publishableKey;
    }
  }

  paymentSchema.loadClass(Payment);

  return paymentSchema;
};
