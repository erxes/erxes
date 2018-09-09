import ActivityLog from './activityLog';
import ActivityLogForMonth from './activityLogForMonth';
import Brand from './brand';
import Channel from './channel';
import Company from './company';
import Conversation from './conversation';
import ConversationMessage from './conversationMessage';
import Customer from './customer';
import customScalars from './customScalars';
import Deal from './deals';
import DealStage from './dealStages';
import EngageMessage from './engage';
import { Field, FieldsGroup } from './field';
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
import Segment from './segment';
import Subscription from './subscriptions';

export default {
  ...customScalars,

  ResponseTemplate,
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

  Mutation,
  Query,
  Subscription,

  KnowledgeBaseArticle,
  KnowledgeBaseCategory,
  KnowledgeBaseTopic,

  Notification,

  ActivityLog,
  ActivityLogForMonth,
  Form,
  FieldsGroup,
  Field,
  ImportHistory,
};
