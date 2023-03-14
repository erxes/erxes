import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IKhanbankConfig,
  IKhanbankConfigDocument,
  khanbankConfigSchema
} from './definitions/khanbankConfigs';

export interface IKhanbankConfigModel extends Model<IKhanbankConfigDocument> {
  createConfig(doc: IKhanbankConfig): Promise<IKhanbankConfigDocument>;
  updateConfig(_id: string, doc: any): Promise<IKhanbankConfigDocument>;
  getConfig(doc: any): Promise<IKhanbankConfigDocument>;
  removeConfig(_id: string): void;
}

export const loadKhanbankConfigClass = (models: IModels) => {
  class KhanbankConfig {
    public static async createConfig(doc: IKhanbankConfig) {
      const khanbankConfig = await models.KhanbankConfigs.findOne({
        consumerKey: doc.consumerKey,
        secretKey: doc.secretKey
      });

      if (khanbankConfig) {
        throw new Error('Config already exists');
      }

      return models.KhanbankConfigs.create(doc);
    }

    public static async updateConfig(_id: string, doc: any) {
      const khanbankConfig = await models.KhanbankConfigs.findOne({
        consumerKey: doc.consumerKey,
        secretKey: doc.secretKey
      });

      if (khanbankConfig && khanbankConfig._id !== _id) {
        throw new Error('Config exists with same credentials');
      }

      await models.KhanbankConfigs.updateOne({ _id }, { $set: doc });

      return models.KhanbankConfigs.getConfig({ _id });
    }

    public static async removeConfig(_id: string) {
      return models.KhanbankConfigs.remove({ _id });
    }

    public static async getConfig(doc: any) {
      const khanbankConfig = await models.KhanbankConfigs.findOne(doc);

      if (!khanbankConfig) {
        throw new Error('Config not found');
      }

      return khanbankConfig;
    }
  }

  khanbankConfigSchema.loadClass(KhanbankConfig);

  return khanbankConfigSchema;
};
