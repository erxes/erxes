import * as mongoose from 'mongoose';
import { ITagDocument } from './models/definitions/tags';
import { ITagModel, loadTagClass } from './models/Tags';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Tags: ITagModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Tags = db.model<ITagDocument, ITagModel>('tags', loadTagClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(models, loadClasses)