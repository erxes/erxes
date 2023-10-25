import { Document, Model, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';
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

export interface ICustomEmailSerivceCnfig {
  mailServiceName: string;
  customMailPort: string;
  customMailUsername: string;
  customMailPassword: string;
  customMailHost: string;
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
  getCustomMailConfigs(): Promise<ICustomEmailSerivceCnfig>;
}

export const loadConfigClass = (models: IModels) => {
  class Config {
    /**
     * Get a Config
     */
    public static async getConfig(code: string) {
      const config = await models.Configs.findOne({ code });

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
      const obj = await models.Configs.findOne({ code });

      if (obj) {
        await models.Configs.updateOne({ _id: obj._id }, { $set: { value } });

        return models.Configs.findOne({ _id: obj._id });
      }

      return models.Configs.create({ code, value });
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

        await models.Configs.createOrUpdateConfig(doc);
      }
    }

    /**
     * Get a Config
     */
    public static async getSESConfigs() {
      const accessKeyId = await getValueAsString(models, 'accessKeyId');
      const secretAccessKey = await getValueAsString(models, 'secretAccessKey');
      const region = await getValueAsString(models, 'region');
      const unverifiedEmailsLimit = await getValueAsString(
        models,
        'unverifiedEmailsLimit'
      );

      return {
        accessKeyId,
        secretAccessKey,
        region,
        unverifiedEmailsLimit
      };
    }

    public static async getCustomMailConfigs() {
      const mailServiceName = await getValueAsString(models, 'mailServiceName');
      const customMailPort = await getValueAsString(models, 'customMailPort');
      const customMailUsername = await getValueAsString(
        models,
        'customMailUsername'
      );
      const customMailPassword = await getValueAsString(
        models,
        'customMailPassword'
      );
      const customMailHost = await getValueAsString(models, 'customMailHost');

      return {
        mailServiceName,
        customMailPort,
        customMailUsername,
        customMailPassword,
        customMailHost
      };
    }
  }

  configsSchema.loadClass(Config);

  return configsSchema;
};
