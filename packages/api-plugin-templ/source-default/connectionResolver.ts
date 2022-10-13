import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import {
  ITemplateModel,
  ITypeModel,
  loadTemplateClass,
  loadTypeClass
} from './models/Template';
import {
  ITemplateDocument,
  ITypeDocument
} from './models/definitions/template';

export interface IModels {
  Templates: ITemplateModel;
  Types: ITypeModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Templates = db.model<ITemplateDocument, ITemplateModel>(
    '{name}',
    loadTemplateClass(models)
  );

  models.Types = db.model<ITypeDocument, ITypeModel>(
    '{name}type',
    loadTypeClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
