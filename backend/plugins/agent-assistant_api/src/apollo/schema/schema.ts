import {
  mutations as AgentAssistantMutations,
  queries as AgentAssistantQueries,
  types as AgentAssistantTypes,
  inputs as AgentAssistantInputs,
} from '@/agent-assistant/graphql/schemas/agent-assistant';

export const types = `
  ${AgentAssistantTypes}
  ${AgentAssistantInputs}
`;

export const queries = `
  ${AgentAssistantQueries}
`;

export const mutations = `
  ${AgentAssistantMutations}
`;

export default { types, queries, mutations };
