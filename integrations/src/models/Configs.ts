import { Document, Model, model, Schema } from 'mongoose';
import { field } from './utils';

export interface IConfig {
  code: string;
  value: any;
}

export interface IConfigDocument extends IConfig, Document {
  _id: string;
}

// Mongoose schemas ===========

export const configSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String, unique: true }),
  value: field({ type: Object })
});

export interface IConfigModel extends Model<IConfigDocument> {
  getConfig(code: string): Promise<IConfigDocument>;
  updateConfigs(configsMap): Promise<void>;
  createOrUpdateConfig({ code, value }: IConfig): IConfigDocument;
}

export const loadClass = () => {
  class Config {
    /*
     * Get a Config
     */
    public static async getConfig(code: string) {
      const config = await Configs.findOne({ code });

      if (!config) {
        return { value: '' };
      }

      return config;
    }

    /**
     * Create or update config
     */
    public static async createOrUpdateConfig({
      code,
      value
    }: {
      code: string;
      value: string[];
    }) {
      const obj = await Configs.findOne({ code });

      if (obj) {
        await Configs.updateOne({ _id: obj._id }, { $set: { value } });

        return Configs.findOne({ _id: obj._id });
      }

      return Configs.create({ code, value });
    }

    /**
     * Update configs
     */
    public static async updateConfigs(configsMap) {
      const codes = Object.keys(configsMap);

      for (const code of codes) {
        if (!code) {
          continue;
        }

        const value = configsMap[code];
        const doc = { code, value };

        await Configs.createOrUpdateConfig(doc);
      }
    }
  }

  configSchema.loadClass(Config);

  return configSchema;
};

loadClass();

// tslint:disable-next-line
const Configs = model<IConfigDocument, IConfigModel>('configs', configSchema);

export default Configs;
