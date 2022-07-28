import * as mongoose from 'mongoose';
import { IProductReviewModel } from './models/productreview';
import { IProductreviewDocument } from './models/definitions/productreview';
import { loadProductReviewClass } from './models/productreview';
import { loadWishlistClass } from './models/wishlist';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IWishlistModel } from './models/wishlist';
import { IWishlistDocument } from './models/definitions/wishlist';
export interface IModels {
  ProductReview: IProductReviewModel;
  Wishlist: IWishlistModel;
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
  models.Wishlist = db.model<IWishlistDocument, IWishlistModel>(
    'wishlist',
    loadWishlistClass(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
