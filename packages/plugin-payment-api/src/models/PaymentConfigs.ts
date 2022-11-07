import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IPaymentConfig,
  IPaymentConfigDocument,
  paymentConfigSchema
} from './definitions/paymentConfigs';

export interface IPaymentConfigModel extends Model<IPaymentConfigDocument> {
  createConfig(doc: IPaymentConfig): Promise<IPaymentConfigDocument>;
  updateConfig(_id: string, paymentIds: string[]): void;
  getConfig(doc: any): Promise<IPaymentConfigDocument>;
  removeConfig(_id: string): void;
}

export const loadPaymentConfigClass = (models: IModels) => {
  class PaymentConfig {
    public static async createConfig(doc: IPaymentConfig) {
      const paymentConfig = await models.PaymentConfigs.findOne({
        contentType: doc.contentType,
        contentTypeId: doc.contentTypeId
      });

      if (paymentConfig) {
        throw new Error('Payment Config already exists');
      }

      return models.PaymentConfigs.create(doc);
    }

    public static async updateConfig(_id: string, paymentIds: string[]) {
      const paymentConfig = await models.PaymentConfigs.getConfig({ _id });

      paymentConfig.paymentIds = paymentIds;

      return paymentConfig.save();
    }

    public static async removeConfig(_id: string) {
      return models.PaymentConfigs.deleteOne({ _id });
    }

    public static async getConfig(doc: any) {
      const paymentConfig = await models.PaymentConfigs.findOne(doc);

      if (!paymentConfig) {
        throw new Error('Payment Config not found');
      }

      return paymentConfig;
    }
  }

  paymentConfigSchema.loadClass(PaymentConfig);

  return paymentConfigSchema;
};
