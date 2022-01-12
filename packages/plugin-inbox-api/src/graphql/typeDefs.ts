import { gql } from "apollo-server-express";

import {
  types as ChannelTypes,
  queries as ChannelQueries,
  mutations as ChannelMutations
} from './channelTypeDefs';

import {
  types as ConversationTypes,
  queries as ConversationQueries,
  mutations as ConversationMutations
} from './conversationTypeDefs';

import {
  types as MessengerAppTypes,
  queries as MessengerAppQueries,
  mutations as MessengerAppMutations
} from './messengerAppTypeDefs';

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
  types as WidgetTypes,
  queries as WidgetQueries,
  mutations as WidgetMutations
} from './widgetTypeDefs';

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${ConversationTypes}
  ${MessengerAppTypes}
  ${ChannelTypes}
  ${IntegrationTypes}
  ${ResponseTemplateTypes}
  ${WidgetTypes}
  
  
  extend type Query {
    ${ConversationQueries}
    ${MessengerAppQueries}
    ${ChannelQueries}
    ${IntegrationQueries}
    ${ResponseTemplateQueries}
    ${WidgetQueries}
  }

  extend type Mutation {
    ${ConversationMutations}
    ${MessengerAppMutations}
    ${ChannelMutations}
    ${IntegrationMutations}
    ${ResponseTemplateMutations}
    ${WidgetMutations}
  }
`;

export default typeDefs;