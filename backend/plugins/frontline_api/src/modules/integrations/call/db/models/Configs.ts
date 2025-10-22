import { Model, Schema } from 'mongoose';

import { field } from '../utils';

import { IModels } from '~/connectionResolvers';
import {
  ICallConfig,
  ICallConfigDocument,
} from '@/integrations/call/@types/config';

export const configSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String, unique: true }),
  value: field({ type: Object }),
});

export interface ICallConfigModel extends Model<ICallConfigDocument> {
  getConfig(code: string): Promise<ICallConfigDocument>;
  updateConfigs(configsMap): Promise<void>;
  createOrUpdateConfig({
    code,
    value,
  }: ICallConfig): Promise<ICallConfigDocument>;
}

export const loadCallConfigClass = (models: IModels) => {
  class Config {
    /*
     * Get a Config
     */
    public static async getConfig(code: string) {
      const config = await models.CallConfigs.findOne({ code });

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
      value: any;
    }) {
      const obj = await models.CallConfigs.findOne({ code });

      if (obj) {
        await models.CallConfigs.updateOne(
          { _id: obj._id },
          { $set: { value } },
        );

        return await models.CallConfigs.findOne({ _id: obj._id });
      }

      return await models.CallConfigs.create({ code, value });
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

        await models.CallConfigs.createOrUpdateConfig(doc);
      }
    }
  }

  configSchema.loadClass(Config);

  return configSchema;
};
