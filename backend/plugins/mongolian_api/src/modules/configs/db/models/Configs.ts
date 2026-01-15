import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { model, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IConfig, IConfigDocument } from '../../@types/configs';
import {
  configSchema
} from '../definitions/configs';
export const Config = model('configs', configSchema);

export interface IConfigModel extends Model<IConfigDocument> {
  getConfigDetail(_id: string): Promise<IConfigDocument>;
  getConfig(code: string, subId?: string): Promise<IConfigDocument>;
  getConfigs(code: string): Promise<IConfigDocument[]>;
  getConfigValue(_id: string, defaultValue: any): Promise<any>;
  getConfigValues(code: string, defaultValue: any): Promise<any[]>;
  createConfig({ code, value, subId }: IConfig): Promise<IConfigDocument>;
  updateConfig(_id: string, value: any, subId?: string): Promise<IConfigDocument>;
  removeConfig(_id: string): Promise<string>;
}

export const loadConfigClass = (
  models: IModels,
  _subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class Config {
    /*
     * Get a Config
     */
    public static async getConfigDetail(_id: string) {
      const config = await models.Configs.findOne({ _id }).lean();

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    public static async getConfig(code: string, subId?: string) {
      const config = await models.Configs.findOne({ code, subId: subId ?? '' }).lean();

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    public static async getConfigs(code: string) {
      const configs = await models.Configs.find({ code }).lean();
      return configs;
    }

    public static async getConfigValue(_id: string, defaultValue: any) {
      const config = await models.Configs.findOne({ _id }).lean();
      if (!config) {
        return defaultValue;
      }

      return config.value;
    }

    public static async getConfigValues(code: string) {
      const configs = await models.Configs.find({ code }).lean();

      if (!configs?.length) {
        return [];
      }

      return configs.map(c => c.value);
    }

    /**
     * Create or update config
     */
    public static async createConfig({
      code,
      subId,
      value,
    }: {
      code: string;
      value: string[];
      subId?: string;
    }) {
      const newConfig = await models.Configs.create({ code, subId: subId ?? '', value });
      sendDbEventLog({
        action: 'create',
        docId: newConfig._id,
        currentDocument: newConfig.toObject(),
      });
      return newConfig;
    }

    /**
     * Update configs
     */
    public static async updateConfig(_id: string, value: any, subId?: string) {
      const oldConf = await models.Configs.getConfigDetail(_id);

      await models.Configs.updateOne({ _id }, { $set: { subId: subId ?? '', value } });
      const updatedConfig = await models.Configs.findOne({ _id });
      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: updatedConfig?.toObject(),
        prevDocument: oldConf,
      });
      return updatedConfig;
    }

    /**
     * Remove configs
     */
    public static async removeConfig(_id: string) {
      const oldConf = await models.Configs.getConfigDetail(_id);
      await models.Configs.deleteOne({ _id });

      sendDbEventLog({
        action: 'delete',
        docId: oldConf._id,
      });
      return 'success';
    }
  }

  configSchema.loadClass(Config);

  return configSchema;
};
