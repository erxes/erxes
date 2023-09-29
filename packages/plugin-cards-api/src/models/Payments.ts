import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IPaymentType,
  IPaymentTypeDocument,
  paymentTypeSchema
} from './definitions/payments';

export interface IPaymentTypeModel extends Model<IPaymentTypeDocument> {
  getPaymentType(_id: string): Promise<IPaymentTypeDocument>;
  createPaymentType(user, doc: IPaymentType): Promise<IPaymentTypeDocument>;
  updatePaymentType(
    _id: string,
    doc: IPaymentType
  ): Promise<IPaymentTypeDocument>;
  removePaymentType(_id: string): void;
}

export const loadPaymentTypeClass = (models: IModels, subdomain: string) => {
  class PaymentType {
    public static async createPaymentType(user, doc: IPaymentType) {
      try {
        return models.PaymentTypes.create({
          ...doc,
          userId: user._id
        });
      } catch (e) {
        throw new Error(
          `Can not create POS integration. Error message: ${e.message}`
        );
      }
    }

    public static async getPaymentType(_id: string) {
      // tslint:disable-next-line:no-shadowed-variable
      const PaymentType = await models.PaymentTypes.findOne({ _id });

      if (!PaymentType) {
        throw new Error('PaymentType not found');
      }
      return PaymentType;
    }

    public static async updatePaymentType(_id: string, doc: IPaymentType) {
      await models.PaymentTypes.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true }
      );

      return models.PaymentTypes.findOne({ _id });
    }

    public static async removePaymentType(_id: string) {
      const data = await models.PaymentTypes.getPaymentType(_id);

      if (!data) {
        throw new Error(`not found with id ${_id}`);
      }
      return models.PaymentTypes.remove({ _id });
    }
  }

  paymentTypeSchema.loadClass(PaymentType);

  return paymentTypeSchema;
};
