import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose from 'mongoose';

import { IBranchDocument } from './modules/branched/@types';
import { IBranchModel, loadBranchClass } from './modules/branched/db/models/Branches';
import { ISaleDocument } from './modules/branched/@types';
import { ISaleModel, loadSaleClass } from './modules/branched/db/models/Sales';
import { ITaskDocument } from './modules/branched/@types';
import { ITaskModel, loadTaskClass } from './modules/branched/db/models/Tasks';

export interface IModels {
  Branches: IBranchModel;
  Sales: ISaleModel;
  Tasks: ITaskModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Branches = db.model<IBranchDocument, IBranchModel>(
    'branched_branches',
    loadBranchClass(models, subdomain),
  );

  models.Sales = db.model<ISaleDocument, ISaleModel>(
    'branched_sales',
    loadSaleClass(models, subdomain),
  );

  models.Tasks = db.model<ITaskDocument, ITaskModel>(
    'branched_tasks',
    loadTaskClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
