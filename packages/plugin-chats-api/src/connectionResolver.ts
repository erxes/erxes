import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IChatMessageDocument, IChatDocument } from './models/definitions/chat'; // IChatMessageDocument  IChatDocument
import {
  loadChatClass, // loadChatClass
  loadChatMessageClass, // loadChatMessageClass
  IChatModel, // IChatModel
  IChatMessageModel // IChatMessageModel
} from './models/chat';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  ChatMessages: IChatMessageModel;
  Chats: IChatModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

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

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
