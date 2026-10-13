import { types as ConversationTypes } from '@/inbox/graphql/schemas/conversationTypes';
import {
  mutations as ConversationMutations,
  queries as ConversationQueries,
} from '@/inbox/graphql/schemas/conversation';
import {
  mutations as IntegrationMutations,
  queries as IntegrationQueries,
  types as integrationTypes,
} from '@/inbox/graphql/schemas/integration';
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
