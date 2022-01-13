import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import integration from './integration';
import conversationMessagesByConversationId from './conversationMessagesByConversationId';
import conversationsByCustomerId from './conversationsByCustomerId';

export function generateAllDataLoaders() {
  return {
    integration: integration(),
    conversationMessagesByConversationId: conversationMessagesByConversationId(),
    conversationsByCustomerId: conversationsByCustomerId()
  };
}
