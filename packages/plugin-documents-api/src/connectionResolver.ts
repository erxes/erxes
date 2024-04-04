import * as mongoose from 'mongoose';
import {
  IDocumentModel,
  loadDocumentClass,
  IDocumentDocument,
} from './models/Documents';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Documents: IDocumentModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  _subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Documents = db.model<IDocumentDocument, IDocumentModel>(
    'documents',
    loadDocumentClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
