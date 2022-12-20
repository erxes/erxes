import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { ILabelDocument } from './models/definitions/labels';
import { ITimeframeDocument } from './models/definitions/timeframes';
import { ILabelModel, loadLabelClass } from './models/Labels';
import { ITimeframeModel, loadTimeframeClass } from './models/Timeframes';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IYearPlanModel, loadYearPlanClass } from './models/YearPlans';
import { IDayLabelModel, loadDayLabelClass } from './models/DayLabels';
import { IDayPlanModel, loadDayPlanClass } from './models/DayPlans';
import { IYearPlanDocument } from './models/definitions/yearPlans';
import { IDayPlanDocument } from './models/definitions/dayPlans';
import { IDayLabelDocument } from './models/definitions/dayLabels';
import {
  ITimeProportionModel,
  loadTimeProportionClass
} from './models/TimeProportions';
import { ITimeProportionDocument } from './models/definitions/timeProportions';

export interface IModels {
  Labels: ILabelModel;
  Timeframes: ITimeframeModel;
  TimeProportions: ITimeProportionModel;
  YearPlans: IYearPlanModel;
  DayLabels: IDayLabelModel;
  DayPlans: IDayPlanModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Labels = db.model<ILabelDocument, ILabelModel>(
    'salesplans_labels',
    loadLabelClass(models)
  );

  models.Timeframes = db.model<ITimeframeDocument, ITimeframeModel>(
    'timeframes',
    loadTimeframeClass(models)
  );

  models.TimeProportions = db.model<
    ITimeProportionDocument,
    ITimeProportionModel
  >('time_proportions', loadTimeProportionClass(models));

  models.YearPlans = db.model<IYearPlanDocument, IYearPlanModel>(
    'salesplans_yearplans',
    loadYearPlanClass(models)
  );

  models.DayLabels = db.model<IDayLabelDocument, IDayLabelModel>(
    'salesplans_daylabels',
    loadDayLabelClass(models)
  );

  models.DayPlans = db.model<IDayPlanDocument, IDayPlanModel>(
    'salesplans_dayplans',
    loadDayPlanClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
