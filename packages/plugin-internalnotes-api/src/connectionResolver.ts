import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import {
  IInternalNoteModel,
  loadInternalNoteClass
} from './models/InternalNotes';

import { IInternalNoteDocument } from './models/definitions/internalNotes';
import { IContext as IMainContext } from '@erxes/api-utils/src';

export interface ICoreIModels {
  Brands;
  Users;
  Fields;
}
export interface IModels {
  InternalNotes: IInternalNoteModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  coreModels: ICoreIModels;
}

export let models: IModels;
export let coreModels: ICoreIModels;

export const generateModels = async (
  _hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  coreModels = await connectCore();

  loadClasses(mainDb);

  return models;
};

export const generateCoreModels = async (
  _hostnameOrSubdomain: string
): Promise<ICoreIModels> => {
  return coreModels;
};

const connectCore = async () => {
  if (coreModels) {
    return coreModels;
  }

  const url = process.env.API_MONGO_URL || '';
  const client = new MongoClient(url);

  let db;

  await client.connect();

  console.log('Connected successfully to server');

  db = client.db();

  return {
    Brands: await db.collection('brands'),
    Users: await db.collection('users'),
    Fields: await db.collection('form_fields')
  };
};

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.InternalNotes = db.model<IInternalNoteDocument, IInternalNoteModel>(
    'internal_notes',
    loadInternalNoteClass(models)
  );

  return models;
};
