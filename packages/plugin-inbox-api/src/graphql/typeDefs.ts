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

import {
  types as ScriptTypes,
  queries as ScriptQueries,
  mutations as ScriptMutations
} from './scriptTypeDefs'

const typeDefs = async (serviceDiscovery) => {
  const isProductsEnabled = await serviceDiscovery.isEnabled('products');
  const isTagsEnabled = await serviceDiscovery.isEnabled('tags');
  const isFormsEnabled = await serviceDiscovery.isEnabled('forms');
  const isKbEnabled = await serviceDiscovery.isEnabled('knowledgebase');

  const isEnabled = {
    products: isProductsEnabled,
    tags: isTagsEnabled,
    forms: isFormsEnabled,
    knowledgeBase: isKbEnabled
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
    ${ScriptTypes(isEnabled)}
    
    
    extend type Query {
      ${ConversationQueries(isEnabled)}
      ${MessengerAppQueries}
      ${ChannelQueries}
      ${IntegrationQueries}
      ${ResponseTemplateQueries}
      ${widgetQueries(isEnabled)}
      ${SkillQueries}
      ${ScriptQueries}
    }

    extend type Mutation {
      ${ConversationMutations}
      ${MessengerAppMutations}
      ${ChannelMutations}
      ${IntegrationMutations}
      ${ResponseTemplateMutations}
      ${widgetMutations(isEnabled)}
      ${SkillMutations}
      ${ScriptMutations}
    }
  `
};

export default typeDefs;