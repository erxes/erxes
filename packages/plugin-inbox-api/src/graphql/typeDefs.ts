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
  mutations as widgetMutations
} from './widgetTypeDefs';

import {
  types as SkillTypes,
  queries as SkillQueries,
  mutations as SkillMutations,
} from './skillTypeDefs';

const typeDefs = async (serviceDiscovery) => {
  const isProductsEnabled = await serviceDiscovery.isEnabled('products');
  const isTagsEnabled = await serviceDiscovery.isEnabled('tags');
  const isFormsEnabled = await serviceDiscovery.isEnabled('forms');

  const isEnabled = {
    products: isProductsEnabled,
    tags: isTagsEnabled,
    forms: isFormsEnabled,
  };

  return gql`
    scalar JSON
    scalar Date

    ${ConversationTypes(isEnabled)}
    ${MessengerAppTypes}
    ${ChannelTypes}
    ${integrationTypes(isEnabled)}
    ${ResponseTemplateTypes}
    ${widgetTypes(isEnabled)}
    ${SkillTypes}
    
    
    extend type Query {
      ${ConversationQueries(isEnabled)}
      ${MessengerAppQueries}
      ${ChannelQueries}
      ${IntegrationQueries}
      ${ResponseTemplateQueries}
      ${widgetQueries(isProductsEnabled)}
      ${SkillQueries}
    }

    extend type Mutation {
      ${ConversationMutations}
      ${MessengerAppMutations}
      ${ChannelMutations}
      ${IntegrationMutations}
      ${ResponseTemplateMutations}
      ${widgetMutations(isEnabled)}
      ${SkillMutations}
    }
  `
};

export default typeDefs;