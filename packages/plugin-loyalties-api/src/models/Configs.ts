import * as _ from 'underscore';
import {
  ILoyaltyConfig,
  ILoyaltyConfigDocument,
  loyaltyConfigSchema
} from './definitions/config';
import { IModels } from '../connectionResolver';
import { Model, model } from 'mongoose';

export interface ILoyaltyConfigModel extends Model<ILoyaltyConfigDocument> {
  getConfig(code: string): Promise<ILoyaltyConfigDocument>;
  createOrUpdateConfig({ code, value }: ILoyaltyConfig): ILoyaltyConfigDocument;
}

export const loadLoyaltyConfigClass = (models: IModels, _subdomain: string) => {
  class LoyaltyConfig {
    /*
     * Get a Config
     */
    public static async getConfig(code: string) {
      const config = await models.LoyaltyConfigs.findOne({ code });

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    /**
     * Create or update config
     */
    public static async createOrUpdateConfig({
      code,
      value
    }: {
      code: string;
      value: string[];
    }) {
      const obj = await models.LoyaltyConfigs.findOne({ code });

      if (obj) {
        await models.LoyaltyConfigs.updateOne(
          { _id: obj._id },
          { $set: { value } }
        );

        return models.LoyaltyConfigs.findOne({ _id: obj._id });
      }

      return models.LoyaltyConfigs.create({ code, value });
    }
  }

  loyaltyConfigSchema.loadClass(LoyaltyConfig);

  return loyaltyConfigSchema;
};
