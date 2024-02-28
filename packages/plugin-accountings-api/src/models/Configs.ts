import { Model, model } from 'mongoose';
// import { COMPANY_INDUSTRY_TYPES, SEX_OPTIONS, SOCIAL_LINKS } from '@erxes/api-utils/src/constants';
import {
  accountingsConfigSchema,
  IAccountingsConfig,
  IAccountingsConfigDocument,
} from './definitions/configs';

export interface IAccountingsConfigModel
  extends Model<IAccountingsConfigDocument> {
  getConfig(code: string, defaultValue?: string): Promise<any>;
  createOrUpdateConfig({
    code,
    value,
  }: IAccountingsConfig): IAccountingsConfigDocument;
  constants();
}

export const loadAccountingsConfigClass = (models) => {
  class AccountingsConfig {
    /*
     * Get a Config
     */
    public static async getConfig(code: string, defaultValue?: any) {
      const config = await models.AccountingsConfigs.findOne({ code });

      if (!config) {
        return defaultValue || '';
      }

      return config.value;
    }

    /**
     * Create or update config
     */
    public static async createOrUpdateConfig({
      code,
      value,
    }: {
      code: string;
      value: string[];
    }) {
      const obj = await models.AccountingsConfigs.findOne({ code });

      if (obj) {
        await models.AccountingsConfigs.updateOne(
          { _id: obj._id },
          { $set: { value } },
        );

        return models.AccountingsConfigs.findOne({ _id: obj._id });
      }

      return models.AccountingsConfigs.create({ code, value });
    }

    public static constants() {
      return {};
    }
  }

  accountingsConfigSchema.loadClass(AccountingsConfig);

  return accountingsConfigSchema;
};
