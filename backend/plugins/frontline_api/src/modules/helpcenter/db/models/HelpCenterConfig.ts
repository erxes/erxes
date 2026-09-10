import { Model } from 'mongoose';
import {
  IHelpCenterConfigDocument,
  IHelpCenterConfigInput,
} from '@/helpcenter/@types/helpCenterConfig';
import { helpCenterConfigSchema } from '@/helpcenter/db/definitions/helpCenterConfig';
import {
  normalizeHelpCenterConfig,
  normalizeHelpCenterUrl,
} from '@/helpcenter/utils/helpCenterConfig';
import { IModels } from '~/connectionResolvers';

export interface IHelpCenterConfigModel extends Model<IHelpCenterConfigDocument> {
  getConfig(_id: string): Promise<IHelpCenterConfigDocument>;
  getConfigByDomain(domain: string): Promise<IHelpCenterConfigDocument | null>;
  createOrUpdateConfig(
    config: IHelpCenterConfigInput,
    userId: string,
  ): Promise<IHelpCenterConfigDocument>;
  removeConfig(_id: string): Promise<{ _id: string }>;
}

export const loadHelpCenterConfigClass = (models: IModels) => {
  class HelpCenterConfig {
    public static async getConfig(_id: string) {
      const config = await models.HelpCenterConfigs.findOne({ _id });

      if (!config) {
        throw new Error('Help center config not found');
      }

      return config;
    }

    public static async getConfigByDomain(domain: string) {
      const url = normalizeHelpCenterUrl(domain);

      if (!url) {
        throw new Error('Please enter a website address');
      }

      return models.HelpCenterConfigs.findOne({ url });
    }

    public static async createOrUpdateConfig(
      config: IHelpCenterConfigInput,
      userId: string,
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      const { _id, ...doc } = normalizeHelpCenterConfig(config);

      if (!_id) {
        return models.HelpCenterConfigs.create({
          ...doc,
          createdBy: userId,
          modifiedBy: userId,
        });
      }

      await HelpCenterConfig.getConfig(_id);

      await models.HelpCenterConfigs.updateOne(
        { _id },
        { $set: { ...doc, modifiedBy: userId } },
      );

      return HelpCenterConfig.getConfig(_id);
    }

    public static async removeConfig(_id: string) {
      await HelpCenterConfig.getConfig(_id);

      await models.HelpCenterConfigs.deleteOne({ _id });

      return { _id };
    }
  }

  helpCenterConfigSchema.loadClass(HelpCenterConfig);

  return helpCenterConfigSchema;
};
