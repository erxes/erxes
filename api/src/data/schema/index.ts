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
  mutations as ChecklistMutations,
  queries as ChecklistQueries,
  types as ChecklistTypes
} from './checklist';
import {
  mutations as ClientPortalMutations,
  queries as ClientPortalQueries,
  types as ClientPortalTypes
} from './clientPortal';
import { types as CommonTypes } from './common';
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
  mutations as DashboardMutations,
  queries as DashboardQueries,
  types as DashboardTypes
} from './dashboard';
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
  mutations as ImportHistoryMutations,
  queries as ImportHistoryQueries,
  types as ImportHistoryTypes
} from './importHistory';
import {
  mutations as InternalNoteMutations,
  queries as InternalNoteQueries,
  types as InternalNoteTypes
} from './internalNote';
// import {
//   mutations as KnowledgeBaseMutations,
//   queries as KnowledgeBaseQueries,
//   types as KnowledgeBaseTypes
// } from './knowledgeBase';
import { queries as LogQueries, types as LogTypes } from './log';
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
  mutations as ProductMutations,
  queries as ProductQueries,
  types as ProductTypes
} from './product';
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
  mutations as TagMutations,
  queries as TagQueries,
  types as TagTypes
} from './tag';
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
  queries as SmsDeliveryQueries,
  types as SmsDeliveryTypes
} from './smsDelivery';
import {
  mutations as StructureMutations,
  queries as StructureQueries,
  types as StructureTypes
} from './structure';

export let types = `
  scalar JSON
  scalar Date
  ${CommonTypes}
  ${UserTypes}
  ${InternalNoteTypes}
  ${ActivityLogTypes}
  ${BrandTypes}
  ${Script}
  ${ClientPortalTypes}
  ${EmailTemplate}
  ${EmailDelivery}
  ${TagTypes}
  ${FieldTypes}
  ${FormTypes}
  ${ConformityTypes}
  ${SegmentTypes}
  ${NotificationTypes}
  ${DashboardTypes}
  ${ProductTypes}
  ${ConfigTypes}
  ${FieldGroupTypes}
  ${ImportHistoryTypes}
  ${PermissionTypes}
  ${LogTypes}
  ${ChecklistTypes}
  ${RobotTypes}
  ${WebhookTypes}
  ${CalendarTypes}
  ${SmsDeliveryTypes}
  ${StructureTypes}
  ${AutomationTypes}
`;

export let queries = `
  ${UserQueries}
  ${BrandQueries}
  ${ScriptQueries}
  ${EmailTemplateQueries}
  ${ClientPortalQueries}
  ${EmailDeliveryQueries}
  ${FieldQueries}
  ${FormQueries}
  ${TagQueries}
  ${InternalNoteQueries}
  ${SegmentQueries}
  
  ${NotificationQueries}
  ${ActivityLogQueries}
  ${DashboardQueries}
  ${ProductQueries}
  ${ConfigQueries}
  ${FieldGroupQueries}
  ${ImportHistoryQueries}
  ${PermissionQueries}
  ${LogQueries}
  ${ChecklistQueries}
  ${RobotQueries}
  ${WebhookQueries}
  ${CalendarQueries}
  ${SmsDeliveryQueries}
  ${StructureQueries}
  ${AutomationQueries}
`;

export let mutations = `
  ${UserMutations}
  ${TagMutations}
  ${BrandMutations}
  ${ScriptMutations}
  ${EmailTemplateMutations}
  ${ClientPortalMutations}
  ${InternalNoteMutations}
  ${SegmentMutations}
  ${FieldMutations}
  ${FormMutatons}
  ${NotificationMutations}
  ${DashboardMutations}
  ${ProductMutations}
  ${ConfigMutations}
  ${FieldGroupMutations}
  ${ImportHistoryMutations}
  ${PermissionMutations}
  ${ConformityMutations}
  ${ChecklistMutations}
  ${RobotMutations}
  ${WebhookMutations}
  ${CalendarMutations}
  ${StructureMutations}
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
