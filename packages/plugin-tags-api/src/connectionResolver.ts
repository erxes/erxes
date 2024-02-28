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
  serverTiming: any;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Tags = db.model<ITagDocument, ITagModel>('tags', loadTagClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
