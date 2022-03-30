import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';

import { mainDb } from './configs';
import { IExmDocument, IExmModel, loadExmClass } from './models/Exms';

export interface ICoreIModels {
  Users;
}

export interface IModels {
  Exms: IExmModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  coreModels: ICoreIModels;
  subdomain: string;
}

export let models: IModels;
export let coreModels: ICoreIModels;

export const generateCoreModels = async (
  _hostnameOrSubdomain: string
): Promise<ICoreIModels> => {
  return coreModels;
};

export const generateModels = async (
  hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  coreModels = await connectCore();

  loadClasses(mainDb, hostnameOrSubdomain);

  return models;
};

export const connectCore = async () => {
  if (coreModels) {
    return coreModels;
  }

  const url = process.env.API_MONGO_URL || 'mongodb://localhost/erxes';
  const client = new MongoClient(url);

  let db;

  await client.connect();

  console.log(`Connected successfully to ${url}`);

  db = client.db();

  coreModels = {
    Users: await db.collection('users')
  };

  return coreModels;
};

export const loadClasses = (db: mongoose.Connection, subdomain: string): IModels => {
  models = {} as IModels;

  models.Exms = db.model<IExmDocument, IExmModel>(
    'exms',
    loadExmClass(models, subdomain)
  );

  return models;
};
