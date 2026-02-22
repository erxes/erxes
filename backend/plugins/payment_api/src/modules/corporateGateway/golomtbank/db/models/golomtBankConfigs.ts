import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import {
  IGolomtBankConfig,
  IGolomtBankConfigDocument,
} from '~/modules/corporateGateway/golomtbank/@types/golomtBank';
import { golomtBankConfigSchema } from '~/modules/corporateGateway/golomtbank/db/definitions/golomtBankConfigs';

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
        registerId: doc.registerId,
        accountId: doc.accountId,
      });
      if (golomtBankConfig) {
        throw new Error('Config already exists');
      }
      return models.GolomtBankConfigs.create(doc);
    }

    public static async updateConfig(_id: string, doc: any) {
      await models.GolomtBankConfigs.updateOne({ _id }, { $set: doc });

      return models.GolomtBankConfigs.getConfig({ _id });
    }

    public static async removeConfig(_id: string) {
      return models.GolomtBankConfigs.deleteOne({ _id });
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
