import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import { ITemplateDocument } from '@/template/@types/template';

import mongoose from 'mongoose';

import { loadTemplateClass, ITemplateModel } from '@/template/db/models/template';

export interface IModels {
  Template: ITemplateModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Template = db.model<ITemplateDocument, ITemplateModel>(
    'template',
    loadTemplateClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
