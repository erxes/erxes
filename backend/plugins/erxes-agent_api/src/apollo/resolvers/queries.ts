import { agentQueries } from '@/agent/graphql/resolvers/queries/agent';
import { toolQueries } from '@/tool/graphql/resolvers/queries/tool';
import { providerQueries } from '@/provider/graphql/resolvers/queries/provider';
import { settingsQueries } from '@/settings/graphql/resolvers/queries/settings';
import { sessionQueries } from '@/session/graphql/resolvers/queries/session';
import { workflowQueries } from '@/workflow/graphql/resolvers/queries/workflow';
import { learningQueries } from '@/learning/graphql/resolvers/queries/learning';
import { scheduleQueries } from '@/schedule/graphql/resolvers/queries/schedule';

export const queries = {
  ...agentQueries,
  ...toolQueries,
  ...providerQueries,
  ...settingsQueries,
  ...sessionQueries,
  ...workflowQueries,
  ...learningQueries,
  ...scheduleQueries,
};
