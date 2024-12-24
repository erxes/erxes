import { IConfig, IConfigDocument, configSchema } from './definitions/actives';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IConfigModel extends Model<IConfigDocument> {
  configAdd(doc: IConfig): Promise<IConfigDocument>;
  configEdit(_id: string, doc: IConfig): Promise<IConfigDocument>;
  configRemove(_ids: string[]): Promise<JSON>;
}

export const loadConfigClass = (models: IModels) => {
  class SyncLog {
    public static async configAdd(doc: IConfig) {
      return models.AdConfig.create({ ...doc });
    }

    public static async configEdit(_id: string, doc: IConfig) {
      return await models.AdConfig.updateOne({ _id }, { $set: { ...doc } });
    }

    public static async configRemove(_ids: string[]) {
      return await models.AdConfig.deleteMany({ _id: { $in: _ids } });
    }
  }

  configSchema.loadClass(SyncLog);

  return configSchema;
};
