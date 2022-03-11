import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IProductCategoryModel, IProductModel, loadProductCategoryClass, loadProductClass } from './models/products';
import { IProductCategoryDocument, IProductDocument } from './models/definitions/products';

export interface ICoreIModels {
  Fields;
}
export interface IModels {
  Products: IProductModel;
  ProductCategories: IProductCategoryModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  coreModels: ICoreIModels;
}

export let models: IModels;
export let coreModels: ICoreIModels;

export const generateModels = async (
  _hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  coreModels = await connectCore();

  loadClasses(mainDb);

  return models;
};

export const generateCoreModels = async (
  _hostnameOrSubdomain: string
): Promise<ICoreIModels> => {
    return coreModels;
};

const connectCore = async () => {
  const url = process.env.API_MONGO_URL || 'mongodb://localhost/erxes';
  const client = new MongoClient(url);

  const dbName = 'erxes';

  let db;

  await client.connect();

  console.log('Connected successfully to server');

  db = client.db(dbName);

  return {
    Fields: await db.collection('fields')
  }
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;
  
  models.Products = db.model<IProductDocument, IProductModel>('products', loadProductClass(models))
  models.ProductCategories = db.model<IProductCategoryDocument, IProductCategoryModel>('product_categories', loadProductCategoryClass(models))

  return models;
};