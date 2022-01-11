import { gql } from "apollo-server-express";

import {
  types as ConversationTypes,
  queries as ConversationQueries,
  mutations as ConversationMutations
} from './conversationTypeDefs';

import {
  types as ChannelTypes,
  queries as ChannelQueries,
  mutations as ChannelMutations
} from './channelTypeDefs';

import {
  types as IntegrationTypes,
  queries as IntegrationQueries,
  mutations as IntegrationMutations
} from './integrationTypeDefs';

import {
  types as ResponseTemplateTypes,
  queries as ResponseTemplateQueries,
  mutations as ResponseTemplateMutations
} from './responseTemplateTypeDefs';

import {
  types as SkillTypes,
  queries as SkillQueries,
  mutations as SkillMutations
} from './skillTypeDefs';

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${ChannelTypes}
  ${ConversationTypes}
  ${IntegrationTypes}
  ${ResponseTemplateTypes}
  ${SkillTypes}
  
  extend type Query {
    ${ChannelQueries}
    ${ConversationQueries}
    ${IntegrationQueries}
    ${ResponseTemplateQueries}
    ${SkillQueries}
  }

  extend type Mutation {
    ${ChannelMutations}
    ${ConversationMutations}
    ${IntegrationMutations}
    ${ResponseTemplateMutations}
    ${SkillMutations}
  }
`;

export default typeDefs;