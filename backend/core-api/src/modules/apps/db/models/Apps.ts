import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { appSchema } from '@/apps/db/definitions/apps';
import { IAppDocument, IApp } from 'erxes-api-shared/core-types';

export interface IAppModel extends Model<IAppDocument> {
  getApp(_id: string): Promise<IAppDocument>;
  createApp(doc: IApp): Promise<IAppDocument>;
  updateApp(_id: string, doc: IApp): Promise<IAppDocument>;
  revokeApp(_id: string): Promise<IAppDocument>;
  removeApp(_id: string): Promise<any>;
}

export const loadAppClass = (
  models: IModels,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class App {
    public static async getApp(_id: string) {
      const app = await models.Apps.findOne({ _id });

      if (!app) {
        throw new Error('App not found');
      }

      return app;
    }

    public static async createApp(doc: IApp) {
      const token = 'sk_' + crypto.randomBytes(24).toString('hex');

      const app = await models.Apps.create({
        ...doc,
        token,
        status: 'active',
      });

      sendDbEventLog({
        action: 'create',
        docId: app._id,
        currentDocument: app.toObject(),
      });

      return app;
    }

    public static async updateApp(_id: string, doc: IApp) {
      const app = await models.Apps.getApp(_id);

      await models.Apps.updateOne({ _id }, { $set: doc });

      const updatedApp = await models.Apps.findOne({ _id: app._id });

      if (updatedApp) {
        sendDbEventLog({
          action: 'update',
          docId: updatedApp._id,
          currentDocument: updatedApp.toObject(),
          prevDocument: app.toObject(),
        });
      }

      return updatedApp;
    }

    public static async revokeApp(_id: string) {
      const app = await models.Apps.getApp(_id);

      await models.Apps.updateOne({ _id }, { $set: { status: 'revoked' } });

      const updatedApp = await models.Apps.findOne({ _id: app._id });

      if (updatedApp) {
        sendDbEventLog({
          action: 'update',
          docId: updatedApp._id,
          currentDocument: updatedApp.toObject(),
          prevDocument: app.toObject(),
        });
      }

      return updatedApp;
    }

    public static async removeApp(_id: string) {
      const app = await models.Apps.getApp(_id);

      sendDbEventLog({
        action: 'delete',
        docId: app._id,
      });

      return models.Apps.deleteOne({ _id });
    }
  }

  appSchema.loadClass(App);

  return appSchema;
};
