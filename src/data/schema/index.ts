import { gql } from 'apollo-server-express';

import { types as CommonTypes } from './common';

import { mutations as UserMutations, queries as UserQueries, types as UserTypes } from './user';

import { mutations as CompanyMutations, queries as CompanyQueries, types as CompanyTypes } from './company';

import { mutations as ChannelMutations, queries as ChannelQueries, types as ChannelTypes } from './channel';

import { mutations as BrandMutations, queries as BrandQueries, types as BrandTypes } from './brand';

import { mutations as PermissionMutations, queries as PermissionQueries, types as PermissionTypes } from './permission';

import {
  mutations as IntegrationMutations,
  queries as IntegrationQueries,
  types as IntegrationTypes,
} from './integration';

import {
  mutations as ResponseTemplateMutations,
  queries as ResponseTemplateQueries,
  types as ResponseTemplate,
} from './responseTemplate';

import { mutations as ScriptMutations, queries as ScriptQueries, types as Script } from './script';

import {
  mutations as EmailTemplateMutations,
  queries as EmailTemplateQueries,
  types as EmailTemplate,
} from './emailTemplate';

import {
  fieldsGroupsMutations as FieldGroupMutations,
  fieldsGroupsQueries as FieldGroupQueries,
  fieldsGroupsTypes as FieldGroupTypes,
  fieldsMutations as FieldMutations,
  fieldsQueries as FieldQueries,
  fieldsTypes as FieldTypes,
} from './field';

import { mutations as FormMutatons, queries as FormQueries, types as FormTypes } from './form';

import { mutations as EngageMutations, queries as EngageQueries, types as EngageTypes } from './engage';

import { mutations as TagMutations, queries as TagQueries, types as TagTypes } from './tag';

import {
  mutations as InternalNoteMutations,
  queries as InternalNoteQueries,
  types as InternalNoteTypes,
} from './internalNote';

import { mutations as CustomerMutations, queries as CustomerQueries, types as CustomerTypes } from './customer';

import { mutations as SegmentMutations, queries as SegmentQueries, types as SegmentTypes } from './segment';

import { queries as InsightQueries, types as InsightTypes } from './insight';

import {
  mutations as KnowledgeBaseMutations,
  queries as KnowledgeBaseQueries,
  types as KnowledgeBaseTypes,
} from './knowledgeBase';

import {
  mutations as NotificationMutations,
  queries as NotificationQueries,
  types as NotificationTypes,
} from './notification';

import {
  mutations as ConversationMutations,
  queries as ConversationQueries,
  types as ConversationTypes,
} from './conversation';

import { queries as ActivityLogQueries, types as ActivityLogTypes } from './activityLog';

import { mutations as BoardMutations, queries as BoardQueries, types as BoardTypes } from './board';

import { mutations as DealMutations, queries as DealQueries, types as DealTypes } from './deal';

import { mutations as ProductMutations, queries as ProductQueries, types as ProductTypes } from './product';

import { mutations as ConfigMutations, queries as ConfigQueries, types as ConfigTypes } from './config';

import {
  mutations as ImportHistoryMutations,
  queries as ImportHistoryQueries,
  types as ImportHistoryTypes,
} from './importHistory';

import {
  mutations as MessengerAppMutations,
  queries as MessengerAppQueries,
  types as MessengerAppTypes,
} from './messengerApp';

import { mutations as TicketMutations, queries as TicketQueries, types as TicketTypes } from './ticket';

import { mutations as TaskMutations, queries as TaskQueries, types as TaskTypes } from './task';

import { queries as LogQueries, types as LogTypes } from './log';

export const types = `
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
  ${EmailTemplate}
  ${EngageTypes}
  ${TagTypes}
  ${FieldTypes}
  ${FormTypes}
  ${CustomerTypes}
  ${SegmentTypes}
  ${ConversationTypes}
  ${InsightTypes}
  ${KnowledgeBaseTypes}
  ${NotificationTypes}
  ${BoardTypes}
  ${DealTypes}
  ${ProductTypes}
  ${ConfigTypes}
  ${FieldGroupTypes}
  ${ImportHistoryTypes}
  ${MessengerAppTypes}
  ${PermissionTypes}
  ${TicketTypes}
  ${TaskTypes}
  ${LogTypes}
`;

export const queries = `
  type Query {
    ${UserQueries}
    ${ChannelQueries}
    ${BrandQueries}
    ${BoardQueries}
    ${IntegrationQueries}
    ${ResponseTemplateQueries}
    ${ScriptQueries}
    ${EmailTemplateQueries}
    ${FieldQueries}
    ${EngageQueries}
    ${FormQueries}
    ${TagQueries}
    ${InternalNoteQueries}
    ${CompanyQueries}
    ${CustomerQueries}
    ${SegmentQueries}
    ${ConversationQueries}
    ${InsightQueries}
    ${KnowledgeBaseQueries}
    ${NotificationQueries}
    ${ActivityLogQueries}
    ${DealQueries}
    ${ProductQueries}
    ${ConfigQueries}
    ${FieldGroupQueries}
    ${ImportHistoryQueries}
    ${MessengerAppQueries}
    ${PermissionQueries}
    ${TicketQueries}
    ${TaskQueries}
    ${LogQueries}
  }
`;

export const mutations = `
  type Mutation {
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
    ${ProductMutations}
    ${ConfigMutations}
    ${FieldGroupMutations}
    ${ImportHistoryMutations}
    ${MessengerAppMutations}
    ${PermissionMutations}
    ${TicketMutations}
    ${TaskMutations}
  }
`;

export const subscriptions = `
  type Subscription {
    conversationChanged(_id: String!): ConversationChangedResponse
    conversationMessageInserted(_id: String!): ConversationMessage
    conversationClientMessageInserted(userId: String!): ConversationMessage
    conversationClientTypingStatusChanged(_id: String!): ConversationClientTypingStatusChangedResponse
    conversationAdminMessageInserted(customerId: String!): ConversationMessage
    customerConnectionChanged(_id: String): CustomerConnectionChangedResponse
    activityLogsChanged: Boolean
    importHistoryChanged(_id: String!): ImportHistory
    notificationInserted(userId: String): Notification
  }
`;

const typeDefs = gql(`${types} ${queries} ${mutations} ${subscriptions}`);

export default typeDefs;
