import { Model } from 'mongoose';

import { IModels } from '../../connectionResolver';
import { appSchema, IAppDocument, IApp } from './definitions/apps';
import { encryptText } from '@erxes/api-utils/src/commonUtils';

export interface IAppModel extends Model<IAppDocument> {
  getApp(_id: string): Promise<IAppDocument>;
  createApp(doc: IApp): Promise<IAppDocument>;
  updateApp(_id: string, doc: IApp): Promise<IAppDocument>;
  removeApp(_id: string): Promise<any>;
}

export const loadAppClass = (models: IModels) => {
  class App {
    public static async getApp(_id: string) {
      const app = await models.Apps.findOne({ _id });

      if (!app) {
        throw new Error('App not found');
      }

      return app;
    }

    public static async createApp(doc: IApp) {
      const app = await models.Apps.create(doc);

      const data = encryptText(app._id.toString());

      await models.Apps.updateOne(
        { _id: app._id },
        { $set: { accessToken: data.encryptedData } }
      );

      return models.Apps.findOne({ _id: app._id });
    }

    public static async updateApp(_id: string, doc: IApp) {
      const app = await models.Apps.getApp(_id);

      await models.Apps.updateOne({ _id }, { $set: doc });

      return models.Apps.findOne({ _id: app._id });
    }

    public static async removeApp(_id: string) {
      const app = await models.Apps.getApp(_id);

      if (app.isEnabled) {
        throw new Error('Can not remove an enabled app');
      }

      return models.Apps.deleteOne({ _id });
    }
  }

  appSchema.loadClass(App);

  return appSchema;
}
