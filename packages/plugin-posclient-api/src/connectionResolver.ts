import * as mongoose from 'mongoose';
import { IPosUserDocument } from './models/definitions/posUsers';
import { IPosUserModel, loadUserClass } from './models/PosUsers';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  PosUsers: IPosUserModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  _subdomain: string
): IModels => {
  models = {} as IModels;

  models.PosUsers = db.model<IPosUserDocument, IPosUserModel>(
    'posuser',
    loadUserClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
