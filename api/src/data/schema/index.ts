import {
  queries as ActivityLogQueries,
  types as ActivityLogTypes
} from './activityLog';
import {
  mutations as AutomationMutations,
  queries as AutomationQueries,
  types as AutomationTypes
} from './automations';
import {
  mutations as BoardMutations,
  queries as BoardQueries,
  types as BoardTypes
} from './board';
import {
  mutations as BrandMutations,
  queries as BrandQueries,
  types as BrandTypes
} from './brand';
import {
  mutations as CalendarMutations,
  queries as CalendarQueries,
  types as CalendarTypes
} from './calendars';
import {
  mutations as ChannelMutations,
  queries as ChannelQueries,
  types as ChannelTypes
} from './channel';
import {
  mutations as ChecklistMutations,
  queries as ChecklistQueries,
  types as ChecklistTypes
} from './checklist';
import { types as CommonTypes } from './common';
import {
  mutations as CompanyMutations,
  queries as CompanyQueries,
  types as CompanyTypes
} from './company';
import {
  mutations as ConfigMutations,
  queries as ConfigQueries,
  types as ConfigTypes
} from './config';
import {
  mutations as ConformityMutations,
  types as ConformityTypes
} from './conformity';
import {
  mutations as ConversationMutations,
  queries as ConversationQueries,
  types as ConversationTypes
} from './conversation';
import {
  mutations as CustomerMutations,
  queries as CustomerQueries,
  types as CustomerTypes
} from './customer';
import {
  mutations as DashboardMutations,
  queries as DashboardQueries,
  types as DashboardTypes
} from './dashboard';
import {
  mutations as DealMutations,
  queries as DealQueries,
  types as DealTypes
} from './deal';
import {
  queries as EmailDeliveryQueries,
  types as EmailDelivery
} from './emailDelivery';
import {
  mutations as EmailTemplateMutations,
  queries as EmailTemplateQueries,
  types as EmailTemplate
} from './emailTemplate';
import {
  mutations as EngageMutations,
  queries as EngageQueries,
  types as EngageTypes
} from './engage';
import {
  fieldsGroupsMutations as FieldGroupMutations,
  fieldsGroupsQueries as FieldGroupQueries,
  fieldsGroupsTypes as FieldGroupTypes,
  fieldsMutations as FieldMutations,
  fieldsQueries as FieldQueries,
  fieldsTypes as FieldTypes
} from './field';
import {
  mutations as FormMutatons,
  queries as FormQueries,
  types as FormTypes
} from './form';
import {
  mutations as GrowthHackMutations,
  queries as GrowthHackQueries,
  types as GrowthHackTypes
} from './growthHack';
import {
  mutations as ImportHistoryMutations,
  queries as ImportHistoryQueries,
  types as ImportHistoryTypes
} from './importHistory';
import {
  mutations as IntegrationMutations,
  queries as IntegrationQueries,
  types as IntegrationTypes
} from './integration';
import {
  mutations as InternalNoteMutations,
  queries as InternalNoteQueries,
  types as InternalNoteTypes
} from './internalNote';

import {
  mutations as KnowledgeBaseMutations,
  queries as KnowledgeBaseQueries,
  types as KnowledgeBaseTypes
} from './knowledgeBase';
import { queries as LogQueries, types as LogTypes } from './log';
import {
  mutations as MessengerAppMutations,
  queries as MessengerAppQueries,
  types as MessengerAppTypes
} from './messengerApp';
import {
  mutations as NotificationMutations,
  queries as NotificationQueries,
  types as NotificationTypes
} from './notification';
import {
  mutations as PermissionMutations,
  queries as PermissionQueries,
  types as PermissionTypes
} from './permission';
import {
  mutations as PipelineLabelMutations,
  queries as PipelineLabelQueries,
  types as PipelineLabelTypes
} from './pipelineLabel';
import {
  mutations as PipelineTemplateMutations,
  queries as PipelineTemplateQueries,
  types as PipelineTemplateTypes
} from './pipelineTemplate';
import {
  mutations as ProductMutations,
  queries as ProductQueries,
  types as ProductTypes
} from './product';
import {
  mutations as ResponseTemplateMutations,
  queries as ResponseTemplateQueries,
  types as ResponseTemplate
} from './responseTemplate';
import {
  mutations as RobotMutations,
  queries as RobotQueries,
  types as RobotTypes
} from './robot';
import {
  mutations as ScriptMutations,
  queries as ScriptQueries,
  types as Script
} from './script';
import {
  mutations as SegmentMutations,
  queries as SegmentQueries,
  types as SegmentTypes
} from './segment';
import {
  mutations as SkillMutations,
  queries as SkillQueries,
  types as SkillTypes
} from './skills';
import {
  mutations as TagMutations,
  queries as TagQueries,
  types as TagTypes
} from './tag';
import {
  mutations as TaskMutations,
  queries as TaskQueries,
  types as TaskTypes
} from './task';
import {
  mutations as TicketMutations,
  queries as TicketQueries,
  types as TicketTypes
} from './ticket';
import {
  mutations as UserMutations,
  queries as UserQueries,
  types as UserTypes
} from './user';
import {
  mutations as WebhookMutations,
  queries as WebhookQueries,
  types as WebhookTypes
} from './webhook';
import {
  mutations as WidgetMutations,
  queries as WidgetQueries,
  types as WidgetTypes
} from './widget';
import {
  queries as SmsDeliveryQueries,
  types as SmsDeliveryTypes
} from './smsDelivery';

