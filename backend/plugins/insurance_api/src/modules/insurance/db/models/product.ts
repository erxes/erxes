import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { productSchema } from '@/insurance/db/definitions/product';
import { IProductDocument } from '@/insurance/@types/product';

export type IProductModel = Model<IProductDocument>;

export const loadProductClass = (models: IModels) => {
  class Product {}

  productSchema.loadClass(Product);

  // Drop old code index if it exists (migration)
  if (models.Product) {
    models.Product.collection.dropIndex('code_1').catch(() => {
      // Index doesn't exist, ignore error
    });
  }

  return productSchema;
};
