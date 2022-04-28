import { Model } from 'mongoose';
import { COMPANY_INDUSTRY_TYPES, SEX_OPTIONS, SOCIAL_LINKS } from '@erxes/api-utils/src/constants';
import { configSchema, IConfig, IConfigDocument } from './definitions/configs';
import { IModels } from '../../connectionResolver';

export interface IConfigModel extends Model<IConfigDocument> {
  getConfig(code: string): Promise<IConfigDocument>;
  createOrUpdateConfig({ code, value }: IConfig): IConfigDocument;
  constants();
}

export const loadConfigClass = (models: IModels) => {
  class Config {
    /*
     * Get a Config
     */
    public static async getConfig(code: string) {
      const config = await models.Configs.findOne({ code });

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
      const obj = await models.Configs.findOne({ code });

      if (obj) {
        await models.Configs.updateOne({ _id: obj._id }, { $set: { value } });

        return models.Configs.findOne({ _id: obj._id });
      }

      return models.Configs.create({ code, value });
    }

    public static constants() {
      return {
        sex_choices: SEX_OPTIONS,
        company_industry_types: COMPANY_INDUSTRY_TYPES.map(v => ({
          label: v,
          value: v
        })),
        social_links: SOCIAL_LINKS
      };
    }
  }

  configSchema.loadClass(Config);

  return configSchema;
};