export let types = `
  scalar JSON
  scalar Date
  ${CommonTypes}
  ${UserTypes}
  ${InternalNoteTypes}
  ${ActivityLogTypes}
  ${CompanyTypes}
  ${ChannelTypes}
  ${BrandTypes}
  ${IntegrationTypes}
  ${ResponseTemplate}
  ${Script}
  ${SkillTypes}
  ${EmailTemplate}
  ${EngageTypes}
  ${EmailDelivery}
  ${TagTypes}
  ${FieldTypes}
  ${FormTypes}
  ${ConformityTypes}
  ${CustomerTypes}
  ${SegmentTypes}
  ${ConversationTypes}
  ${KnowledgeBaseTypes}
  ${NotificationTypes}
  ${BoardTypes}
  ${DealTypes}
  ${DashboardTypes}
  ${ProductTypes}
  ${ConfigTypes}
  ${FieldGroupTypes}
  ${ImportHistoryTypes}
  ${MessengerAppTypes}
  ${PermissionTypes}
  ${TicketTypes}
  ${TaskTypes}
  ${LogTypes}
  ${GrowthHackTypes}
  ${PipelineTemplateTypes}
  ${ChecklistTypes}
  ${RobotTypes}
  ${PipelineLabelTypes}
  ${WidgetTypes}
  ${WebhookTypes}
  ${CalendarTypes}
  ${SmsDeliveryTypes}
  ${AutomationTypes}
`;

export let queries = `
  ${UserQueries}
  ${ChannelQueries}
  ${BrandQueries}
  ${BoardQueries}
  ${IntegrationQueries}
  ${ResponseTemplateQueries}
  ${ScriptQueries}
  ${SkillQueries}
  ${EmailTemplateQueries}
  ${EmailDeliveryQueries}
  ${FieldQueries}
  ${EngageQueries}
  ${FormQueries}
  ${TagQueries}
  ${InternalNoteQueries}
  ${CompanyQueries}
  ${CustomerQueries}
  ${SegmentQueries}
  ${ConversationQueries}
  ${KnowledgeBaseQueries}
  ${NotificationQueries}
  ${ActivityLogQueries}
  ${DealQueries}
  ${DashboardQueries}
  ${ProductQueries}
  ${ConfigQueries}
  ${FieldGroupQueries}
  ${ImportHistoryQueries}
  ${PermissionQueries}
  ${TicketQueries}
  ${TaskQueries}
  ${LogQueries}
  ${GrowthHackQueries}
  ${PipelineTemplateQueries}
  ${ChecklistQueries}
  ${RobotQueries}
  ${PipelineLabelQueries}
  ${WidgetQueries}
  ${WebhookQueries}
  ${CalendarQueries}
  ${MessengerAppQueries}
  ${SmsDeliveryQueries}
  ${AutomationQueries}
`;

export let mutations = `
  ${UserMutations}
  ${CompanyMutations}
  ${ConversationMutations}
  ${EngageMutations}
  ${TagMutations}
  ${BoardMutations}
  ${BrandMutations}
  ${ResponseTemplateMutations}
  ${ScriptMutations}
  ${EmailTemplateMutations}
  ${InternalNoteMutations}
  ${CustomerMutations}
  ${SegmentMutations}
  ${FieldMutations}
  ${ChannelMutations}
  ${FormMutatons}
  ${IntegrationMutations}
  ${KnowledgeBaseMutations}
  ${NotificationMutations}
  ${DealMutations}
  ${DashboardMutations}
  ${ProductMutations}
  ${ConfigMutations}
  ${FieldGroupMutations}
  ${ImportHistoryMutations}
  ${MessengerAppMutations}
  ${PermissionMutations}
  ${TicketMutations}
  ${TaskMutations}
  ${GrowthHackMutations}
  ${PipelineTemplateMutations}
  ${ConformityMutations}
  ${ChecklistMutations}
  ${RobotMutations}
  ${SkillMutations}
  ${PipelineLabelMutations}
  ${WidgetMutations}
  ${WebhookMutations}
  ${CalendarMutations}
  ${AutomationMutations}
`;

export let subscriptions = `
  conversationChanged(_id: String!): ConversationChangedResponse
  conversationMessageInserted(_id: String!): ConversationMessage
  conversationClientMessageInserted(userId: String!): ConversationMessage
  conversationClientTypingStatusChanged(_id: String!): ConversationClientTypingStatusChangedResponse
  conversationAdminMessageInserted(customerId: String): ConversationAdminMessageInsertedResponse
  conversationExternalIntegrationMessageInserted: JSON
  conversationBotTypingStatus(_id: String!): JSON
  customerConnectionChanged(_id: String): CustomerConnectionChangedResponse
  activityLogsChanged: Boolean
  importHistoryChanged(_id: String!): ImportHistory
  notificationInserted(userId: String): Notification
  notificationRead(userId: String): JSON
  onboardingChanged(userId: String!): OnboardingNotification

  pipelinesChanged(_id: String!): PipelineChangeResponse
  userChanged(userId: String): JSON

  checklistsChanged(contentType: String!, contentTypeId: String!): Checklist
  checklistDetailChanged(_id: String!): Checklist
  calendarEventUpdated: JSON
`;

export default { types, queries, mutations, subscriptions };
