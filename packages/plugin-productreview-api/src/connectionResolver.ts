import * as mongoose from 'mongoose';
import { IProductReviewModel } from './models/productreview';
import { IProductreviewDocument } from './models/definitions/productreview';
import { loadProductReviewClass } from './models/productreview';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
export interface IModels {
  ProductReview: IProductReviewModel;
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

  models.ProductReview = db.model<IProductreviewDocument, IProductReviewModel>(
    'productreview',
    loadProductReviewClass(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
