import {
  mutations as ChannelMutations,
  queries as ChannelQueries,
  types as ChannelTypes,
} from './channel';

import {
  mutations as ConversationMutations,
  queries as ConversationQueries,
  types as ConversationTypes,
} from './conversation';
import {
  mutations as IntegrationMutations,
  queries as IntegrationQueries,
  types as integrationTypes,
} from './integration';
export const types = `
  ${ChannelTypes},
  ${ConversationTypes}
  ${integrationTypes}
`;

export const queries = `
  ${ChannelQueries}
  ${ConversationQueries}
  ${IntegrationQueries}
`;

export const mutations = `
  ${ChannelMutations}
  ${ConversationMutations}
  ${IntegrationMutations}
`;
