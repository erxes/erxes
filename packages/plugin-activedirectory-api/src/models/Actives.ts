import { IConfig, IConfigDocument, configSchema } from './definitions/actives';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IConfigModel extends Model<IConfigDocument> {
  createOrUpdateConfig(doc: IConfig): Promise<IConfigDocument>;
}

export const loadConfigClass = (models: IModels) => {
  class Config {
    public static async createOrUpdateConfig(doc: IConfig) {
      const obj = await models.AdConfig.findOne({ code: doc.code });

      if (obj) {
        await models.AdConfig.updateOne(
          { _id: obj._id },
          { $set: { ...doc, modifiedAt: new Date() } }
        );

        return models.AdConfig.findOne({ _id: obj._id });
      }

      return models.AdConfig.create({
        ...doc,
        createdAt: new Date(),
      });
    }
  }

  configSchema.loadClass(Config);

  return configSchema;
};
