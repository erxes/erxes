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
  ${ConversationTypes}
  ${integrationTypes}
`;

export const queries = `
  ${ConversationQueries}
  ${IntegrationQueries}
`;

export const mutations = `
  ${ConversationMutations}
  ${IntegrationMutations}
`;
