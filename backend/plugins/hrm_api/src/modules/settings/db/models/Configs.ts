import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { HrmConfigValue, IHrmConfigDocument } from '../../@types/config';
import { hrmConfigSchema } from '../definitions/config';

export interface IConfigModel extends Model<IHrmConfigDocument> {
  getConfigDetail(_id: string): Promise<IHrmConfigDocument>;
  getConfig(
    code: string,
    subId?: string,
    defaultValue?: HrmConfigValue,
  ): Promise<IHrmConfigDocument | HrmConfigValue | null>;
  getConfigs(code: string): Promise<IHrmConfigDocument[]>;
  getConfigValue(
    code: string,
    subId?: string,
    defaultValue?: HrmConfigValue,
  ): Promise<HrmConfigValue | null>;
  createConfig(doc: {
    code: string;
    value?: HrmConfigValue;
    subId?: string;
  }): Promise<IHrmConfigDocument>;
  updateConfig(
    _id: string,
    value?: HrmConfigValue,
    subId?: string,
  ): Promise<IHrmConfigDocument | null>;
  removeConfig(_id: string): Promise<string>;
  updateSingleByCode(
    code: string,
    value?: HrmConfigValue,
  ): Promise<IHrmConfigDocument | HrmConfigValue | null>;
}

export const loadConfigClass = (
  models: IModels,
  _subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class ConfigClass {
    public static async getConfigDetail(_id: string) {
      const config = await models.Configs.findOne({ _id }).lean();

      if (!config) {
        throw new Error('HRM config not found');
      }

      return config;
    }

    public static async getConfig(
      code: string,
      subId?: string,
      defaultValue?: HrmConfigValue,
    ) {
      const config = await models.Configs.findOne({
        code,
        subId: subId ?? '',
      }).lean();

      if (!config) {
        return defaultValue ?? null;
      }

      return config;
    }

    public static async getConfigs(code: string) {
      return models.Configs.find({ code }).lean();
    }

    public static async getConfigValue(
      code: string,
      subId?: string,
      defaultValue?: HrmConfigValue,
    ) {
      const config = await models.Configs.findOne({
        code,
        subId: subId ?? '',
      }).lean();

      if (!config) {
        return defaultValue ?? null;
      }

      return config.value ?? null;
    }

    public static async createConfig({
      code,
      subId,
      value,
    }: {
      code: string;
      value?: HrmConfigValue;
      subId?: string;
    }) {
      const newConfig = await models.Configs.create({
        code,
        subId: subId ?? '',
        value,
      });

      sendDbEventLog({
        action: 'create',
        docId: newConfig._id,
        currentDocument: newConfig.toObject(),
      });

      return newConfig;
    }

    public static async updateConfig(
      _id: string,
      value?: HrmConfigValue,
      subId?: string,
    ) {
      const oldConfig = await models.Configs.getConfigDetail(_id);

      await models.Configs.updateOne(
        { _id },
        { $set: { subId: subId ?? '', value } },
      );

      const updatedConfig = await models.Configs.findOne({ _id });

      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: updatedConfig?.toObject(),
        prevDocument: oldConfig,
      });

      return updatedConfig;
    }

    public static async removeConfig(_id: string) {
      const oldConfig = await models.Configs.getConfigDetail(_id);

      await models.Configs.deleteOne({ _id });

      sendDbEventLog({
        action: 'delete',
        docId: oldConfig._id,
      });

      return 'success';
    }

    public static async updateSingleByCode(
      code: string,
      value?: HrmConfigValue,
    ) {
      const oldConfig = await models.Configs.findOne({
        code,
        subId: '',
      }).lean();

      if (oldConfig) {
        await models.Configs.updateOne(
          { _id: oldConfig._id },
          { $set: { value } },
        );

        sendDbEventLog({
          action: 'update',
          docId: oldConfig._id,
          currentDocument: { code, value, subId: '' },
          prevDocument: oldConfig,
        });
      } else {
        const newConfig = await models.Configs.create({
          code,
          value,
          subId: '',
        });

        sendDbEventLog({
          action: 'create',
          docId: newConfig._id,
          currentDocument: newConfig.toObject(),
        });
      }

      return models.Configs.getConfig(code);
    }
  }

  hrmConfigSchema.loadClass(ConfigClass);

  return hrmConfigSchema;
};
