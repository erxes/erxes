import type { IContext } from '~/connectionResolvers';
import { listGraphqlCapabilities } from '@/agents/graphqlTools';
import { requiresGraphqlApproval } from '@/agents/graphqlPolicy';

/** Schema discovery is informational; the gateway authorizes every execution. */
export const agentsToolsQueries = {
  agentsTools: async (_parent: undefined, _args: unknown, ctx: IContext) => {
    await ctx.checkPermission('showAgents');
    const [entries, settings] = await Promise.all([
      listGraphqlCapabilities(),
      ctx.models.AgentsSettings.getSettings(),
    ]);
    return {
      tools: entries.map((entry) => ({
        ...entry,
        requiresApproval: requiresGraphqlApproval(
          {
            operation: entry.method,
            rootFields: [entry.path],
          },
          settings.approvalMode,
        ),
      })),
      unavailablePlugins: [],
    };
  },
};
