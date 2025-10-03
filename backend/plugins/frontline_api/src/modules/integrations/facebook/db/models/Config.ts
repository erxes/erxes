import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { configSchema } from '@/integrations/facebook/db/definitions/config';
import {
  IFacebookConfigDocument,
  IFacebookConfig,
} from '@/integrations/facebook/@types/config';

export interface IFacebookConfigModel extends Model<IFacebookConfigDocument> {
  getConfig(code: string): Promise<IFacebookConfigDocument>;
  updateConfigs(configsMap): Promise<void>;
  createOrUpdateConfig({
    code,
    value,
  }: IFacebookConfig): IFacebookConfigDocument;
}

export const loadFacebookConfigClass = (models: IModels) => {
  class Config {
    /*
     * Get a Config
     */
    public static async getConfig(code: string) {
      const config = await models.FacebookConfigs.findOne({ code });

      if (!config) {
        return { value: '' };
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
      value: string[];
    }) {
      const obj = await models.FacebookConfigs.findOne({ code });

      if (obj) {
        await models.FacebookConfigs.updateOne(
          { _id: obj._id },
          { $set: { value } },
        );

        return models.FacebookConfigs.findOne({ _id: obj._id });
      }

      return models.FacebookConfigs.create({ code, value });
    }

    /**
     * Update configs
     */
    public static async updateConfigs(configsMap) {
      const codes = Object.keys(configsMap);

      for (const code of codes) {
        if (!code) {
          continue;
        }

        const value = configsMap[code];
        const doc = { code, value };

        await models.FacebookConfigs.createOrUpdateConfig(doc);
      }
    }
  }

  configSchema.loadClass(Config);

  return configSchema;
};
