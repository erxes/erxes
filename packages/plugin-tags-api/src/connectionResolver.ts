import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { ITagDocument } from './models/definitions/tags';
import { ITagModel, loadTagClass } from './models/Tags';
import { IContext as IMainContext } from '@erxes/api-utils/src';

export interface ICoreIModels {
  Brands;
  Users;
  Fields;
}
export interface IModels {
  Tags: ITagModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;

export const generateModels = async (
  _hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  loadClasses(mainDb);

  return models;
};

const connectCore = async () => {
  const url = process.env.API_MONGO_URL || '';
  const client = new MongoClient(url);

  const dbName = 'erxes';

  let db;

  await client.connect();

  console.log('Connected successfully to server');

  db = client.db(dbName);

  return {
    Brands: await db.collection('brands'),
    Users: await db.collection('users'),
    Fields: await db.collection('form_fields'),
  };
};

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Tags = db.model<ITagDocument, ITagModel>('tags', loadTagClass(models));

  return models;
};
