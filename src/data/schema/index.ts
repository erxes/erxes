import { mutations as UserMutations, queries as UserQueries, types as UserTypes } from './user';

import { mutations as CompanyMutations, queries as CompanyQueries, types as CompanyTypes } from './company';

import { mutations as ChannelMutations, queries as ChannelQueries, types as ChannelTypes } from './channel';

import { mutations as BrandMutations, queries as BrandQueries, types as BrandTypes } from './brand';

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

import {
  mutations as ActivityLogMutations,
  queries as ActivityLogQueries,
  types as ActivityLogTypes,
} from './activityLog';

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

export const types = `
  scalar JSON
  scalar Date

  ${UserTypes}
  ${InternalNoteTypes}
  ${ActivityLogTypes}
  ${CompanyTypes}
  ${ChannelTypes}
  ${BrandTypes}
  ${IntegrationTypes}
  ${ResponseTemplate}
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
  ${DealTypes}
  ${ProductTypes}
  ${ConfigTypes}
  ${FieldGroupTypes}
  ${ImportHistoryTypes}
  ${MessengerAppTypes}
`;

export const queries = `
  type Query {
    ${UserQueries}
    ${ChannelQueries}
    ${BrandQueries}
    ${IntegrationQueries}
    ${ResponseTemplateQueries}
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
  }
`;

export const mutations = `
  type Mutation {
    ${UserMutations}
    ${CompanyMutations}
    ${ConversationMutations}
    ${EngageMutations}
    ${TagMutations}
    ${BrandMutations}
    ${ResponseTemplateMutations}
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
    ${ActivityLogMutations}
    ${DealMutations}
    ${ProductMutations}
    ${ConfigMutations}
    ${FieldGroupMutations}
    ${ImportHistoryMutations}
    ${MessengerAppMutations}
  }
`;

export const subscriptions = `
  type Subscription {
    conversationChanged(_id: String!): ConversationChangedResponse
    conversationMessageInserted(_id: String!): ConversationMessage
    conversationClientMessageInserted: ConversationMessage
    conversationAdminMessageInserted(customerId: String!): ConversationMessage
    customerConnectionChanged(_id: String): CustomerConnectionChangedResponse
  }
`;
