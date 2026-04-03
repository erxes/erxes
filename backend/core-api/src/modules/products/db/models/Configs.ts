import { productsConfigSchema } from '@/products/db/definitions/configs';
import {
  IProductsConfig,
  IProductsConfigDocument,
} from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
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

export const loadProductsConfigClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
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

        const updated = await models.ProductsConfigs.findOne({ _id: obj._id });
        if (updated) {
          sendDbEventLog({
            action: 'update',
            docId: updated._id,
            currentDocument: updated.toObject(),
            prevDocument: obj.toObject(),
          });
        }
        return updated;
      }

      const newConfig = await models.ProductsConfigs.create({ code, value });
      sendDbEventLog({
        action: 'create',
        docId: newConfig._id,
        currentDocument: newConfig.toObject(),
      });
      return newConfig;
    }
  }

  productsConfigSchema.loadClass(ProductsConfig);

  return productsConfigSchema;
};
