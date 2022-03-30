import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IProductCategoryModel, IProductModel, loadProductCategoryClass, loadProductClass } from './models/products';
import { IProductCategoryDocument, IProductDocument } from './models/definitions/products';
export interface IModels {
  Products: IProductModel;
  ProductCategories: IProductCategoryModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;

export const generateModels = async (
  hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  loadClasses(mainDb, hostnameOrSubdomain);

  return models;
};

export const loadClasses = (db: mongoose.Connection, subdomain: string): IModels => {
  models = {} as IModels;
  
  models.Products = db.model<IProductDocument, IProductModel>('products', loadProductClass(models, subdomain))
  models.ProductCategories = db.model<IProductCategoryDocument, IProductCategoryModel>('product_categories', loadProductCategoryClass(models))

  return models;
};