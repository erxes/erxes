import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';

import { IInstagramConfigDocument, IInstagramConfig } from '../../@types/configs';
import { configSchema } from '../definitions/configs';

export interface IInstagramConfigModel extends Model<IInstagramConfigDocument> {
    getConfig(code: string): Promise<IInstagramConfigDocument>;
    updateConfigs(configsMap): Promise<void>;
    createOrUpdateConfig({ code, value }: IInstagramConfig): IInstagramConfigDocument;
  }
  
  export const loadInstagramConfigClass = (models: IModels) => {
    class Config {
      /*
       * Get a Config
       */
      public static async getConfig(code: string) {
        const config = await models.InstagramConfig.findOne({ code });
  
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
        const obj = await models.InstagramConfig.findOne({ code });
  
        if (obj) {
          await models.InstagramConfig.updateOne({ _id: obj._id }, { $set: { value } });
  
          return models.InstagramConfig.findOne({ _id: obj._id });
        }
  
        return models.InstagramConfig.create({ code, value });
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
  
          await models.InstagramConfig.createOrUpdateConfig(doc);
        }
      }
    }
  
    configSchema.loadClass(Config);
  
    return configSchema;
  };
  