import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IProductCategoryModel, IProductModel, loadProductCategoryClass, loadProductClass } from './models/products';
import { IProductCategoryDocument, IProductDocument } from './models/definitions/products';
import { createGenerateModels } from '@erxes/api-utils/src/core';
export interface IModels {
  Products: IProductModel;
  ProductCategories: IProductCategoryModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection, subdomain: string): IModels => {
  models = {} as IModels;
  
  models.Products = db.model<IProductDocument, IProductModel>('products', loadProductClass(models, subdomain))
  models.ProductCategories = db.model<IProductCategoryDocument, IProductCategoryModel>('product_categories', loadProductCategoryClass(models))

  return models;
};

export const generateModels = createGenerateModels<IModels>(models, loadClasses)