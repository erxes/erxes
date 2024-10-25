import { Document, Model, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';
import { getValueAsString } from '../utils';

export interface IConfig {
  code: string;
  value: string;
}

// const CLOUDFLARE_ACCOUNT_ID = await getConfig(
//     "CLOUDFLARE_ACCOUNT_ID",
//     "",
//     models
//   );
//   const CLOUDFLARE_ACCESS_KEY_ID = await getConfig(
//     "CLOUDFLARE_ACCESS_KEY_ID",
//     "",
//     models
//   );
//   const CLOUDFLARE_SECRET_ACCESS_KEY = await getConfig(
//     "CLOUDFLARE_SECRET_ACCESS_KEY",
//     "",
//     models
//   );
//   const CLOUDFLARE_ENDPOINT = `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

//   if (!CLOUDFLARE_ACCESS_KEY_ID || !CLOUDFLARE_SECRET_ACCESS_KEY) {
//     throw new Error("Cloudflare Credentials are not configured");
//   }

export interface ICFConfig {
  accountId;
  accessKeyId: string;
  region: string;
  secretAccessKey: string;
  bucket: string;
  useCdn: string;
  isPublic: string;
  apiToken: string;
}
export interface IConfigDocument extends IConfig, Document {
  _id: string;
}

export const configsSchema = new Schema({
  code: { type: String, label: 'Code', unique: true },
  value: { type: String, label: 'Value' },
});

export interface IConfigModel extends Model<IConfigDocument> {
  getConfig(code: string): Promise<IConfigDocument>;
  updateConfigs(configsMap): Promise<void>;
  createOrUpdateConfig({ code, value }: IConfig): IConfigDocument;
  getCloudflareConfigs(): Promise<ICFConfig>;
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
      value,
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
    public static async getCloudflareConfigs() {
      const accountId = await getValueAsString(
        models,
        'CLOUDFLARE_ACCOUNT_ID',
        'CLOUDFLARE_ACCOUNT_ID'
      );

      const accessKeyId = await getValueAsString(
        models,
        'CLOUDFLARE_ACCESS_KEY_ID',
        'CLOUDFLARE_ACCESS_KEY_ID'
      );

      const secretAccessKey = await getValueAsString(
        models,
        'CLOUDFLARE_SECRET_ACCESS_KEY',
        'CLOUDFLARE_SECRET_ACCESS_KEY'
      );

      const bucket = await getValueAsString(
        models,
        'CLOUDFLARE_BUCKET_NAME',
        'CLOUDFLARE_BUCKET_NAME'
      );

      const useCdn = await getValueAsString(
        models,
        'CLOUDFLARE_USE_CDN',
        'CLOUDFLARE_USE_CDN'
      );

      const isPublic = await getValueAsString(
        models,
        'FILE_SYSTEM_PUBLIC',
        'FILE_SYSTEM_PUBLIC'
      );

      const apiToken = await getValueAsString(
        models,
        'CLOUDFLARE_API_TOKEN',
        'CLOUDFLARE_API_TOKEN'
      );

      return {
        accountId,
        accessKeyId,
        region: 'auto',
        secretAccessKey,
        bucket,
        useCdn,
        isPublic,
        apiToken
      };
    }
  }

  configsSchema.loadClass(Config);

  return configsSchema;
};
