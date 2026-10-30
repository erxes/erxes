import { ExpectedError } from 'erxes-api-shared/utils';
import type {
  IAiAgentConnection,
  IAiAgentConnectionConfig,
} from 'erxes-api-shared/core-modules';
import type { IContext } from '~/connectionResolvers';
import {
  AGENTS_CONNECTION_SCOPES,
  AGENTS_ORGANIZATION_OWNER_ID,
  type AgentsConnectionScope,
} from '@/agents/@types/connection';
import { getProviderDefaultModel } from '@/agents/providers';
import { isByokProvider } from '@/agents/providerModels';
import { probeProviderModel } from '@/agents/modelProbe';
import {
  listPublicConnections,
  toPublicConnection,
  toPublicConnectionList,
} from '@/agents/graphql/resolvers/queries/connection';

export interface IAgentsConnectionUpsertArgs {
  provider: string;
  model?: string;
  apiKey?: string;
  scope?: string | null;
}

export interface IAgentsConnectionRemoveArgs {
  provider: string;
  scope?: string | null;
}

export interface IAgentsModelVerifyArgs {
  provider: string;
  model: string;
}

export interface IAgentsConnectionSetDefaultArgs {
  /** Empty or omitted clears the explicit default (first saved applies). */
  provider?: string | null;
  scope?: string | null;
}

const resolveConnectionOwner = async (
  ctx: IContext,
  rawScope?: string | null,
): Promise<{ ownerId: string; scope: AgentsConnectionScope }> => {
  const scope = (rawScope || 'private').trim();

  if (!(AGENTS_CONNECTION_SCOPES as readonly string[]).includes(scope)) {
    throw new ExpectedError(
      `Unsupported connection scope "${scope}".`,
      'VALIDATION_ERROR',
    );
  }

  if (scope === 'organization') {
    await ctx.checkPermission('manageAgentsSettings');

    return { ownerId: AGENTS_ORGANIZATION_OWNER_ID, scope };
  }

  return { ownerId: ctx.user._id, scope: 'private' };
};

const noStoredConnection = (provider: string) =>
  new ExpectedError(
    `No connection stored for provider "${provider}". Add it under Settings → API key.`,
    'VALIDATION_ERROR',
  );

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

    const { ownerId, scope } = await resolveConnectionOwner(ctx, args.scope);
    const provider = (args.provider || '').trim();

    if (!isByokProvider(provider)) {
      throw new ExpectedError(
        `Unsupported AI provider "${provider}".`,
        'VALIDATION_ERROR',
      );
    }

    const doc = await ctx.models.AgentsConnection.getConnections(ownerId);
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
      ownerId,
      provider,
      connection,
    );

    const saved =
      updated.connections.find(
        (connection) => connection.provider === provider,
      ) ?? connection;

    const listed = await listPublicConnections(ctx.models, ctx.user._id);

    return (
      listed.find(
        (entry) => entry.provider === provider && entry.scope === scope,
      ) ?? toPublicConnection(saved, updated.updatedAt, false, scope)
    );
  },

  /** Removes ONE provider's entry from the acting user's connections. */
  agentsConnectionRemove: async (
    _p: undefined,
    { provider, scope: rawScope }: IAgentsConnectionRemoveArgs,
    ctx: IContext,
  ) => {
    await ctx.checkPermission('agentsChat');

    const { ownerId } = await resolveConnectionOwner(ctx, rawScope);

    await ctx.models.AgentsConnection.removeConnection(
      ownerId,
      (provider || '').trim(),
    );

    return true;
  },

  /**
   * Chooses which of the acting user's saved providers an unselected chat
   * turn runs on; an empty provider clears the choice so the first saved
   * entry applies again. Only the user's own document is touched, and the
   * provider must already be saved there.
   */
  agentsConnectionSetDefault: async (
    _p: undefined,
    args: IAgentsConnectionSetDefaultArgs,
    ctx: IContext,
  ) => {
    await ctx.checkPermission('agentsChat');

    const { ownerId, scope } = await resolveConnectionOwner(ctx, args.scope);
    const provider = (args.provider || '').trim();
    const doc = await ctx.models.AgentsConnection.setDefaultProvider(
      ownerId,
      provider,
    );

    if (!doc && provider) {
      throw noStoredConnection(provider);
    }

    const other = await ctx.models.AgentsConnection.getConnections(
      scope === 'organization' ? ctx.user._id : AGENTS_ORGANIZATION_OWNER_ID,
    );

    return scope === 'organization'
      ? toPublicConnectionList(other, doc)
      : toPublicConnectionList(doc, other);
  },

  /**
   * Checks that a typed model id works for one of the acting user's saved
   * connections with a minimal request through the chat's own provider
   * client, so a key that cannot list models can still use every model it
   * is allowed to call. Nothing is persisted; the error is key-free.
   */
  agentsModelVerify: async (
    _p: undefined,
    args: IAgentsModelVerifyArgs,
    ctx: IContext,
  ) => {
    await ctx.checkPermission('agentsChat');

    const provider = (args.provider || '').trim();
    const model = (args.model || '').trim();
    const doc = await ctx.models.AgentsConnection.getEffectiveConnections(
      ctx.user._id,
    );
    const connection = doc.connections.find(
      (entry) => entry.provider === provider,
    );

    if (!connection) {
      throw noStoredConnection(provider);
    }

    return {
      provider,
      model,
      ...(await probeProviderModel({ connection, model })),
    };
  },
};
