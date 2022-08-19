import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IChatMessageDocument, IChatDocument } from './models/definitions/chat'; // IChatMessageDocument  IChatDocument
import {
  loadChatClass, // loadChatClass
  loadChatMessageClass, // loadChatMessageClass
  IChatModel, // IChatModel
  IChatMessageModel // IChatMessageModel
} from './models/chat';
import { MongoClient } from 'mongodb';

export interface IModels {
  ChatMessages: IChatMessageModel;
  Chats: IChatModel;
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
