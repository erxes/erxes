import * as permissionActions from '../permissions/actions';
import ActivityLog from './activityLog';
import ActivityLogByAction from './activityLogByAction';
import Board from './boards';
import Brand from './brand';
import {
  calendarBoard as CalendarBoard,
  calendarGroup as CalendarGroup
} from './calendar';
import Channel from './channel';
import Checklist from './checklists';
import Company from './company';
import Conversation from './conversation';
import ConversationMessage from './conversationMessage';
import Customer from './customer';
import customScalars from './customScalars';
import Deal from './deals';
import EmailDelivery from './emailDeliveries';
import {
  deliveryReport as DeliveryReport,
  message as EngageMessage
} from './engage';
import { field, fieldsGroup } from './field';
import Form from './forms';
import GrowthHack from './growthHacks';
import ImportHistory from './importHistory';
import Integration from './integration';
import InternalNote from './internalNote';
import KnowledgeBaseArticle from './knowledgeBaseArticle';
import {
  KnowledgeBaseCategory,
  KnowledgeBaseParentCategory
} from './knowledgeBaseCategory';
import KnowledgeBaseTopic from './knowledgeBaseTopic';
import Mutation from './mutations';
import Notification from './notification';
import Permission from './permission';
import Pipeline from './pipeline';
import Product from './product';
import ProductCategory from './productCategory';
import Query from './queries';
import ResponseTemplate from './responseTemplate';
import Script from './script';
import Segment from './segment';
import Stage from './stages';
import Subscription from './subscriptions';
import Tag from './tags';
import Task from './tasks';
import Ticket from './tickets';
import User from './user';
import UsersGroup from './usersGroup';
import Automation from './automation';
import AutomationNote from './automationNote';
import Trigger from './trigger';

const resolvers: any = {
  ...customScalars,
  ...permissionActions,

  ResponseTemplate,
  Script,
  Integration,
  Channel,
  Brand,
  InternalNote,
  Checklist,
  Customer,
  Company,
  Segment,
  EngageMessage,
  DeliveryReport,
  EmailDelivery,
  Conversation,
  ConversationMessage,
  Deal,
  Stage,
  Board,

  Mutation,
  Query,
  Subscription,

  KnowledgeBaseArticle,
  KnowledgeBaseCategory,
  KnowledgeBaseParentCategory,
  KnowledgeBaseTopic,

  Notification,

  Product,
  ProductCategory,

  ActivityLog,
  ActivityLogByAction,
  Form,
  FieldsGroup: fieldsGroup,
  Field: field,
  User,
  ImportHistory,
  Permission,
  Ticket,
  Task,
  UsersGroup,
  Pipeline,
  GrowthHack,
  CalendarGroup,
  CalendarBoard,
  Tag,
  Automation,
  AutomationNote,
  Trigger
};

export default resolvers;
