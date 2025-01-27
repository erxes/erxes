import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

import { IConfigModel, loadConfigClass } from './models/Configs';
import { IConfigDocument } from './models/definitions/configs';
import { ICleaningModel, loadCleaningClass } from './models/Cleaning';
import {
  ICleaningDocument,
  ICleaningHistoryDocument
} from './models/definitions/cleaning';
import {
  ICleaningHistoryModel,
  loadCleaningHistoryClass
} from './models/CleaningHistory';
import { ITmsBranchModel, loadBmsBranchClass } from './models/TmsBranch';
import { ITmsBranchDocument } from './models/definitions/tmsbranch';

export interface IModels {
  Configs: IConfigModel;
  Cleaning: ICleaningModel;
  History: ICleaningHistoryModel;
  TmsBranch: ITmsBranchModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  const models = {} as IModels;

  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'pms_configs',
    loadConfigClass(models, subdomain)
  );
  models.Cleaning = db.model<ICleaningDocument, ICleaningModel>(
    'pms_cleanings',
    loadCleaningClass(models, subdomain)
  );
  models.History = db.model<ICleaningHistoryDocument, ICleaningHistoryModel>(
    'pms_history',
    loadCleaningHistoryClass(models, subdomain)
  );
  models.TmsBranch = db.model<ITmsBranchDocument, ITmsBranchModel>(
    'pms_branch',
    loadBmsBranchClass(models, subdomain)
  );
  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
