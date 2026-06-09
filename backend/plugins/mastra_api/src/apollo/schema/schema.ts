import { types as agentTypes, queries as agentQueries, mutations as agentMutations } from '@/agent/graphql/schemas/agent';
import { types as toolTypes, queries as toolQueries, mutations as toolMutations } from '@/tool/graphql/schemas/tool';
import { types as providerTypes, queries as providerQueries, mutations as providerMutations } from '@/provider/graphql/schemas/provider';
import { types as settingsTypes, queries as settingsQueries, mutations as settingsMutations } from '@/settings/graphql/schemas/settings';

export const types = `
  ${agentTypes}
  ${toolTypes}
  ${providerTypes}
  ${settingsTypes}
`;

export const queries = `
  ${agentQueries}
  ${toolQueries}
  ${providerQueries}
  ${settingsQueries}
`;

export const mutations = `
  ${agentMutations}
  ${toolMutations}
  ${providerMutations}
  ${settingsMutations}
`;
