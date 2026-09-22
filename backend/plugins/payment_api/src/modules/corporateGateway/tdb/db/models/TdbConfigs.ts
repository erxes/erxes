import { Model } from 'mongoose';
import {
  ITdbConfig,
  ITdbConfigDocument,
} from '~/modules/corporateGateway/tdb/@types/tdb';
import { IModels } from '~/connectionResolvers';
import { tdbConfigSchema } from '../definitions/tdbConfigs';

export interface ITdbConfigModel extends Model<ITdbConfigDocument> {
  createConfig(doc: ITdbConfig): Promise<ITdbConfigDocument>;
  updateConfig(_id: string, doc: any): Promise<ITdbConfigDocument>;
  getConfig(doc: any): Promise<ITdbConfigDocument>;
  removeConfig(_id: string): void;
}

export const loadTdbConfigClass = (models: IModels) => {
  class TdbConfig {
    public static async createConfig(doc: ITdbConfig) {
      const tdbConfig = await models.TdbConfigs.findOne({
        username: doc.username,
        apiUrl: doc.apiUrl,
      });

      if (tdbConfig) {
        throw new Error('Config already exists');
      }

      return models.TdbConfigs.create(doc);
    }

    public static async updateConfig(_id: string, doc: any) {
      const tdbConfig = await models.TdbConfigs.findOne({
        username: doc.username,
        apiUrl: doc.apiUrl,
      });

      if (tdbConfig && tdbConfig._id !== _id) {
        throw new Error('Config exists with same credentials');
      }

      await models.TdbConfigs.updateOne({ _id }, { $set: doc });

      return models.TdbConfigs.getConfig({ _id });
    }

    public static async removeConfig(_id: string) {
      return models.TdbConfigs.findOneAndDelete({ _id });
    }

    public static async getConfig(doc: any) {
      const tdbConfig = await models.TdbConfigs.findOne(doc);

      if (!tdbConfig) {
        throw new Error('Config not found');
      }

      return tdbConfig;
    }
  }

  tdbConfigSchema.loadClass(TdbConfig);

  return tdbConfigSchema;
};
