import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import { IConfig, IConfigDocument } from '@/pms/@types/configs';
import { configSchema } from '@/pms/db/definitions/configs';

export interface IConfigModel extends Model<IConfigDocument> {
  getConfig(code: string, defaultValue?: any): Promise<any>;
  createOrUpdateConfig({ code, value, pipelineId }: IConfig): IConfigDocument;
}

export const loadConfigClass = (models: IModels) => {
  class Config {
    /*
     * Get a Config
     */
    public static async getConfig(code: string, defaultValue: any) {
      const config = await models.Configs.findOne({ code });

      if (!config || !config.code) {
        return defaultValue;
      }

      return config.value;
    }

    /**
     * Create or update config
     */
    public static async createOrUpdateConfig({
      code,
      value,
      pipelineId,
    }: {
      code: string;
      value: string;
      pipelineId: string;
    }) {
      const obj = await models.Configs.findOne({ code });

      if (obj) {
        await models.Configs.updateOne(
          { _id: obj._id },
          { $set: { value, pipelineId } },
        );

        return models.Configs.findOne({ _id: obj._id });
      }

      return models.Configs.create({ code, value, pipelineId });
    }
  }

  configSchema.loadClass(Config);

  return configSchema;
};
