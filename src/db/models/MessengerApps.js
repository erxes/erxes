import mongoose from 'mongoose';
import 'mongoose-type-email';
import { field } from './utils';

// Messenger apps ===============
const MessengerAppSchema = mongoose.Schema({
  _id: field({ pkey: true }),

  kind: field({
    type: String,
  }),

  name: field({ type: String }),
  credentials: field({ type: Object }),
});

class MessengerApp {
  static createApp(doc) {
    return this.create(doc);
  }
}

MessengerAppSchema.loadClass(MessengerApp);

export default mongoose.model('messenger_apps', MessengerAppSchema);
