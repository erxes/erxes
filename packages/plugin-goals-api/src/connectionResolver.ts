import * as mongoose from 'mongoose';
import { IConfigDocument, IGoalDocument } from './models/definitions/goals';
import {
  IConfigModel,
  IGoalModel,
  loadGoalClass,
  loadGoalConfigClass
} from './models/Goal';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Goals: IGoalModel;
  GoalConfigurations: IConfigModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  _subdomain: string
): IModels => {
  models = {} as IModels;

  models.Goals = db.model<IGoalDocument, IGoalModel>(
    'goals',
    loadGoalClass(models)
  );

  models.GoalConfigurations = db.model<IConfigDocument, IConfigModel>(
    'goal_configurations',
    loadGoalConfigClass(models)
  );
  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
