import { Model } from 'mongoose';
import {
  accountingConfigSchema,
  IAccountingConfig,
  IAccountingConfigDocument,
} from './definitions/config';

export interface IAccountingConfigModel
  extends Model<IAccountingConfigDocument> {
  getConfig(code: string, defaultValue?: string): Promise<any>;
  getConfigs(codes: string[]): Promise<any>;
  createOrUpdateConfig({
    code,
    value,
  }: IAccountingConfig): Promise<IAccountingConfigDocument>;
  constants();
}

export const loadAccountingConfigClass = (models) => {
  class AccountingConfig {
    /*
     * Get a Config
     */
    public static async getConfig(code: string, defaultValue?: any) {
      const config = await models.AccountingConfigs.findOne({ code });

      if (!config) {
        return defaultValue || '';
      }

      return config.value;
    }

    /*
     * Get a Configs
     */
    public static async getConfigs(codes: string[]) {
      const configs = await models.AccountingConfigs.find({ code: { $in: codes } });
      const result: any = {};
      for (const code of codes) {
        result[code] = configs.find(c => c.code === code)?.value;
      }
      return result;
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
      const obj = await models.AccountingConfigs.findOne({ code });

      if (obj) {
        await models.AccountingConfigs.updateOne(
          { _id: obj._id },
          { $set: { value } },
        );

        return models.AccountingConfigs.findOne({ _id: obj._id });
      }

      return models.AccountingConfigs.create({ code, value });
    }

    public static constants() {
      return {};
    }
  }

  accountingConfigSchema.loadClass(AccountingConfig);

  return accountingConfigSchema;
};
