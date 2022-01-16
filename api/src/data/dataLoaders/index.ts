import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import productCategory from './productCategory';
import tag from './tag';
import form from './form';
import integration from './integration';
import user from './user';
import segmentsBySubOf from './segmentsBySubOf';
import segment from './segment';
import conversationMessagesByConversationId from './conversationMessagesByConversationId';
import conversationsByCustomerId from './conversationsByCustomerId';

export interface IDataLoaders {
  productCategory: DataLoader<string, any>;
  tag: DataLoader<string, any>;
  form: DataLoader<string, any>;
  integration: DataLoader<string, any>;
  user: DataLoader<string, any>;
  segmentsBySubOf: DataLoader<string, any[]>;
  segment: DataLoader<string, any>;
  conversationMessagesByConversationId: DataLoader<string, any[]>;
  conversationsByCustomerId: DataLoader<string, any[]>;
}

export function generateAllDataLoaders(): IDataLoaders {
  return {
    productCategory: productCategory(),
    tag: tag(),
    form: form(),
    integration: integration(),
    user: user(),
    segmentsBySubOf: segmentsBySubOf(),
    segment: segment(),
    conversationMessagesByConversationId: conversationMessagesByConversationId(),
    conversationsByCustomerId: conversationsByCustomerId()
  };
}
