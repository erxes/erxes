import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IChatMessageDocument, IChatDocument } from './models/definitions/chat'; // IChatMessageDocument  IChatDocument
import {
  loadChatClass, //loadChatClass
  loadChatMessageClass, //loadChatMessageClass
  IChatModel, //IChatModel
  IChatMessageModel, //IChatMessageModel
} from './models/chat';
import { MongoClient } from 'mongodb';

export interface IModels {
  ChatMessages: IChatMessageModel;
  Chats: IChatModel;
}

export interface ICoreModels {
  Users: any;
  Configs: any;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;
export let coreModels: ICoreModels;

export const generateCoreModels = async (
  _hostnameOrSubdomain: string
): Promise<ICoreModels> => {
  return coreModels;
};

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
  if (coreModels) {
    return coreModels;
  }

  const url = process.env.API_MONGO_URL || 'mongodb://localhost/erxes';
  const client = new MongoClient(url);

  const dbName = 'erxes';

  let db;

  await client.connect();

  console.log('Connected successfully to server');

  db = client.db(dbName);

  coreModels = {
    Users: db.collection('users'),
    Configs: db.collection('configs'),
  };

  return coreModels;
};

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.ChatMessages = db.model<IChatMessageDocument, IChatMessageModel>(
    'chat-message',
    loadChatMessageClass(models)
  );

  models.Chats = db.model<IChatDocument, IChatModel>(
    'chat',
    loadChatClass(models)
  );

  return models;
};
