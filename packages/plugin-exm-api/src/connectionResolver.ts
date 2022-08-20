import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';

import { mainDb } from './configs';
import { IExmDocument, IExmModel, loadExmClass } from './models/Exms';

export interface IModels {
  Exms: IExmModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
}

export let models: IModels;

export const generateModels = async (
  hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  loadClasses(mainDb, hostnameOrSubdomain);

  return models;
};

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;

  models.Exms = db.model<IExmDocument, IExmModel>(
    'exms',
    loadExmClass(models, subdomain)
  );

  return models;
};
