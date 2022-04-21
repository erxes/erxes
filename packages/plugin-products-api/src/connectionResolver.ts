import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IProductCategoryModel, IProductModel, loadProductCategoryClass, loadProductClass } from './models/Products';
import { IProductCategoryDocument, IProductDocument } from './models/definitions/products';
import { IUomModel, loadUomClass } from './models/Uoms';
import { IUomDocument } from './models/definitions/uoms';
import { IConfigDocument } from './models/definitions/configs';
import { IConfigModel, loadConfigClass } from './models/Configs';
export interface IModels {
  Products: IProductModel;
  ProductCategories: IProductCategoryModel;
  Configs: IConfigModel;
  Uoms: IUomModel;
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
  models.Uoms = db.model<IUomDocument, IUomModel>('uoms', loadUomClass(models, subdomain))
  models.Configs = db.model<IConfigDocument, IConfigModel>('products_configs', loadConfigClass(models, subdomain))
  models.ProductCategories = db.model<IProductCategoryDocument, IProductCategoryModel>('product_categories', loadProductCategoryClass(models))

  return models;
};