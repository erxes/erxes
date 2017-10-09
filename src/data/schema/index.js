import { types as UserTypes, queries as UserQueries } from './user';

import { types as CompanyTypes, mutations as CompanyMutations } from './company';

import { types as ChannelTypes, queries as ChannelQueries } from './channel';

import { types as BrandTypes, queries as BrandQueries, mutations as BrandMutations } from './brand';

import { types as IntegrationTypes, queries as IntegrationQueries } from './integration';

import {
  types as ResponseTemplate,
  queries as ResponseTemplateQueries,
  mutations as ResponseTemplateMutations,
} from './responseTemplate';

import {
  types as EmailTemplate,
  queries as EmailTemplateQueries,
  mutations as EmailTemplateMutations,
} from './emailTemplate';

import { types as FieldTypes, queries as FieldQueries, mutations as FieldMutations } from './field';

import { types as FormTypes, queries as FormQueries } from './form';

import { types as EngageTypes, queries as EngageQueries } from './engage';

import { types as TagTypes, queries as TagQueries } from './tag';

import {
  types as CustomerTypes,
  queries as CustomerQueries,
  mutations as CustomerMutations,
} from './customer';

import {
  types as SegmentTypes,
  queries as SegmentQueries,
  mutations as SegmentMutations,
} from './segment';

import { types as InsightTypes, queries as InsightQueries } from './insight';

import { types as KnowledgeBaseTypes, queries as KnowledgeBaseQueries } from './knowledgeBase';

import {
  types as ConversationTypes,
  queries as ConversationQueries,
  mutations as ConversationMutations,
} from './conversation';

export const types = `
  scalar JSON
  scalar Date

  ${UserTypes}
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
    ${FormQueries}
    ${EngageQueries}
    ${TagQueries}
    ${CustomerQueries}
    ${SegmentQueries}
    ${ConversationQueries}
    ${InsightQueries}
    ${KnowledgeBaseQueries}
  }
`;

export const mutations = `
  type Mutation {
    ${CompanyMutations}
    ${ConversationMutations}
    ${BrandMutations}
    ${ResponseTemplateMutations}
    ${EmailTemplateMutations}
    ${CustomerMutations}
    ${SegmentMutations}
    ${FieldMutations}
  }
`;

export const subscriptions = `
  type Subscription {
    conversationChanged(_id: String!): ConversationChangedResponse
    conversationMessageInserted(_id: String!): ConversationMessage
    conversationsChanged(customerId: String): ConversationsChangedResponse
  }
`;
