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
import { ISyncLogDocument } from '@/erkhet/@types';
import { ISyncLogModel, loadSyncLogClass } from '@/erkhet/db/model/SyncLog';
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose from 'mongoose';
import { IConfigDocument } from './modules/configs/@types/configs';
import { IConfigModel, loadConfigClass } from './modules/configs/db/models/Configs';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { IExchangeRateDocument } from '@/exchangeRates/@types/exchangeRate';
import {
  IExchangeRateModel,
  loadExchangeRateClass,
} from '@/exchangeRates/db/models/ExchangeRates';

export interface IModels {
  Configs: IConfigModel;
  PutResponses: IPutResponseModel;
  ProductRules: IProductRuleModel;
  ProductGroups: IProductGroupModel;
  SyncLogs: ISyncLogModel;
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
      eventDispatcher('mongolian', 'configs', 'mongolian_configs'),),
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

  models.SyncLogs = db.model<ISyncLogDocument, ISyncLogModel>(
    'syncerkhet_synclogs',
    loadSyncLogClass(models),
  );

  models.ExchangeRates = db.model<IExchangeRateDocument, IExchangeRateModel>(
    'exchange_rates',
    loadExchangeRateClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
