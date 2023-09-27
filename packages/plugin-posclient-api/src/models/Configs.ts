import * as mongoose from 'mongoose';
import { Model, model } from 'mongoose';
import {
  IConfig,
  configSchema,
  IConfigDocument,
  IProductsConfig,
  IProductsConfigDocument,
  productsConfigSchema
} from './definitions/configs';

export interface IConfigModel extends Model<IConfigDocument> {
  createConfig(token: string, name: string): Promise<IConfigDocument>;
  getConfig(query: any): Promise<IConfigDocument>;
  removeConfig(_id: string): Promise<IConfigDocument>;
  updateConfig(_id: string, doc: IConfig): Promise<IConfigDocument>;
}

export const loadConfigClass = models => {
  class Config {
    public static async getConfig(query: any) {
      const pos = await models.Configs.findOne(query).lean();

      if (!pos) {
        throw new Error('POS config not found');
      }

      return pos;
    }

    public static async createConfig(token: string, name: string) {
      try {
        const config = await models.Configs.findOne({ token });

        if (config) {
          throw new Error(
            `Config already exists with the following token: ${token}`
          );
        }

        await models.Configs.create({ token, name });
        return await models.Configs.findOne({ token }).lean();
      } catch (e) {
        throw new Error(`Can not create POS config: ${e.message}`);
      }
    }

    public static async updateConfig(_id: string, doc: IConfig) {
      await models.Configs.getConfig({ _id });

      await models.Configs.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true }
      );

      return models.Configs.findOne({ _id }).lean();
    }

    public static async removeConfig(_id: string) {
      await models.Configs.getConfig({ _id });

      return models.Configs.deleteOne({ _id });
    }
  }

  configSchema.loadClass(Config);
  return configSchema;
};

export interface IProductsConfigModel extends Model<IProductsConfigDocument> {
  getConfig(code: string, defaultValue?: string): Promise<any>;
  createOrUpdateConfig({
    code,
    value
  }: IProductsConfig): IProductsConfigDocument;
  constants();
}

export const loadProductsConfigClass = models => {
  class ProductsConfig {
    /*
     * Get a Config
     */
    public static async getConfig(code: string, defaultValue?: any) {
      const config = await models.ProductsConfigs.findOne({ code });

      if (!config) {
        return defaultValue || '';
      }

      return config.value;
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
      const obj = await models.ProductsConfigs.findOne({ code });

      if (obj) {
        await models.ProductsConfigs.updateOne(
          { _id: obj._id },
          { $set: { value } }
        );

        return models.ProductsConfigs.findOne({ _id: obj._id });
      }

      return models.ProductsConfigs.create({ code, value });
    }

    public static constants() {
      return {};
    }
  }

  productsConfigSchema.loadClass(ProductsConfig);

  return productsConfigSchema;
};
