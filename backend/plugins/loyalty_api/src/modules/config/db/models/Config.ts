import { Model } from 'mongoose';
import { ILoyaltyConfig, ILoyaltyConfigDocument } from '~/modules/config/@types/config';
import { loyaltyConfigSchema } from '../definitions/config';
import { IModels } from '~/connectionResolvers';

export interface ILoyaltyConfigModel
  extends Model<ILoyaltyConfigDocument> {
  getConfig(code: string): Promise<ILoyaltyConfigDocument>;

  createOrUpdateConfig(
    doc: ILoyaltyConfig,
  ): Promise<ILoyaltyConfigDocument>;
}

export const loadLoyaltyConfigClass = (models: IModels) => {
  class LoyaltyConfig {
    /**
     * Get config by code
     */
    public static async getConfig(code: string) {
      const config = await models.LoyaltyConfig.findOne({ code }).lean();

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
      value,
    }: {
      code: string;
      value: any;
    }) {
      return models.LoyaltyConfig.findOneAndUpdate(
        { code },
        { $set: { value } },
        {
          upsert: true,
          new: true,
        },
      );
    }
  }

  loyaltyConfigSchema.loadClass(LoyaltyConfig);
  return loyaltyConfigSchema;
};

