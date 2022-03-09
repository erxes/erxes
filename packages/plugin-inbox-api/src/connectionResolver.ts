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
  Fields;
  FieldsGroups;
  Forms;
  EmailDeliveries;
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
  
  models.Skills = db.model<ISkillDocument, ISkillModel>('skills', loadSkillClass(models))
  models.SkillTypes = db.model<ISkillTypeDocument, ISkillTypeModel>('skill_types', loadSkillTypeClass(models))

  models.ResponseTemplates = db.model<IResponseTemplateDocument, IResponseTemplateModel>('response_templates', loadResponseTemplateClass(models))
  models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>('integrations', loadIntegrationClass(models))
  models.MessengerApps = db.model<IMessengerAppDocument, IMessengerAppModel>('messenger_apps', loadMessengerAppClass(models))

  models.ConversationMessages = db.model<IMessageDocument, IMessageModel>('conversation_messages', loadMessageClass(models))
  models.Conversations = db.model<IConversationDocument, IConversationModel>('conversations', loadConversationClass(models))

  return models;
};