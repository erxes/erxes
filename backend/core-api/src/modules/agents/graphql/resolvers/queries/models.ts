import type { IContext } from '~/connectionResolvers';
import { fetchProviderModels } from '@/agents/providerModels';
import { openSecret } from '@/agents/secretBox';

/**
 * Lists the model ids of every provider the acting user has configured,
 * fetched server-side from each provider's /models endpoint with the stored
 * keys. A provider whose endpoint fails (bad key, outage) is simply left
 * out of the result instead of failing the whole query — the chat picker
 * still offers the remaining providers.
 */
export const agentsModelsQueries = {
  agentsModels: async (_p: undefined, _a: undefined, ctx: IContext) => {
    await ctx.checkPermission('agentsChat');

    const doc = await ctx.models.AgentsConnection.getConnections(
      ctx.user._id,
    );

    const configured = (doc?.connections ?? []).filter(
      (connection) => openSecret(connection.config?.apiKey) !== null,
    );

    const settled = await Promise.all(
      configured.map(async (connection) => {
        const apiKey = openSecret(connection.config?.apiKey);

        if (!apiKey) {
          return null;
        }

        try {
          return {
            provider: connection.provider,
            models: await fetchProviderModels({
              provider: connection.provider,
              apiKey,
            }),
          };
        } catch {
          return null;
        }
      }),
    );

    return settled.filter((entry) => entry !== null);
  },
};
