import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IConversation, IConversationMessages } from './models';

export interface IModels {
  Conversations: IConversation;
  ConversationMessage: IConversationMessages;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}
