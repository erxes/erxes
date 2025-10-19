import { IPricingDocument } from '@/pricing/@types/pricing';
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';

import mongoose from 'mongoose';

import { IPricingModel, loadPricingClass } from '@/pricing/db/models/pricing';
import { IVoucherDocument } from '@/voucher/@types/voucher';
import { IVoucherModel, loadVoucherClass } from '@/voucher/db/models/voucher';

export interface IModels {
  Pricing: IPricingModel;
  Voucher: IVoucherModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Pricing = db.model<IPricingDocument, IPricingModel>(
    'pricing',
    loadPricingClass(models),
  );

  models.Voucher = db.model<IVoucherDocument, IVoucherModel>(
    'voucher',
    loadVoucherClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
