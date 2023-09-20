import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import { ISyncModel, loadSyncClass } from './models/sync';
import { Model } from 'mongoose';
import {
  ICategoryDocument,
  ISyncDocument,
  ISyncedCustomersDocument,
  syncedCustomersSaas
} from './models/definitions/sync';
import {
  syncedDealSchema,
  SyncedDealDocuments
} from './models/definitions/deals';
import { loadSyncCategoriesClass, ICategoriesModel } from './models/categories';
import { ISyncDealModel, loadSyncDealClass } from './models/deals';

export interface IModels {
  Sync: ISyncModel;
  SyncedCustomers: Model<ISyncedCustomersDocument>;
  SyncedDeals: ISyncDealModel;
  Categories: ICategoriesModel;
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

  models.Sync = db.model<ISyncDocument, ISyncModel>(
    'synced_saas',
    loadSyncClass(models, subdomain)
  );

  models.SyncedCustomers = db.model<
    ISyncedCustomersDocument,
    Model<ISyncedCustomersDocument>
  >('synced_saas_customers', syncedCustomersSaas);

  models.SyncedDeals = db.model<SyncedDealDocuments, ISyncDealModel>(
    'synced_saas_deals',
    loadSyncDealClass(models, subdomain)
  );

  models.Categories = db.model<ICategoryDocument, ICategoriesModel>(
    'synced_saas_categories',
    loadSyncCategoriesClass(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
