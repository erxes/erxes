import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import { getEnv } from 'erxes-api-shared/utils';
import {
  configSchema,
  IConfig,
  IConfigDocument,
} from '~/modules/organization/settings/db/definitions/configs';

export interface IConfigModel extends Model<IConfigDocument> {
  getConfig(code: string): Promise<IConfigDocument>;
  getConfigs(codes?: string[]): Promise<{ [code: string]: any }>;
  getConfigValue(code: string, defaultValue: any): Promise<any>;
  createOrUpdateConfig({ code, value }: IConfig): Promise<IConfigDocument>;
  constants(): Promise<any>;
  getCloudflareConfigs(): Promise<any>;
}

export const getValueAsString = async (
  models: IModels,
  name: string,
  envKey: string,
  defaultValue?: string,
) => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    return getEnv({ name: envKey, defaultValue });
  }

  const entry = await models.Configs.getConfig(name);

  if (entry.value) {
    return entry.value.toString();
  }

  return entry.value;
};

export const loadConfigClass = (models: IModels) => {
  class Config {
    /*
     * Get a Config
     */
    public static async getConfig(code: string) {
      const config = await models.Configs.findOne({ code });

      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    }

    public static async getConfigs(codes?: string[]) {
      const configsMap = {};
      const filter: any = {};
      if (codes?.length) {
        filter.code = { $in: codes }
      }
      const configs = await models.Configs.find(filter).lean();

      for (const config of configs) {
        configsMap[config.code] = config.value;
      }

      return configsMap;
    }

    public static async getConfigValue(code: string, defaultValue: any) {
      const config = await models.Configs.findOne({ code });

      if (!config) {
        return defaultValue;
      }

      return config.value ?? defaultValue;
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

    public static async getCloudflareConfigs() {
      const accountId = await getValueAsString(
        models,
        'CLOUDFLARE_ACCOUNT_ID',
        'CLOUDFLARE_ACCOUNT_ID',
      );

      const accessKeyId = await getValueAsString(
        models,
        'CLOUDFLARE_ACCESS_KEY_ID',
        'CLOUDFLARE_ACCESS_KEY_ID',
      );

      const secretAccessKey = await getValueAsString(
        models,
        'CLOUDFLARE_SECRET_ACCESS_KEY',
        'CLOUDFLARE_SECRET_ACCESS_KEY',
      );

      const bucket = await getValueAsString(
        models,
        'CLOUDFLARE_BUCKET_NAME',
        'CLOUDFLARE_BUCKET_NAME',
      );

      const useCdn = await getValueAsString(
        models,
        'CLOUDFLARE_USE_CDN',
        'CLOUDFLARE_USE_CDN',
      );

      const isPublic = await getValueAsString(
        models,
        'FILE_SYSTEM_PUBLIC',
        'FILE_SYSTEM_PUBLIC',
      );

      const apiToken = await getValueAsString(
        models,
        'CLOUDFLARE_API_TOKEN',
        'CLOUDFLARE_API_TOKEN',
      );

      return {
        accountId,
        accessKeyId,
        region: 'auto',
        secretAccessKey,
        bucket,
        useCdn,
        isPublic,
        apiToken,
      };
    }
  }

  configSchema.loadClass(Config);

  return configSchema;
};
