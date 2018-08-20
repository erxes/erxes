import * as mongoose from 'mongoose';
import { field } from './utils';

const ConfigSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  code: field({ type: String }),
  value: field({ type: [String] }),
});

class Config {
  /**
   * Create or update config
   * @param  {Object} doc
   * @return {Promise} Newly created config object
   */
  static async createOrUpdateConfig({ code, value }) {
    const obj = await this.findOne({ code });

    if (obj) {
      await this.update({ _id: obj._id }, { $set: { value } });

      return this.findOne({ _id: obj._id });
    }

    return this.create({ code, value });
  }
}

ConfigSchema.loadClass(Config);
const Configs = mongoose.model('configs', ConfigSchema);

export default Configs;
