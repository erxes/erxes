import { Model, model } from 'mongoose';
import { IMessengerApp, IMessengerAppDocument, messengerAppSchema } from './definitions/messengerApps';

export interface IMessengerAppModel extends Model<IMessengerAppDocument> {
  createApp(doc: IMessengerApp): Promise<IMessengerAppDocument>;
}

export const loadClass = () => {
  class MessengerApp {
    public static async createApp(doc: IMessengerApp) {
      return MessengerApps.create(doc);
    }
  }

  messengerAppSchema.loadClass(MessengerApp);

  return messengerAppSchema;
};

loadClass();

// tslint:disable-next-line
const MessengerApps = model<IMessengerAppDocument, IMessengerAppModel>('messenger_apps', messengerAppSchema);

export default MessengerApps;
