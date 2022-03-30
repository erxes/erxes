import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  ICommentDocument,
  IEmojiDocument,
} from './models/definitions/reaction'; //ICommentDocument IEmojiDocument
import {
  loadCommentClass, //loadCommentClass
  loadEmojiClass, //loadEmojiClass
  ICommentModel, //ICommentModel
  IEmojiModel, //IEmojiModel
} from './models/reactions';
import { MongoClient } from 'mongodb';

export interface IModels {
  Emojis: IEmojiModel;
  Comments: ICommentModel;
}

export interface ICoreModels {
  Users: any;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;
export let coreModels: ICoreModels;

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
  };

  return coreModels;
};

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Emojis = db.model<IEmojiDocument, IEmojiModel>(
    'emojis',
    loadCommentClass(models)
  );

  models.Comments = db.model<ICommentDocument, ICommentModel>(
    'comments',
    loadEmojiClass(models)
  );

  return models;
};
