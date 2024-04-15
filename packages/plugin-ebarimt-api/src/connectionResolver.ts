import * as mongoose from 'mongoose';
import { IEbarimtDocument } from './models/definitions/ebarimt';
import { IPutResponseModel, loadPutResponseClass } from './models/Ebarimt';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  PutResponses: IPutResponseModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.PutResponses = db.model<IEbarimtDocument, IPutResponseModel>(
    'putresponses',
    loadPutResponseClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
