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
  types as integrationTypes,
  queries as IntegrationQueries,
  mutations as IntegrationMutations
} from './integrationTypeDefs';

import {
  types as ResponseTemplateTypes,
  queries as ResponseTemplateQueries,
  mutations as ResponseTemplateMutations
} from './responseTemplateTypeDefs';

import {
  types as widgetTypes,
  queries as widgetQueries,
  mutations as WidgetMutations
} from './widgetTypeDefs';

const typeDefs = async (serviceDiscovery) => {
  const isProductsEnabled = await serviceDiscovery.isEnabled('products');
  const isTagsEnabled = await serviceDiscovery.isEnabled('tags');

  return gql`
    scalar JSON
    scalar Date

    ${ConversationTypes(isTagsEnabled)}
    ${MessengerAppTypes}
    ${ChannelTypes}
    ${integrationTypes(isProductsEnabled, isTagsEnabled)}
    ${ResponseTemplateTypes}
    ${widgetTypes(isProductsEnabled)}
    
    
    extend type Query {
      ${ConversationQueries}
      ${MessengerAppQueries}
      ${ChannelQueries}
      ${IntegrationQueries}
      ${ResponseTemplateQueries}
      ${widgetQueries(isProductsEnabled)}
    }

    extend type Mutation {
      ${ConversationMutations}
      ${MessengerAppMutations}
      ${ChannelMutations}
      ${IntegrationMutations}
      ${ResponseTemplateMutations}
      ${WidgetMutations}
    }
  `
};

export default typeDefs;