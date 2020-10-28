import { Document, Model, model, Schema } from 'mongoose';
import { getValueAsString } from '../utils';

export interface IConfig {
  code: string;
  value: string;
}

export interface ISESConfig {
  accessKeyId: string;
  region: string;
  secretAccessKey: string;
}
export interface IConfigDocument extends IConfig, Document {
  _id: string;
}

export const configsSchema = new Schema({
  code: { type: String, label: 'Code', unique: true },
  value: { type: String, label: 'Value' }
});

export interface IConfigModel extends Model<IConfigDocument> {
  getConfig(code: string): Promise<IConfigDocument>;
  updateConfigs(configsMap): Promise<void>;
  createOrUpdateConfig({ code, value }: IConfig): IConfigDocument;
  getSESConfigs(): Promise<ISESConfig>;
}

export const loadClass = () => {
  class Config {
    /**
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

    /**
     * Get a Config
     */
    public static async getSESConfigs() {
      const accessKeyId = await getValueAsString('accessKeyId');
      const secretAccessKey = await getValueAsString('secretAccessKey');
      const region = await getValueAsString('region');
      const unverifiedEmailsLimit = await getValueAsString(
        'unverifiedEmailsLimit'
      );

      return {
        accessKeyId,
        secretAccessKey,
        region,
        unverifiedEmailsLimit
      };
    }
  }

  configsSchema.loadClass(Config);

  return configsSchema;
};

loadClass();

// tslint:disable-next-line
const Configs = model<IConfigDocument, IConfigModel>('configs', configsSchema);

export default Configs;
