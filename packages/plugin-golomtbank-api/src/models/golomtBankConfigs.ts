import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IGolomtBankConfig,
  IGolomtBankConfigDocument,
  golomtBankConfigSchema
} from './definitions/golomtBankConfigs';

export interface IGolomtBankConfigModel extends Model<IGolomtBankConfigDocument> { 
  createConfig(doc: IGolomtBankConfig): Promise<IGolomtBankConfigDocument>;
  updateConfig(_id: string, doc: any): Promise<IGolomtBankConfigDocument>;
  getConfig(doc: any): Promise<IGolomtBankConfigDocument>;
  removeConfig(_id: string): void;
}

export const loadGolomtBankConfigClass = (models: IModels) => {
  class GolomtBankConfig {
    public static async createConfig(doc: IGolomtBankConfig) {
      const golomtBankConfig = await models.GolomtBankConfigs.findOne({
        organizationName: doc.organizationName,
        userName: doc.userName
      });

      if (golomtBankConfig) {
        throw new Error('Config already exists');
      }

      return models.GolomtBankConfigs.create(doc);
    }

    public static async updateConfig(_id: string, doc: any) {
      const golomtBankConfig = await models.GolomtBankConfigs.findOne({
        consumerKey: doc.consumerKey,
        secretKey: doc.secretKey
      });

      if (golomtBankConfig && golomtBankConfig._id !== _id) {
        throw new Error('Config exists with same credentials');
      }

      await models.GolomtBankConfigs.updateOne({ _id }, { $set: doc });

      return models.GolomtBankConfigs.getConfig({ _id });
    }

    public static async removeConfig(_id: string) {
      return models.GolomtBankConfigs.remove({ _id });
    }

    public static async getConfig(doc: any) {
      const golomtBankConfig = await models.GolomtBankConfigs.findOne(doc);

      if (!golomtBankConfig) {
        throw new Error('Config not found');
      }

      return golomtBankConfig;
    }
  }

  golomtBankConfigSchema.loadClass(GolomtBankConfig);

  return golomtBankConfigSchema;
};
