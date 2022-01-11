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

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${ConversationTypes}
  ${MessengerAppTypes}
  ${ChannelTypes}
  ${IntegrationTypes}
  
  extend type Query {
    ${ConversationQueries}
    ${MessengerAppQueries}
    ${ChannelQueries}
    ${IntegrationQueries}
  }

  extend type Mutation {
    ${ConversationMutations}
    ${MessengerAppMutations}
    ${ChannelMutations}
    ${IntegrationMutations}
  }
`;

export default typeDefs;