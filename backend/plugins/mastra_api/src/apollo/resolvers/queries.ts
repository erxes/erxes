import { agentQueries } from '@/agent/graphql/resolvers/queries/agent';
import { toolQueries } from '@/tool/graphql/resolvers/queries/tool';
import { providerQueries } from '@/provider/graphql/resolvers/queries/provider';
import { settingsQueries } from '@/settings/graphql/resolvers/queries/settings';
import { sessionQueries } from '@/session/graphql/resolvers/queries/session';

export const queries = {
  ...agentQueries,
  ...toolQueries,
  ...providerQueries,
  ...settingsQueries,
  ...sessionQueries,
};
