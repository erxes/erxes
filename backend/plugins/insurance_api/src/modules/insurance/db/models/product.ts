import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { productSchema } from '@/insurance/db/definitions/product';
import { IProductDocument } from '@/insurance/@types/product';

export type IProductModel = Model<IProductDocument>;

export const loadProductClass = (models: IModels) => {
  class Product {}

  productSchema.loadClass(Product);

  return productSchema;
};
