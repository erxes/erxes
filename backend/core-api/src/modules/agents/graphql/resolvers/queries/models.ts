import { ExpectedError } from 'erxes-api-shared/utils';
import type { IContext } from '~/connectionResolvers';
import type { IAgentsConnectionEntry } from '@/agents/@types/connection';
import {
  buildProviderModelCatalog,
  getDocumentedProviderModels,
  type IProviderModelEntry,
} from '@/agents/modelCatalog';
import { getModelDisplayName, getModelThinking } from '@/agents/modelThinking';
import {
  describeUnreadableKey,
  fetchProviderModels,
  MODEL_LIST_UNSUPPORTED,
} from '@/agents/providerModels';
import { PROVIDER_DEFAULTS } from '@/agents/providers';
import { openSecret } from '@/agents/secretBox';

const listProviderModels = async (connection: IAgentsConnectionEntry) => {
  const { provider } = connection;
  const stored = connection.config?.apiKey;
  const apiKey = openSecret(stored);
  const documented = getDocumentedProviderModels(provider);
  const toResult = (entries: IProviderModelEntry[], error: string | null) => {
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
      // Display name and thinking control come from the bundled models.dev
      // snapshot; null means unknown (raw id, original five levels).
      catalog: catalog.map((model) => ({
        ...model,
        name: getModelDisplayName(provider, model.id),
        thinking: getModelThinking(provider, model.id),
      })),
      error,
    };
  };

  if (!apiKey) {
    return toResult([], describeUnreadableKey(provider, stored));
  }

  try {
    const listed = await fetchProviderModels({ provider, apiKey });

    return toResult([...listed, ...documented], null);
  } catch (error: unknown) {
    // ExpectedError messages are written without secrets; anything else is
    // replaced so no upstream detail can leak. A provider without a listing
    // endpoint still offers its documented models without an error.
    const message =
      error instanceof ExpectedError
        ? error.message
        : `Could not list models for "${provider}".`;
    const unsupported =
      error instanceof ExpectedError && error.code === MODEL_LIST_UNSUPPORTED;

    return toResult(
      documented,
      unsupported && documented.length > 0 ? null : message,
    );
  }
};

/**
 * Lists the usable models of every provider the acting user has configured,
 * fetched server-side from each provider's /models endpoint with the stored
 * keys and filtered to chat models this agent can drive (`modelCatalog.ts`).
 * Providers that document a fixed model set have it merged in. `models` keeps
 * the flat id list for older clients; `catalog` adds family, recommendation,
 * display name and thinking metadata in ranked order. A provider whose key is unreadable
 * or whose listing fails is still returned, with a key-free `error` that says
 * why, so the chat picker can explain it and offer manual model entry.
 */
export const agentsModelsQueries = {
  agentsModels: async (_p: undefined, _a: undefined, ctx: IContext) => {
    await ctx.checkPermission('agentsChat');

    const doc = await ctx.models.AgentsConnection.getConnections(ctx.user._id);

    return Promise.all((doc?.connections ?? []).map(listProviderModels));
  },
};
