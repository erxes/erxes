import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IProductCategoryModel,
  IProductModel,
  loadProductCategoryClass,
  loadProductClass
} from './models/Products';
import {
  IProductCategoryDocument,
  IProductDocument
} from './models/definitions/products';
import { IUomModel, loadUomClass } from './models/Uoms';
import { IUomDocument } from './models/definitions/uoms';
import { IProductsConfigDocument } from './models/definitions/configs';
import {
  IProductsConfigModel,
  loadProductsConfigClass
} from './models/Configs';
import { createGenerateModels } from '@erxes/api-utils/src/core';
export interface IModels {
  Products: IProductModel;
  ProductCategories: IProductCategoryModel;
  ProductsConfigs: IProductsConfigModel;
  Uoms: IUomModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;

  models.Products = db.model<IProductDocument, IProductModel>(
    'products',
    loadProductClass(models, subdomain)
  );
  models.Uoms = db.model<IUomDocument, IUomModel>(
    'uoms',
    loadUomClass(models, subdomain)
  );
  models.ProductsConfigs = db.model<
    IProductsConfigDocument,
    IProductsConfigModel
  >('products_configs', loadProductsConfigClass(models));
  models.ProductCategories = db.model<
    IProductCategoryDocument,
    IProductCategoryModel
  >('product_categories', loadProductCategoryClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
