import { ScopedEventHandlers } from 'erxes-api-shared/core-modules';
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
// Erkhet
import { ISyncLogDocument as IErkhetSyncLogDocument } from '@/erkhet/@types';
import {
  ISyncLogModel as IErkhetSyncLogModel,
  loadSyncLogClass as loadErkhetSyncLogClass,
} from '@/erkhet/db/model/SyncLog';
// MS Dynamic
import { ICustomerRelationDocument, ISyncLogDocument as IMSDSyncLogDocument} from '@/msdynamic/@types/dynamic';
import {
  ISyncLogModel as ISyncLogMSDModel,
  loadSyncLogClass as loadSyncLogMSDClass,
  ICustomerRelationModel,
  loadCustomerRelationClass,
} from '@/msdynamic/db/models/Dynamic';
// Configs
import { IExchangeRateDocument } from '@/exchangeRates/@types/exchangeRate';
import {
  IExchangeRateModel,
  loadExchangeRateClass,
} from '@/exchangeRates/db/models/ExchangeRates';
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
  SyncLogs: IErkhetSyncLogModel;
  CustomerRelations: ICustomerRelationModel;
  SyncLogsMSD: ISyncLogMSDModel;
  ExchangeRates: IExchangeRateModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  commonQuerySelector: any;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
  eventHandlers: ScopedEventHandlers,
): IModels => {
  const models = {} as IModels;
  const mongolianEventHandlers = eventHandlers('mongolian');

  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'mongolian_configs',
    loadConfigClass(
      models,
      subdomain,
      mongolianEventHandlers('configs', 'mongolian_configs'),
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

  models.SyncLogs = db.model<IErkhetSyncLogDocument, IErkhetSyncLogModel>(
    'syncerkhet_synclogs',
    loadErkhetSyncLogClass(models),
  );

  models.SyncLogsMSD = db.model<IMSDSyncLogDocument, ISyncLogMSDModel>(
    'msdynamics_synclogs',
    loadSyncLogMSDClass(models),
  );

  models.CustomerRelations = db.model<
    ICustomerRelationDocument,
    ICustomerRelationModel
  >('msdynamics_customer_relation', loadCustomerRelationClass(models));
  models.ExchangeRates = db.model<IExchangeRateDocument, IExchangeRateModel>(
    'exchange_rates',
    loadExchangeRateClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
