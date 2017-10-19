import customScalars from './customScalars';
import Mutation from './mutations';
import Query from './queries';
import Subscription from './subscriptions';
import ResponseTemplate from './responseTemplate';
import Integration from './integration';
import Form from './form';
import EngageMessage from './engage';
import InternalNote from './internalNote';
import Customer from './customer';
import Company from './company';
import Segment from './segment';
import Conversation from './conversation';
import ConversationMessage from './conversationMessage';
import KnowledgeBaseCategory from './knowledgeBaseCategory';
import KnowledgeBaseTopic from './knowledgeBaseTopic';

export default {
  ...customScalars,

  ResponseTemplate,
  Integration,
  Form,
  InternalNote,
  Customer,
  Company,
  Segment,
  EngageMessage,
  Conversation,
  ConversationMessage,

  Mutation,
  Query,
  Subscription,

  KnowledgeBaseCategory,
  KnowledgeBaseTopic,
};
