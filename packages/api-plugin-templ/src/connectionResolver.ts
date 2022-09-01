import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { ITemplateModel, loadTemplateClass } from './models/Template';
import { ITemplateDocument } from './models/definitions/template';

export interface IModels {
  Templates: ITemplateModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Templates = db.model<ITemplateDocument, ITemplateModel>('template', loadTemplateClass(models));

  return models;
}

export const generateModels = createGenerateModels<IModels>(models, loadClasses);