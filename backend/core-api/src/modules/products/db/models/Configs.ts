import { productsConfigSchema } from '@/products/db/definitions/configs';
import {
  IProductsConfig,
  IProductsConfigDocument,
} from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IProductsConfigModel extends Model<IProductsConfigDocument> {
  getConfig(
    code: string,
    defaultValue?: string,
  ): Promise<IProductsConfigDocument>;
  createOrUpdateConfig({
    code,
    value,
  }: IProductsConfig): Promise<IProductsConfigDocument>;
}

export const loadProductsConfigClass = (models: IModels) => {
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
      value,
    }: {
      code: string;
      value: string[];
    }) {
      const obj = await models.ProductsConfigs.findOne({ code });

      if (obj) {
        await models.ProductsConfigs.updateOne(
          { _id: obj._id },
          { $set: { value } },
        );

        return await models.ProductsConfigs.findOne({ _id: obj._id });
      }

      return await models.ProductsConfigs.create({ code, value });
    }
  }

  productsConfigSchema.loadClass(ProductsConfig);

  return productsConfigSchema;
};
