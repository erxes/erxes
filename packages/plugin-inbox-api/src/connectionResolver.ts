import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IChannelDocument, } from './models/definitions/channels';
import { ISkillDocument, ISkillTypeDocument } from './models/definitions/skills';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IChannelModel, loadClass as loadChannelClass } from './models/Channels';
import { ISkillModel, ISkillTypeModel, loadSkillClass, loadSkillTypeClass } from './models/Skills';
import { loadClass as loadResponseTemplateClass, IResponseTemplateModel } from './models/ResponseTemplates'
import { IResponseTemplateDocument } from './models/definitions/responseTemplates';
import { IIntegrationModel, loadClass as loadIntegrationClass } from './models/Integrations';
import { IIntegrationDocument } from './models/definitions/integrations';
import { IMessengerAppModel, loadClass as loadMessengerAppClass } from './models/MessengerApps';
import { IMessengerAppDocument } from './models/definitions/messengerApps';
import { IMessageModel, loadClass as loadMessageClass } from './models/ConversationMessages';
import { IMessageDocument } from './models/definitions/conversationMessages';
import { IConversationModel, loadClass as loadConversationClass } from './models/Conversations';
import { IConversationDocument } from './models/definitions/conversations';

export interface ICoreIModels {
  Brands;
  Users;
}
export interface IModels {
  Channels: IChannelModel;
  Skills: ISkillModel;
  SkillTypes: ISkillTypeModel;
  ResponseTemplates: IResponseTemplateModel;
  Integrations: IIntegrationModel;
  MessengerApps: IMessengerAppModel;
  ConversationMessages: IMessageModel;
  Conversations: IConversationModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  coreModels: ICoreIModels;
}

export let models: IModels;
export let coreModels: ICoreIModels;

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


export const generateCoreModels = async (
  _hostnameOrSubdomain: string
): Promise<ICoreIModels> => {
    return coreModels;
};

export const getSubdomain = (hostname: string): string => {
  return hostname.replace(/(^\w+:|^)\/\//, '').split('.')[0];
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
    Brands: await db.collection('brands'),
    Users: await db.collection('users'),
  };

  return coreModels;
};

export const loadClasses = (db: mongoose.Connection, subdomain: string): IModels => {
  models = {} as IModels;
  
  models.Channels = db.model<IChannelDocument, IChannelModel>('channels', loadChannelClass(models))
  models.Skills = db.model<ISkillDocument, ISkillModel>('skills', loadSkillClass(models))
  models.SkillTypes = db.model<ISkillTypeDocument, ISkillTypeModel>('skill_types', loadSkillTypeClass(models))
  models.ResponseTemplates = db.model<IResponseTemplateDocument, IResponseTemplateModel>('response_templates', loadResponseTemplateClass(models))
  models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>('integrations', loadIntegrationClass(models, coreModels, subdomain))
  models.MessengerApps = db.model<IMessengerAppDocument, IMessengerAppModel>('messenger_apps', loadMessengerAppClass(models))
  models.ConversationMessages = db.model<IMessageDocument, IMessageModel>('conversation_messages', loadMessageClass(models))
  models.Conversations = db.model<IConversationDocument, IConversationModel>('conversations', loadConversationClass(models, coreModels, subdomain))

  return models;
};