import mongoose from 'mongoose';
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

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

// Erkhet
import { ISyncLogDocument as IEerkhetSyncLogDocument } from '@/erkhet/@types';

import {
  ISyncLogModel as IEerkhetSyncLogModel,
  loadSyncLogClass as loadErkhetSyncLogClass,
} from '@/erkhet/db/model/SyncLog';

// MS Dynamic
import { ICustomerRelationDocument } from '@/msdynamic/@types/dynamic';

import {
  ICustomerRelationModel,
  loadCustomerRelationClass,
} from '@/msdynamic/db/models/Dynamic';

// Configs
import { IConfigDocument } from './modules/configs/@types/configs';
import {
  IConfigModel,
  loadConfigClass,
} from './modules/configs/db/models/Configs';

export interface IModels {
  Configs: IConfigModel;
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

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
  eventDispatcher: (
    pluginName: string,
    moduleName: string,
    collectionName: string,
  ) => EventDispatcherReturn,
): IModels => {
  const models = {} as IModels;

  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'mongolian_configs',
    loadConfigClass(
      models,
      subdomain,
      eventDispatcher('mongolian', 'configs', 'mongolian_configs'),
    ),
  );

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

  models.CustomerRelations = db.model<
    ICustomerRelationDocument,
    ICustomerRelationModel
  >('msdynamics_customer_relation', loadCustomerRelationClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
