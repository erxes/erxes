import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import mongoose from 'mongoose';
import {
  loadTemplateClass,
  ITemplateModel,
} from './modules/template/db/models/Template';
import {
  loadTemplateCategoryClass,
  ITemplateCategoryModel,
} from './modules/template/db/models/TemplateCategory';
import {
  TemplateDocument,
  TemplateCategoryDocument,
} from './modules/template/db/definitions/template';

export interface IModels {
  Template: ITemplateModel;
  TemplateCategory: ITemplateCategoryModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  const schemaWithClass = loadTemplateClass(models);
  models.Template = db.model<TemplateDocument, ITemplateModel>(
    'templates',
    schemaWithClass,
  );

  const categorySchemaWithClass = loadTemplateCategoryClass(models);
  models.TemplateCategory = db.model<
    TemplateCategoryDocument,
    ITemplateCategoryModel
  >('template_categories', categorySchemaWithClass);

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
