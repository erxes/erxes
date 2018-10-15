import { Model, model } from 'mongoose';
import { configSchema, IConfigDocument } from './definitions/configs';

interface IConfigModel extends Model<IConfigDocument> {
  createOrUpdateConfig({ code, value }: { code: string; value: string[] }): IConfigDocument;
}

class Config {
  /**
   * Create or update config
   */
  public static async createOrUpdateConfig({ code, value }: { code: string; value: string[] }) {
    const obj = await Configs.findOne({ code });

    if (obj) {
      await Configs.update({ _id: obj._id }, { $set: { value } });

      return Configs.findOne({ _id: obj._id });
    }

    return Configs.create({ code, value });
  }
}

configSchema.loadClass(Config);

const Configs = model<IConfigDocument, IConfigModel>('configs', configSchema);

export default Configs;
