import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { model, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IConfigDocument } from '../../@types/configs';
import { configSchema } from '../definitions/configs';

export const Config = model('configs', configSchema);

export interface IConfigModel extends Model<IConfigDocument> {
  getConfigDetail(_id: string): Promise<IConfigDocument>;
  getConfig(
    code: string,
    subId?: string,
    defaultValue?: any,
  ): Promise<IConfigDocument | null>;
  getConfigs(code: string): Promise<IConfigDocument[]>;
  getConfigValue(
    code: string,
    subId?: string,
    defaultValue?: any,
  ): Promise<any>;
  getConfigValues(code: string): Promise<any[]>;

  createConfig(doc: {
    code: string;
    value: any;
    subId?: string;
  }): Promise<IConfigDocument>;

  updateConfig(
    _id: string,
    value: any,
    subId?: string,
  ): Promise<IConfigDocument | null>;
  removeConfig(_id: string): Promise<string>;
}

export const loadConfigClass = (
  models: IModels,
  _subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
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
    public static async getConfig(
      code: string,
      subId?: string,
      defaultValue?: any,
    ) {
      const config = await models.Configs.findOne({
        code,
        subId: subId ?? '',
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
    public static async getConfigValue(
      code: string,
      subId?: string,
      defaultValue?: any,
    ) {
      const config = await models.Configs.findOne({
        code,
        subId: subId ?? '',
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
      value,
    }: {
      code: string;
      value: any;
      subId?: string;
    }) {
      const filter = { code, subId: subId ?? '' };

      // 1️⃣ Check existence FIRST
      const existed = await models.Configs.findOne(filter);

      // 2️⃣ Upsert (safe for both create & update)
      const config = await models.Configs.findOneAndUpdate(
        filter,
        {
          $set: {
            code,
            subId: subId ?? '',
            value,
          },
        },
        {
          upsert: true,
          new: true,
        },
      );

      // 3️⃣ Correct event action
      sendDbEventLog({
        action: existed ? 'update' : 'create',
        docId: config._id,
        currentDocument: config.toObject(),
        prevDocument: existed?.toObject(),
      });

      return config;
    }

    /**
     * Update config
     */
    public static async updateConfig(_id: string, value: any, subId?: string) {
      const oldConf = await models.Configs.getConfigDetail(_id);

      await models.Configs.updateOne(
        { _id },
        { $set: { subId: subId ?? '', value } },
      );

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
     * Remove config
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

  configSchema.loadClass(ConfigClass);

  return configSchema;
};
