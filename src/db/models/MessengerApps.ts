import { Model, model } from 'mongoose';
import { IMessengerApp, IMessengerAppDocument, messengerAppSchema } from './definitions/messengerApps';

interface IMessengerAppModel extends Model<IMessengerAppDocument> {
  createApp(doc: IMessengerApp): Promise<IMessengerAppDocument>;
}

class MessengerApp {
  public static async createApp(doc: IMessengerApp) {
    return MessengerApps.create(doc);
  }
}

messengerAppSchema.loadClass(MessengerApp);

const MessengerApps = model<IMessengerAppDocument, IMessengerAppModel>(
  'messenger_apps',
  messengerAppSchema,
);

export default MessengerApps;