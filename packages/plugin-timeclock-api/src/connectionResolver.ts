import * as mongoose from 'mongoose';

import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import {
  IAbsenceModel,
  ITimeModel,
  IScheduleModel,
  IShiftModel,
  loadAbsenceClass,
  loadAbsenceTypeClass,
  loadTimeClass,
  loadScheduleClass,
  loadShiftClass,
  IAbsenceTypeModel
} from './models/Template';
import {
  IAbsenceDocument,
  IAbsenceTypeDocument,
  IScheduleDocument,
  IShiftDocument,
  ITimeClockDocument
} from './models/definitions/template';

export interface IModels {
  Templates: ITimeModel;
  Absences: IAbsenceModel;
  AbsenceTypes: IAbsenceTypeModel;
  Schedules: IScheduleModel;
  Shifts: IShiftModel;
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
    'timeclock_absence',
    loadAbsenceClass(models)
  );

  models.AbsenceTypes = db.model<IAbsenceTypeDocument, IAbsenceTypeModel>(
    'timeclock_absence_type',
    loadAbsenceTypeClass(models)
  );

  models.Schedules = db.model<IScheduleDocument, IScheduleModel>(
    'timeclock_schedule',
    loadScheduleClass(models)
  );

  models.Shifts = db.model<IShiftDocument, IShiftModel>(
    'timeclock_schedule_shifts',
    loadShiftClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
