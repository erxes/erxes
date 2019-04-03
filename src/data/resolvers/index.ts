import ActivityLog from './activityLog';
import Brand from './brand';
import Channel from './channel';
import Company from './company';
import Conversation from './conversation';
import ConversationMessage from './conversationMessage';
import Customer from './customer';
import customScalars from './customScalars';
import DealBoard from './dealBoards';
import Deal from './deals';
import DealStage from './dealStages';
import EngageMessage from './engage';
import { field, fieldsGroup } from './field';
import Form from './forms';
import ImportHistory from './importHistory';
import Integration from './integration';
import InternalNote from './internalNote';
import KnowledgeBaseArticle from './knowledgeBaseArticle';
import KnowledgeBaseCategory from './knowledgeBaseCategory';
import KnowledgeBaseTopic from './knowledgeBaseTopic';
import Mutation from './mutations';
import Notification from './notification';
import Query from './queries';
import ResponseTemplate from './responseTemplate';
import Script from './script';
import Segment from './segment';
import Subscription from './subscriptions';
import User from './user';

const resolvers: any = {
  ...customScalars,

  ResponseTemplate,
  Script,
  Integration,
  Channel,
  Brand,
  InternalNote,
  Customer,
  Company,
  Segment,
  EngageMessage,
  Conversation,
  ConversationMessage,
  Deal,
  DealStage,
  DealBoard,

  Mutation,
  Query,
  Subscription,

  KnowledgeBaseArticle,
  KnowledgeBaseCategory,
  KnowledgeBaseTopic,

  Notification,

  ActivityLog,
  Form,
  FieldsGroup: fieldsGroup,
  Field: field,
  User,
  ImportHistory,
};

export default resolvers;
