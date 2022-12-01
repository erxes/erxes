import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IadsDocument } from './models/definitions/ads';
import { IadReviewDocument } from './models/definitions/adreview';
import { IAdsModel, loadAdsClass } from './models/ads';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IadReviewModel, loadAdReviewClass } from './models/adreview';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Ads: IAdsModel;
  AdReview: IadReviewModel;
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

  models.Ads = db.model<IadsDocument, IAdsModel>(
    'ads',
    loadAdsClass(models, subdomain)
  );
  models.AdReview = db.model<IadReviewDocument, IadReviewModel>(
    'adReview',
    loadAdReviewClass(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
