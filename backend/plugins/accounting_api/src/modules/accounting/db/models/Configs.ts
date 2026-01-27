import { configSchema } from '../definitions/config';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { IConfigDocument } from '../../@types/config';
import { model, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export const Config = model('configs', configSchema);

export interface IConfigModel extends Model<IConfigDocument> {
  getConfigDetail(_id: string): Promise<IConfigDocument>;
  getConfig(
    code: string,
    subId?: string,
    defaultValue?: any
  ): Promise<IConfigDocument | null>;
  getConfigs(code: string): Promise<IConfigDocument[]>;
  getConfigValue(code: string, subId?: string, defaultValue?: any): Promise<any>;
  getConfigValues(code: string): Promise<any[]>;

  createConfig(doc: {
    code: string;
    value: any;
    subId?: string;
  }): Promise<IConfigDocument>;

  updateConfig(_id: string, value: any, subId?: string): Promise<IConfigDocument | null>;
  removeConfig(_id: string): Promise<string>;
  updateSingleByCode(code: string, value: any): Promise<IConfigDocument>;
}

export const loadConfigClass = (
  models: IModels,
  _subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn
) => {
  class ConfigClass {
    /*
     * Get a Config Detail
     */
    public static async getConfigDetail(_id: string) {
      const config = await models.Configs.findOne({ _id }).lean();

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    /*
     * Get a Config (nullable)
     */
    public static async getConfig(code: string, subId?: string, defaultValue?: any) {
      const config = await models.Configs.findOne({
        code,
        subId: subId ?? ''
      }).lean();

      if (!config) {
        if (defaultValue !== undefined) {
          return defaultValue;
        }

        return null;
      }

      return config;
    }

    /*
     * Get Configs
     */
    public static async getConfigs(code: string) {
      const configs = await models.Configs.find({ code }).lean();
      return configs;
    }

    /*
     * Get Config Value (nullable)
     */
    public static async getConfigValue(code: string, subId?: string, defaultValue?: any) {
      const config = await models.Configs.findOne({
        code,
        subId: subId ?? ''
      }).lean();

      if (!config) {
        return defaultValue ?? null;
      }

      return config.value;
    }

    /*
     * Get Config Values
     */
    public static async getConfigValues(code: string) {
      const configs = await models.Configs.find({ code }).lean();

      if (!configs?.length) {
        return [];
      }

      return configs.map((c) => c.value);
    }

    /**
     * Create config
     */
    public static async createConfig({
      code,
      subId,
      value
    }: {
      code: string;
      value: any;
      subId?: string;
    }) {
      const newConfig = await models.Configs.create({
        code,
        subId: subId ?? '',
        value
      });

      sendDbEventLog({
        action: 'create',
        docId: newConfig._id,
        currentDocument: newConfig.toObject()
      });

      return newConfig;
    }

    /**
     * Update config
     */
    public static async updateConfig(_id: string, value: any, subId?: string) {
      const oldConf = await models.Configs.getConfigDetail(_id);

      await models.Configs.updateOne(
        { _id },
        { $set: { subId: subId ?? '', value } }
      );

      const updatedConfig = await models.Configs.findOne({ _id });

      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: updatedConfig?.toObject(),
        prevDocument: oldConf
      });

      return updatedConfig;
    }

    /**
     * Remove config
     */
    public static async removeConfig(_id: string) {
      const oldConf = await models.Configs.getConfigDetail(_id);

      await models.Configs.deleteOne({ _id });

      sendDbEventLog({
        action: 'delete',
        docId: oldConf._id
      });

      return 'success';
    }

    /**
     * update subId must '' configs update by code
     */
    public static async updateSingleByCode(code: string, value: any) {
      const oldConf = await models.Configs.getConfig(code);
      if (oldConf) {
        await models.Configs.updateOne({ _id: oldConf._id }, { $set: { value } });
        sendDbEventLog({
          action: 'update',
          docId: oldConf._id,
          currentDocument: { code, value, subId: '' },
          prevDocument: oldConf
        });
      } else {
        const newConf = await models.Configs.create({ $set: { value, subId: '' } });
        sendDbEventLog({
          action: 'create',
          docId: newConf._id,
          currentDocument: newConf.toObject()
        });
      }
      return await models.Configs.getConfig(code)
    }
  }

  configSchema.loadClass(ConfigClass);

  return configSchema;
};
