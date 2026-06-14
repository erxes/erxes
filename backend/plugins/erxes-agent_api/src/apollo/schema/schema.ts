import {
  types as agentTypes,
  queries as agentQueries,
  mutations as agentMutations,
} from '@/agent/graphql/schemas/agent';
import {
  types as toolTypes,
  queries as toolQueries,
  mutations as toolMutations,
} from '@/tool/graphql/schemas/tool';
import {
  types as providerTypes,
  queries as providerQueries,
  mutations as providerMutations,
} from '@/provider/graphql/schemas/provider';
import {
  types as settingsTypes,
  queries as settingsQueries,
  mutations as settingsMutations,
} from '@/settings/graphql/schemas/settings';
import {
  types as sessionTypes,
  queries as sessionQueries,
  mutations as sessionMutations,
} from '@/session/graphql/schemas/session';
import {
  types as workflowTypes,
  queries as workflowQueries,
  mutations as workflowMutations,
} from '@/workflow/graphql/schemas/workflow';
import {
  types as learningTypes,
  queries as learningQueries,
  mutations as learningMutations,
} from '@/learning/graphql/schemas/learning';
import {
  types as scheduleTypes,
  queries as scheduleQueries,
  mutations as scheduleMutations,
} from '@/schedule/graphql/schemas/schedule';

export const types = `
  ${agentTypes}
  ${toolTypes}
  ${providerTypes}
  ${settingsTypes}
  ${sessionTypes}
  ${workflowTypes}
  ${learningTypes}
  ${scheduleTypes}
`;

export const queries = `
  ${agentQueries}
  ${toolQueries}
  ${providerQueries}
  ${settingsQueries}
  ${sessionQueries}
  ${workflowQueries}
  ${learningQueries}
  ${scheduleQueries}
`;

export const mutations = `
  ${agentMutations}
  ${toolMutations}
  ${providerMutations}
  ${settingsMutations}
  ${sessionMutations}
  ${workflowMutations}
  ${learningMutations}
  ${scheduleMutations}
`;
