import { Model, model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IMessengerApp,
  IMessengerAppDocument,
  messengerAppSchema
} from './definitions/messengerApps';

export interface IMessengerAppModel extends Model<IMessengerAppDocument> {
  getApp(_id: string): Promise<IMessengerAppDocument>;
  createApp(doc: IMessengerApp): Promise<IMessengerAppDocument>;
  updateApp(_id: string, doc: IMessengerApp): Promise<IMessengerAppDocument>;
}

export const loadClass = (models: IModels) => {
  class MessengerApp {
    public static async getApp(_id: string) {
      const messengerApp = await models.MessengerApps.findOne({ _id });

      if (!messengerApp) {
        throw new Error('Messenger app not found');
      }

      return messengerApp;
    }

    public static async createApp(doc: IMessengerApp) {
      return models.MessengerApps.create(doc);
    }

    public static async updateApp(_id: string, doc: IMessengerApp) {
      await models.MessengerApps.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true }
      );

      return models.MessengerApps.findOne({ _id });
    }
  }

  messengerAppSchema.loadClass(MessengerApp);

  return messengerAppSchema;
};