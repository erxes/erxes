import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IUserDocument } from './models/definitions/clientportalUser';
import { ICuponDocument, IModels } from './models/definitions/cupon';
import { ICuponModel, loadCuponClass } from './models/dacCupon';
export let models: IModels | null = null;
export interface IContext extends IMainContext {
  subdomain: string;
  cpUser?: IUserDocument;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.DacCupons = db.model<ICuponDocument, ICuponModel>(
    'dac_cupon',
    loadCuponClass(models)
  );
  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
