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

import { ISyncLogDocument as IEerkhetSyncLogDocument } from '@/erkhet/@types';
import { ISyncLogModel as IEerkhetSyncLogModel, loadSyncLogClass as loadErkhetSyncLogClass } from '@/erkhet/db/model/SyncLog';

import { 
  ICustomerRelationModel,
  ISyncLogModel as IMsDynamicSyncLogModel,
  loadCustomerRelationClass,
  loadSyncLogClass as loadMsDynamicSyncLogClass
} from '@/msdynamic/db/models/Dynamic';

import { 
  ICustomerRelationDocument,
  ISyncLogDocument as IMsDynamicSyncLogDocument
} from '@/msdynamic/@types/dynamic';


export interface IModels {
  PutResponses: IPutResponseModel;
  ProductRules: IProductRuleModel;
  ProductGroups: IProductGroupModel;
  SyncLogs: IEerkhetSyncLogModel; 
  CustomerRelations: ICustomerRelationModel;
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

  models.SyncLogs = db.model<IEerkhetSyncLogDocument, IEerkhetSyncLogModel>(
  'syncerkhet_synclogs',
  loadErkhetSyncLogClass(models),
);

  models.CustomerRelations = db.model<ICustomerRelationDocument, ICustomerRelationModel>(
    'msdynamics_customer_relation',
    loadCustomerRelationClass(models),
  );
  
  models.CustomerRelations = db.model<ICustomerRelationDocument, ICustomerRelationModel>(
    'msdynamics_customer_relation',
    loadCustomerRelationClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
