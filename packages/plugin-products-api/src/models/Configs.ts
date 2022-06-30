import { Model, model } from 'mongoose';
// import { COMPANY_INDUSTRY_TYPES, SEX_OPTIONS, SOCIAL_LINKS } from '@erxes/api-utils/src/constants';
import {
  productsConfigSchema,
  IProductsConfig,
  IProductsConfigDocument
} from './definitions/configs';

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
