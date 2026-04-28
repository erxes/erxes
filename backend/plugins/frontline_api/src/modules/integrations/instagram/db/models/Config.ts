import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import {
  IInstagramConfigDocument,
  IInstagramConfig,
} from '@/integrations/instagram/@types/config';
import { configSchema } from '@/integrations/instagram/db/definitions/config';

export interface IInstagramConfigModel extends Model<IInstagramConfigDocument> {
  getConfig(code: string): Promise<IInstagramConfigDocument>;
  updateConfigs(configsMap): Promise<void>;
  createOrUpdateConfig({
    code,
    value,
  }: IInstagramConfig): IInstagramConfigDocument;
}

export const loadInstagramConfigClass = (models: IModels) => {
  class Config {
    /*
     * Get a Config
     */
    public static async getConfig(code: string) {
      const config = await models.InstagramConfigs.findOne({ code });

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
      const obj = await models.InstagramConfigs.findOne({ code });

      if (obj) {
        await models.InstagramConfigs.updateOne(
          { _id: obj._id },
          { $set: { value } },
        );

        return models.InstagramConfigs.findOne({ _id: obj._id });
      }

      return models.InstagramConfigs.create({ code, value });
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

        await models.InstagramConfigs.createOrUpdateConfig(doc);
      }
    }
  }

  configSchema.loadClass(Config);

  return configSchema;
};
