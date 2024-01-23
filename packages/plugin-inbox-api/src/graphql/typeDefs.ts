import gql from 'graphql-tag';

import {
  types as ChannelTypes,
  queries as ChannelQueries,
  mutations as ChannelMutations,
} from './channelTypeDefs';

import {
  types as ConversationTypes,
  queries as ConversationQueries,
  mutations as ConversationMutations,
} from './conversationTypeDefs';

import {
  types as MessengerAppTypes,
  queries as MessengerAppQueries,
  mutations as MessengerAppMutations,
} from './messengerAppTypeDefs';

import {
  types as integrationTypes,
  queries as IntegrationQueries,
  mutations as IntegrationMutations,
} from './integrationTypeDefs';

import {
  types as ResponseTemplateTypes,
  queries as ResponseTemplateQueries,
  mutations as ResponseTemplateMutations,
} from './responseTemplateTypeDefs';

import {
  types as widgetTypes,
  queries as widgetQueries,
  mutations as widgetMutations,
} from './widgetTypeDefs';

import {
  types as SkillTypes,
  queries as SkillQueries,
  mutations as SkillMutations,
} from './skillTypeDefs';

import {
  types as ScriptTypes,
  queries as ScriptQueries,
  mutations as ScriptMutations,
} from './scriptTypeDefs';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

const typeDefs = async () => {
  const isProductsEnabled = await isEnabled('products');
  const isTagsEnabled = await isEnabled('tags');
  const isFormsEnabled = await isEnabled('forms');
  const isKbEnabled = await isEnabled('knowledgebase');
  const isContactsEnabled = await isEnabled('contacts');
  const isDailycoEnabled = await isEnabled('dailyco');

  const isEnabledTable = {
    products: isProductsEnabled,
    tags: isTagsEnabled,
    forms: isFormsEnabled,
    knowledgeBase: isKbEnabled,
    contacts: isContactsEnabled,
    dailyco: isDailycoEnabled,
  };

  return gql`
    scalar JSON
    scalar Date

    ${ConversationTypes(isEnabledTable)}
    ${MessengerAppTypes}
    ${ChannelTypes}
    ${integrationTypes(isEnabledTable)}
    ${ResponseTemplateTypes}
    ${widgetTypes(isEnabledTable)}
    ${SkillTypes}
    ${ScriptTypes(isEnabledTable)}
    
    
    extend type Query {
      ${ConversationQueries(isEnabledTable)}
      ${MessengerAppQueries}
      ${ChannelQueries}
      ${IntegrationQueries}
      ${ResponseTemplateQueries}
      ${widgetQueries(isEnabledTable)}
      ${SkillQueries}
      ${ScriptQueries}
    }

    extend type Mutation {
      ${ConversationMutations}
      ${MessengerAppMutations}
      ${ChannelMutations}
      ${IntegrationMutations}
      ${ResponseTemplateMutations}
      ${widgetMutations(isEnabledTable)}
      ${SkillMutations}
      ${ScriptMutations}
    }
  `;
};

export default typeDefs;
