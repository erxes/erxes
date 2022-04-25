import { Model, model } from 'mongoose';
import { appSchema, IAppDocument, IApp } from './definitions/apps';

export interface IAppModel extends Model<IAppDocument> {
  getApp(_id: string): Promise<IAppDocument>;
  createApp(doc: IApp): Promise<IAppDocument>;
  updateApp(_id: string, doc: IApp): Promise<IAppDocument>;
  removeApp(_id: string): Promise<string>;
}

export const loadClass = () => {
  class App {
    public static async getApp(_id: string) {
      const app = await Apps.findOne({ _id });

      if (!app) {
        throw new Error('App not found');
      }

      return app;
    }

    public static createApp(doc: IApp) {
      return Apps.create(doc);
    }

    public static async updateApp(_id: string, doc: IApp) {
      const app = await Apps.getApp(_id);

      await Apps.updateOne({ _id }, { $set: doc });

      return Apps.findOne({ _id: app._id });
    }

    public static async removeApp(_id: string) {
      const app = await Apps.getApp(_id);

      if (app.isEnabled) {
        throw new Error('Can not remove an enabled app');
      }

      return Apps.deleteOne({ _id });
    }
  }

  appSchema.loadClass(App);

  return appSchema;
}

loadClass();

const Apps = model<IAppDocument, IAppModel>('apps', appSchema);

export default Apps;
