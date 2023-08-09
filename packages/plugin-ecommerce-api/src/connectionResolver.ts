import * as mongoose from 'mongoose';
import { IProductReviewModel } from './models/productreview';
import { IProductreviewDocument } from './models/definitions/productreview';
import { loadProductReviewClass } from './models/productreview';
import { loadWishlistClass } from './models/wishlist';
import { loadLastViewedItemClass } from './models/lastViewedItem';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IWishlistModel } from './models/wishlist';
import { IWishlistDocument } from './models/definitions/wishlist';
import { ILastViewedItemModel } from './models/lastViewedItem';
import { ILastViewedItemDocument } from './models/definitions/lastViewedItem';

export interface IModels {
  ProductReview: IProductReviewModel;
  Wishlist: IWishlistModel;
  LastViewedItem: ILastViewedItemModel;
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
    'ecommerce_productreview',
    loadProductReviewClass(models, subdomain)
  );
  models.Wishlist = db.model<IWishlistDocument, IWishlistModel>(
    'ecommerce_wishlist',
    loadWishlistClass(models, subdomain)
  );
  models.LastViewedItem = db.model<
    ILastViewedItemDocument,
    ILastViewedItemModel
  >('ecommerce_lastvieweditem', loadLastViewedItemClass(models, subdomain));

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
