import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IChatMessageDocument,
  IChatDocument,
  IUserStatusDocument
} from './models/definitions/chat'; // IChatMessageDocument  IChatDocument
import {
  loadChatClass, // loadChatClass
  loadChatMessageClass, // loadChatMessageClass
  IChatModel, // IChatModel
  IChatMessageModel, // IChatMessageModel
  IUserStatusModel,
  loadUserStatusClass
} from './models/chat';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  ChatMessages: IChatMessageModel;
  Chats: IChatModel;
  UserStatus: IUserStatusModel;
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
  models.UserStatus = db.model<IUserStatusDocument, IUserStatusModel>(
    'chat-user-status',
    loadUserStatusClass(models)
  );
  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
