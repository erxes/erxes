import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { paymentSchema } from '@/payment/db/definitions/payment';
import { IPayment, IPaymentDocument } from '@/payment/@types/payment';

export interface IPaymentModel extends Model<IPaymentDocument> {
  getPayment(_id: string): Promise<IPaymentDocument>;
  getPayments(): Promise<IPaymentDocument[]>;
  createPayment(doc: IPayment): Promise<IPaymentDocument>;
  updatePayment(_id: string, doc: IPayment): Promise<IPaymentDocument>;
  removePayment(PaymentId: string): Promise<{  ok: number }>;
  getStripeKey(_id: string): Promise<string>;
}

export const loadPaymentClass = (models: IModels) => {
  class Payment {
    /**
     * Retrieves payment
     */
    public static async getPayment(_id: string) {
      const Payment = await models.PaymentMethods.findOne({ _id }).lean();

      if (!Payment) {
        throw new Error('Payment not found');
      }

      return Payment;
    }

    /**
     * Retrieves all payments
     */
    public static async getPayments(): Promise<IPaymentDocument[]> {
      return models.PaymentMethods.find().lean();
    }

    /**
     * Create a payment
     */
    public static async createPayment(doc: IPayment): Promise<IPaymentDocument> {
      return models.PaymentMethods.create(doc);
    }

    /*
     * Update payment
     */
    public static async updatePayment(_id: string, doc: IPayment) {
      return await models.PaymentMethods.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
      );
    }

    /**
     * Remove payment
     */
    public static async removePayment(PaymentId: string[]) {
      return models.PaymentMethods.deleteOne({ _id: { $in: PaymentId } });
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
