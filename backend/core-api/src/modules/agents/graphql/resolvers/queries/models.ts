import { ExpectedError } from 'erxes-api-shared/utils';
import type { IContext } from '~/connectionResolvers';
import { buildProviderModelCatalog } from '@/agents/modelCatalog';
import { fetchProviderModels } from '@/agents/providerModels';
import { PROVIDER_DEFAULTS } from '@/agents/providers';
import { openSecret } from '@/agents/secretBox';

/**
 * Lists the usable models of every provider the acting user has configured,
 * fetched server-side from each provider's /models endpoint with the stored
 * keys and filtered to chat models this agent can drive (`modelCatalog.ts`).
 * `models` keeps the flat id list for older clients; `catalog` adds family
 * and recommendation metadata in ranked order. A provider whose endpoint
 * fails (bad key, outage) is returned with an empty list and a key-free
 * `error` instead of failing the whole query, so the chat picker still offers
 * the remaining providers and can explain the missing one.
 */
export const agentsModelsQueries = {
  agentsModels: async (_p: undefined, _a: undefined, ctx: IContext) => {
    await ctx.checkPermission('agentsChat');

    const doc = await ctx.models.AgentsConnection.getConnections(ctx.user._id);

    return Promise.all(
      (doc?.connections ?? []).flatMap((connection) => {
        const apiKey = openSecret(connection.config?.apiKey);

        if (!apiKey) {
          return [];
        }

        const { provider } = connection;

        return [
          fetchProviderModels({ provider, apiKey })
            .then((entries) => {
              const catalog = buildProviderModelCatalog({
                provider,
                entries,
                preferred: [
                  connection.model?.trim() ?? '',
                  PROVIDER_DEFAULTS[provider]?.model ?? '',
                ],
              });

              return {
                provider,
                models: catalog.map((model) => model.id),
                catalog,
                error: null,
              };
            })
            .catch((error: unknown) => ({
              provider,
              models: [],
              catalog: [],
              // ExpectedError messages are written without secrets; anything
              // else is replaced so no upstream detail can leak.
              error:
                error instanceof ExpectedError
                  ? error.message
                  : `Could not list models for "${provider}".`,
            })),
        ];
      }),
    );
  },
};
