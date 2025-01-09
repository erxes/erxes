import { IContext as IMainContext } from '@erxes/api-utils/src';
import * as mongoose from 'mongoose';
import { IXypData, IXypDataDocument } from './models/definitions/xypdata';
import { ISyncRule, ISyncRuleDocument } from './models/definitions/syncRule';
import { IXypDataModel, loadxypConfigClass } from './models/Xypdata';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { ISyncRuleModel, loadSyncRuleClass } from './models/SyncRules';

export interface IModels {
  XypData: IXypDataModel;
  SyncRules: ISyncRuleModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  cpUser: any;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.XypData = db.model<IXypDataDocument, IXypDataModel>(
    'xyp_data',
    loadxypConfigClass(models),
  );

  models.SyncRules = db.model<ISyncRuleDocument, ISyncRuleModel>(
    'xyp_sync_rules',
    loadSyncRuleClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
