import { Document, Model, Schema } from 'mongoose';

import { IModels } from '../connectionResolver';
import { field } from './definitions/utils';

export interface IConfig {
  code: string;
  value: any;
}

export interface IConfigDocument extends IConfig, Document {
  _id: string;
}

export const configSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String, unique: true }),
  value: field({ type: Object })
});

export interface IConfigModel extends Model<IConfigDocument> {
  getConfig(code: string): Promise<IConfigDocument>;
  updateConfigs(configsMap): Promise<void>;
  createOrUpdateConfig({ code, value }: IConfig): IConfigDocument;
}

export const loadConfigClass = (models: IModels) => {
  class Config {
    /*
     * Get a Config
     */
    public static async getConfig(code: string) {
      const config = await models.Configs.findOne({ code });

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

        await models.Configs.createOrUpdateConfig(doc);
      }
    }
  }

  configSchema.loadClass(Config);

  return configSchema;
};
