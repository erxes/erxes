import {
  mutations as ChannelMutations,
  queries as ChannelQueries,
  types as ChannelTypes,
} from './channelTypeDefs';
import {
  mutations as ConversationMutations,
  queries as ConversationQueries,
  types as ConversationTypes,
} from './conversationTypeDefs';
import {
  mutations as IntegrationMutations,
  queries as IntegrationQueries,
  types as integrationTypes,
} from './integrationTypeDefs';
import {
  mutations as MessengerAppMutations,
  queries as MessengerAppQueries,
  types as MessengerAppTypes,
} from './messengerAppTypeDefs';
import {
  mutations as ResponseTemplateMutations,
  queries as ResponseTemplateQueries,
  types as ResponseTemplateTypes,
} from './responseTemplateTypeDefs';
import {
  mutations as ScriptMutations,
  queries as ScriptQueries,
  types as ScriptTypes,
} from './scriptTypeDefs';
import {
  mutations as SkillMutations,
  queries as SkillQueries,
  types as SkillTypes,
} from './skillTypeDefs';
import {
  mutations as widgetMutations,
  queries as widgetQueries,
  types as widgetTypes,
} from './widgetTypeDefs';

import gql from 'graphql-tag';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

const typeDefs = async () => {
  const isProductsEnabled = await isEnabled('products');
  const isTagsEnabled = await isEnabled('tags');
  const isFormsEnabled = await isEnabled('forms');
  const isKbEnabled = await isEnabled('knowledgebase');
  const isContactsEnabled = await isEnabled('contacts');
  const isDailycoEnabled = await isEnabled('dailyco');
  const isCallsEnabled = await isEnabled('calls');

  const isEnabledTable = {
    products: isProductsEnabled,
    tags: isTagsEnabled,
    forms: isFormsEnabled,
    knowledgeBase: isKbEnabled,
    contacts: isContactsEnabled,
    dailyco: isDailycoEnabled,
    calls: isCallsEnabled,
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
