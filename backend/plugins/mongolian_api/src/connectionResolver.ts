import * as mongoose from 'mongoose';
import { IEbarimtDocument } from './modules/ebarimt/db/definitions/ebarimt';
import { IPutResponseModel, loadPutResponseClass } from './modules/ebarimt/db/models/Ebarimt';
import { IMainContext } from 'erxes-api-shared/src/core-types';
import { createGenerateModels } from 'erxes-api-shared/src/utils/mongo/generate-models';
import { IProductRuleDocument } from './modules/ebarimt/db/definitions/productRule';
import { IProductRuleModel, loadProductRuleClass } from './modules/ebarimt/db/models/ProductRule';
import { IProductGroupModel, loadProductGroupClass } from './modules/ebarimt/db/models/ProductGroup';
import { IProductGroupDocument } from './modules/ebarimt/db/definitions/productGroup';


export interface IModels {
  PutResponses: IPutResponseModel;
  ProductRules: IProductRuleModel;
  ProductGroups: IProductGroupModel;
}

export interface IContext extends IMainContext {
 models: IModels;
 subdomain: string;

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

export const generateModels = (hostnameOrSubdomain = "core") =>
  createGenerateModels<IModels>(loadClasses)(hostnameOrSubdomain);
