import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import { IAddressModel, loadAddressClass } from './models/address';
import { IAddressDocument } from './models/definitions/address';
import { ILastViewedItemDocument } from './models/definitions/lastViewedItem';
import { IProductreviewDocument } from './models/definitions/productreview';
import { IWishlistDocument } from './models/definitions/wishlist';
import {
  ILastViewedItemModel,
  loadLastViewedItemClass,
} from './models/lastViewedItem';
import {
  IProductReviewModel,
  loadProductReviewClass,
} from './models/productreview';
import { IWishlistModel, loadWishlistClass } from './models/wishlist';

export interface IModels {
  ProductReview: IProductReviewModel;
  Wishlist: IWishlistModel;
  LastViewedItem: ILastViewedItemModel;
  Address: IAddressModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.ProductReview = db.model<IProductreviewDocument, IProductReviewModel>(
    'ecommerce_productreview',
    loadProductReviewClass(models, subdomain),
  );
  models.Wishlist = db.model<IWishlistDocument, IWishlistModel>(
    'ecommerce_wishlist',
    loadWishlistClass(models, subdomain),
  );
  models.LastViewedItem = db.model<
    ILastViewedItemDocument,
    ILastViewedItemModel
  >('ecommerce_lastvieweditem', loadLastViewedItemClass(models, subdomain));
  models.Address = db.model<IAddressDocument, IAddressModel>(
    'ecommerce_address',
    loadAddressClass(models, subdomain),
  );
  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
