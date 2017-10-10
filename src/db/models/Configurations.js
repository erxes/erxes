import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema({
  // to whom this config is related
  user: String,
  notifType: String,
  // which module's type it is. For example: indocuments
  isAllowed: Boolean,
});

class Configuration {
  static saveConfig({ notifType, isAllowed, userId }) {
    if (!userId) {
      throw new Error('createdUserId must be supplied');
    }

    const selector = { user: userId, notifType };

    const oldOne = this.findOne(selector);

    // if already inserted then update isAllowed field
    if (oldOne) {
      this.update({ _id: oldOne._id }, { $set: { isAllowed } });

      // if it is first time then insert
    } else {
      selector.isAllowed = isAllowed;
      this.insert(selector);
    }
  }
}

ConfigSchema.loadClass(Configuration);
export default mongoose.model('notification_configs', ConfigSchema);
