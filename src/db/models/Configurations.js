import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema({
  // to whom this config is related
  user: String,
  notifType: String,
  isAllowed: Boolean,
});

class Configuration {
  static async createOrUpdateConfiguration({ notifType, isAllowed, user }) {
    const selector = { user, notifType };

    const oldOne = await this.findOne(selector);

    // If already inserted then raise error
    if (oldOne) {
      await this.update({ _id: oldOne._id }, { $set: { isAllowed } });
      return await this.findOne({ _id: oldOne._id });
    }

    // If it is first time then insert
    selector.isAllowed = isAllowed;
    return await this.create(selector);
  }
}

ConfigSchema.loadClass(Configuration);
export default mongoose.model('notification_configs', ConfigSchema);
