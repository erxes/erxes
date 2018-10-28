import { Model, model } from 'mongoose';
import { IMessengerApp, IMessengerAppDocument, messengerAppSchema } from './definitions/messengerApps';

interface IMessengerAppModel extends Model<IMessengerAppDocument> {
  createApp(doc: IMessengerApp): Promise<IMessengerAppDocument>;
}

class MessengerApp {
  public static async createApp(doc: IMessengerApp) {
    const prev = await MessengerApps.findOne({ kind: doc.kind });

    if (prev && prev._id) {
      await MessengerApps.update({ _id: prev._id }, { $set: doc });

      return MessengerApps.findOne({ _id: prev._id });
    }

    return MessengerApps.create(doc);
  }
}

messengerAppSchema.loadClass(MessengerApp);

const MessengerApps = model<IMessengerAppDocument, IMessengerAppModel>('messenger_apps', messengerAppSchema);

export default MessengerApps;
