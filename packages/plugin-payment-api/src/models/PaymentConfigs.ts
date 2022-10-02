import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IPaymentConfig,
  IPaymentConfigDocument,
  paymentConfigSchema
} from './definitions/paymentConfigs';

export interface IPaymentConfigModel extends Model<IPaymentConfigDocument> {
  createPaymentConfig(doc: IPaymentConfig): Promise<IPaymentConfigDocument>;
  removePaymentConfig(_id: string): void;
  updatePaymentConfig(
    _id: string,
    doc: IPaymentConfig
  ): Promise<IPaymentConfigDocument>;
  getPaymentConfig(_id: string): Promise<IPaymentConfigDocument>;
}

export const loadPaymentConfigClass = (models: IModels) => {
  class PaymentConfig {
    public static async createPaymentConfig(doc: IPaymentConfig) {
      return models.PaymentConfigs.create(doc);
    }

    public static async removePaymentConfig(_id: string) {
      return models.PaymentConfigs.deleteOne({ _id });
    }

    public static async updatePaymentConfig(_id: string, doc: IPaymentConfig) {
      await models.PaymentConfigs.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.PaymentConfigs.findOne({ _id });

      return updated;
    }

    public static async getPaymentConfig(_id: string) {
      const paymentConfig = await models.PaymentConfigs.findOne({ _id });

      if (!paymentConfig) {
        throw new Error('Payment config not found');
      }

      return paymentConfig;
    }
  }

  paymentConfigSchema.loadClass(PaymentConfig);

  return paymentConfigSchema;
};
