import * as _ from 'underscore';
import integration from './integration';
import conversationMessagesByConversationId from './conversationMessagesByConversationId';
import conversationsByCustomerId from './conversationsByCustomerId';
import { IModels } from '../connectionResolver';

export function generateAllDataLoaders(models: IModels) {
  return {
    integration: integration(models),
    conversationMessagesByConversationId: conversationMessagesByConversationId(models),
    conversationsByCustomerId: conversationsByCustomerId(models)
  };
}
