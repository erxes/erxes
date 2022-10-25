import * as mongoose from 'mongoose';

import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { ITimeModel, loadTimeClass } from './models/Template';
import { ITimeClockDocument } from './models/definitions/template';

export interface IModels {
  Templates: ITimeModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Templates = db.model<ITimeClockDocument, ITimeModel>(
    'timeclock',
    loadTimeClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
