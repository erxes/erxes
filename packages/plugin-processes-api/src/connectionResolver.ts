import * as mongoose from 'mongoose';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IFlowDocument } from './models/definitions/flows';
import { IFlowModel, loadFlowClass } from './models/Flows';
import { IJobCategoryDocument } from './models/definitions/jobCategories';
import {
  IJobCategoryModel,
  loadJobCategoryClass
} from './models/JobCategories';
import { IJobReferDocument } from './models/definitions/jobs';
import { IJobReferModel, loadJobReferClass } from './models/Jobs';
import { IPerformDocument } from './models/definitions/performs';
import { IPerformModel, loadPerformClass } from './models/Performs';
import { IWorkDocument } from './models/definitions/works';
import { IWorkModel, loadWorkClass } from './models/Works';
import { IProcessModel, loadProcessClass } from './models/Processes';
import { IProcessDocument } from './models/definitions/processes';

export interface IModels {
  JobCategories: IJobCategoryModel;
  JobRefers: IJobReferModel;
  Flows: IFlowModel;
  Processes: IProcessModel;
  Works: IWorkModel;
  Performs: IPerformModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.JobCategories = db.model<IJobCategoryDocument, IJobCategoryModel>(
    'job_categories',
    loadJobCategoryClass(models)
  );
  models.JobRefers = db.model<IJobReferDocument, IJobReferModel>(
    'job_refers',
    loadJobReferClass(models)
  );
  models.Flows = db.model<IFlowDocument, IFlowModel>(
    'flows',
    loadFlowClass(models)
  );
  models.Processes = db.model<IProcessDocument, IProcessModel>(
    'processes',
    loadProcessClass(models)
  );
  models.Works = db.model<IWorkDocument, IWorkModel>(
    'works',
    loadWorkClass(models)
  );
  models.Performs = db.model<IPerformDocument, IPerformModel>(
    'performs',
    loadPerformClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
