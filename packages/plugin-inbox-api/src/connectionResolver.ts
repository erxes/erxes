import * as mongoose from 'mongoose';
import { IChannelDocument } from './models/definitions/channels';
import {
  ISkillDocument,
  ISkillTypeDocument
} from './models/definitions/skills';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IChannelModel,
  loadClass as loadChannelClass
} from './models/Channels';
import {
  ISkillModel,
  ISkillTypeModel,
  loadSkillClass,
  loadSkillTypeClass
} from './models/Skills';
import {
  loadClass as loadResponseTemplateClass,
  IResponseTemplateModel
} from './models/ResponseTemplates';
import { IResponseTemplateDocument } from './models/definitions/responseTemplates';
import {
  IIntegrationModel,
  loadClass as loadIntegrationClass
} from './models/Integrations';
import { IIntegrationDocument } from './models/definitions/integrations';
import {
  IMessengerAppModel,
  loadClass as loadMessengerAppClass
} from './models/MessengerApps';
import { IMessengerAppDocument } from './models/definitions/messengerApps';
import {
  IMessageModel,
  loadClass as loadMessageClass
} from './models/ConversationMessages';
import { IMessageDocument } from './models/definitions/conversationMessages';
import {
  IConversationModel,
  loadClass as loadConversationClass
} from './models/Conversations';
import { IConversationDocument } from './models/definitions/conversations';
import { IScriptModel } from './models/Scripts';
import { IScriptDocument } from './models/definitions/scripts';
import { loadClass as loadScriptClass } from './models/Scripts'
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Channels: IChannelModel;
  Skills: ISkillModel;
  SkillTypes: ISkillTypeModel;
  ResponseTemplates: IResponseTemplateModel;
  Integrations: IIntegrationModel;
  MessengerApps: IMessengerAppModel;
  ConversationMessages: IMessageModel;
  Conversations: IConversationModel;
  Scripts: IScriptModel
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;

  models.Channels = db.model<IChannelDocument, IChannelModel>(
    'channels',
    loadChannelClass(models)
  );
  models.Skills = db.model<ISkillDocument, ISkillModel>(
    'skills',
    loadSkillClass(models)
  );
  models.SkillTypes = db.model<ISkillTypeDocument, ISkillTypeModel>(
    'skill_types',
    loadSkillTypeClass(models)
  );
  models.ResponseTemplates = db.model<
    IResponseTemplateDocument,
    IResponseTemplateModel
  >('response_templates', loadResponseTemplateClass(models));
  models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>(
    'integrations',
    loadIntegrationClass(models, subdomain)
  );
  models.MessengerApps = db.model<IMessengerAppDocument, IMessengerAppModel>(
    'messenger_apps',
    loadMessengerAppClass(models)
  );
  models.ConversationMessages = db.model<IMessageDocument, IMessageModel>(
    'conversation_messages',
    loadMessageClass(models)
  );
  models.Conversations = db.model<IConversationDocument, IConversationModel>(
    'conversations',
    loadConversationClass(models, subdomain)
  );
  models.Scripts = db.model<IScriptDocument, IScriptModel>(
    'scripts',
    loadScriptClass(models, subdomain)
  )

  return models;
};

export const generateModels = createGenerateModels<IModels>(models, loadClasses);