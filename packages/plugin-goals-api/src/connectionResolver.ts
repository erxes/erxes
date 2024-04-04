import * as mongoose from 'mongoose';
import { IGoalDocument } from './models/definitions/goals';
import { IGoalModel, loadGoalClass } from './models/Goals';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Goals: IGoalModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  serverTiming: any;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Goals = db.model<IGoalDocument, IGoalModel>(
    'goals',
    loadGoalClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
