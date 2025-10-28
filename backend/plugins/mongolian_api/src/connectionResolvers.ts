import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';

import mongoose from 'mongoose';

import {
  IEbarimtDocument,
  IProductGroupDocument,
  IProductRuleDocument,
} from '@/ebarimt/@types';

import {
  IPutResponseModel,
  loadPutResponseClass,
} from '@/ebarimt/db/models/Ebarimt';

import {
  IProductGroupModel,
  loadProductGroupClass,
} from '@/ebarimt/db/models/ProductGroup';

import {
  IProductRuleModel,
  loadProductRuleClass,
} from '@/ebarimt/db/models/ProductRule';

export interface IModels {
  PutResponses: IPutResponseModel;
  ProductRules: IProductRuleModel;
  ProductGroups: IProductGroupModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.PutResponses = db.model<IEbarimtDocument, IPutResponseModel>(
    'putresponses',
    loadPutResponseClass(models),
  );

  models.ProductRules = db.model<IProductRuleDocument, IProductRuleModel>(
    'ebarimt_product_rules',
    loadProductRuleClass(models),
  );

  models.ProductGroups = db.model<IProductGroupDocument, IProductGroupModel>(
    'ebarimt_product_groups',
    loadProductGroupClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
