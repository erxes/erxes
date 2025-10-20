import { IPricingDocument } from '@/pricing/@types/pricing';
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';

import mongoose from 'mongoose';

import { ICouponDocument } from '@/coupon/@types/coupon';
import { ICouponModel, loadCouponClass } from '@/coupon/db/models/coupon';
import { IPricingModel, loadPricingClass } from '@/pricing/db/models/pricing';
import { IVoucherDocument } from '@/voucher/@types/voucher';
import { IVoucherModel, loadVoucherClass } from '@/voucher/db/models/voucher';
import { IScoreDocument } from './modules/score/@types/score';
import { IScoreModel, loadScoreClass } from './modules/score/db/models/score';

export interface IModels {
  Pricing: IPricingModel;
  Voucher: IVoucherModel;
  Coupon: ICouponModel;
  Score: IScoreModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Pricing = db.model<IPricingDocument, IPricingModel>(
    'loyalty_pricing',
    loadPricingClass(models),
  );

  models.Voucher = db.model<IVoucherDocument, IVoucherModel>(
    'loyalty_voucher',
    loadVoucherClass(models),
  );

  models.Coupon = db.model<ICouponDocument, ICouponModel>(
    'loyalty_coupon',
    loadCouponClass(models),
  );

  models.Score = db.model<IScoreDocument, IScoreModel>(
    'loyalty_score',
    loadScoreClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
