import * as mongoose from 'mongoose';

import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import {
  IAbsenceModel,
  ITimeModel,
  IScheduleModel,
  loadAbsenceClass,
  loadTimeClass,
  loadScheduleClass
} from './models/Template';
import {
  IAbsenceDocument,
  IScheduleDocument,
  ITimeClockDocument
} from './models/definitions/template';

export interface IModels {
  Templates: ITimeModel;
  Absences: IAbsenceModel;
  Schedules: IScheduleModel;
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

  models.Absences = db.model<IAbsenceDocument, IAbsenceModel>(
    'absence',
    loadAbsenceClass(models)
  );

  models.Schedules = db.model<IScheduleDocument, IScheduleModel>(
    'schedule',
    loadScheduleClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
