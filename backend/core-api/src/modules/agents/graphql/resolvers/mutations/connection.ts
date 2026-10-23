import { ExpectedError } from 'erxes-api-shared/utils';
import type {
  IAiAgentConnection,
  IAiAgentConnectionConfig,
} from 'erxes-api-shared/core-modules';
import type { IContext } from '~/connectionResolvers';
import { getProviderDefaultModel } from '@/agents/providers';
import { isByokProvider } from '@/agents/providerModels';
import { toPublicConnection } from '@/agents/graphql/resolvers/queries/connection';

export interface IAgentsConnectionUpsertArgs {
  provider: string;
  model?: string;
  apiKey?: string;
}

export interface IAgentsConnectionRemoveArgs {
  provider: string;
}

export const agentsConnectionMutations = {
  /**
   * Adds or replaces ONE provider's entry in the acting user's BYOK
   * connections, opencode-style: pick a provider, paste an API key —
   * nothing else. Multiple providers can be configured side by side.
   * `apiKey` semantics:
   * - omitted/undefined keeps the stored key of that SAME provider — a
   *   different provider's entry always carries its own key, so a fresh
   *   provider without a key fails;
   * - an empty string clears that provider's stored key, any other value
   *   replaces it;
   * - the resulting entry must still carry a key or the mutation fails —
   *   the key itself is never returned;
   * `model` is optional so the settings form stays key-only: omitting it
   * always stores the CURRENT provider default, so re-saving (e.g. rotating
   * a key) refreshes an entry whose stored model predates a default change;
   * an explicit `model` overrides, and the chat's model picker may still
   * override per request without persisting.
   */
  agentsConnectionUpsert: async (
    _p: undefined,
    args: IAgentsConnectionUpsertArgs,
    ctx: IContext,
  ) => {
    await ctx.checkPermission('agentsChat');

    const userId = ctx.user._id;
    const provider = (args.provider || '').trim();

    if (!isByokProvider(provider)) {
      throw new ExpectedError(
        `Unsupported AI provider "${provider}".`,
        'VALIDATION_ERROR',
      );
    }

    const doc = await ctx.models.AgentsConnection.getConnections(userId);
    const stored = doc?.connections.find(
      (connection) => connection.provider === provider,
    );

    // Omitted model always stores the current provider default — never the
    // previously stored one — so a stale entry is refreshed on re-save.
    const model = (args.model || '').trim() || getProviderDefaultModel(provider);

    // Undefined keeps this provider's stored key; an empty string clears it.
    const apiKey =
      args.apiKey === undefined
        ? stored?.config?.apiKey
        : args.apiKey.trim() || undefined;

    const config: IAiAgentConnectionConfig = {};

    if (apiKey) {
      config.apiKey = apiKey;
    }

    if (!config.apiKey) {
      throw new ExpectedError('API key is required.', 'VALIDATION_ERROR');
    }

    // `provider` was validated against BYOK_PROVIDERS above; the cast
    // narrows the string to the connection union's literal provider types.
    const connection = {
      provider,
      model,
      config,
    } as IAiAgentConnection;

    const updated = await ctx.models.AgentsConnection.upsertConnection(
      userId,
      provider,
      connection,
    );

    const saved =
      updated.connections.find(
        (connection) => connection.provider === provider,
      ) ?? connection;

    return toPublicConnection(saved, updated.updatedAt);
  },

  /** Removes ONE provider's entry from the acting user's connections. */
  agentsConnectionRemove: async (
    _p: undefined,
    { provider }: IAgentsConnectionRemoveArgs,
    ctx: IContext,
  ) => {
    await ctx.checkPermission('agentsChat');

    await ctx.models.AgentsConnection.removeConnection(
      ctx.user._id,
      (provider || '').trim(),
    );

    return true;
  },
};
