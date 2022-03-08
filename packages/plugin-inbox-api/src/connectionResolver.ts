import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IChannelDocument, } from './models/definitions/channels';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IChannelModel, loadClass as loadChannelClass } from './models/Channels';

export interface ICoreIModels {
  Brands;
  Users;
  Fields;
  FieldsGroups;
  Forms;
  EmailDeliveries;
}
export interface IModels {
  Channels: IChannelModel;
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
    FieldsGroups: await db.collection('form_field_groups'),
    Forms: await db.collection('forms'),
    EmailDeliveries: await db.collection('email_deliveries')
  }
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;
  
  models.Channels = db.model<IChannelDocument, IChannelModel>('channels', loadChannelClass(models))

  return models;
};