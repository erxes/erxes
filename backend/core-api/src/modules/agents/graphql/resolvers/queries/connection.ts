import type { IContext, IModels } from '~/connectionResolvers';
import { openSecret } from '@/agents/secretBox';
import {
  AGENTS_ORGANIZATION_OWNER_ID,
  type AgentsConnectionScope,
  type IAgentsConnectionEntry,
  type IAgentsConnections,
} from '@/agents/@types/connection';
import {
  findDefaultConnection,
  toEffectiveConnections,
} from '@/agents/db/models/Connection';
import { getBuiltinStatus } from '@/agents/builtin';

/**
 * Maps one stored connection entry to the public GraphQL shape. The API key
 * never leaves the database: callers only see whether one is stored.
 */
export const toPublicConnection = (
  connection: IAgentsConnectionEntry,
  updatedAt?: Date,
  isDefault = false,
  scope: AgentsConnectionScope = 'private',
) => ({
  provider: connection.provider,
  model: connection.model,
  scope,
  isDefault,
  // hasKey reflects decryptability — a sealed value that can no longer be
  // opened (e.g. rotated JWT secret) reads as "no key" so the UI asks the
  // user to re-enter it.
  hasKey: openSecret(connection.config?.apiKey) !== null,
  updatedAt,
});

/** Every saved entry in stored order, with the effective default marked. */
export const toPublicConnections = (
  doc: (Pick<IAgentsConnections, 'connections' | 'defaultProvider'> & {
    updatedAt?: Date;
  }) | null,
  scope: AgentsConnectionScope = 'private',
  defaultConnection:
    | { provider?: string; scope: AgentsConnectionScope }
    | undefined = { provider: findDefaultConnection(doc)?.provider, scope },
) =>
  (doc?.connections ?? []).map((connection) =>
    toPublicConnection(
      connection,
      doc?.updatedAt,
      connection.provider === defaultConnection?.provider &&
        scope === defaultConnection?.scope,
      scope,
    ),
  );

export const toPublicConnectionList = (
  own: Parameters<typeof toPublicConnections>[0],
  organization: Parameters<typeof toPublicConnections>[0],
) => {
  const effective = toEffectiveConnections(own, organization);
  const defaultConnection = findDefaultConnection(effective);

  return [
    ...toPublicConnections(own, 'private', defaultConnection),
    ...toPublicConnections(organization, 'organization', defaultConnection),
  ];
};

export const listPublicConnections = async (
  models: IModels,
  userId: string,
) => {
  const [own, organization] = await Promise.all([
    models.AgentsConnection.getConnections(userId),
    models.AgentsConnection.getConnections(AGENTS_ORGANIZATION_OWNER_ID),
  ]);

  return toPublicConnectionList(own, organization);
};

export const agentsConnectionsQueries = {
  /**
   * Returns the acting user's private connections and the organization's
   * shared ones (masked), one entry per provider and scope. The private
   * lookup is keyed by the acting user id from the gateway identity, never
   * by an argument.
   */
  agentsConnections: async (_p: undefined, _a: undefined, ctx: IContext) => {
    await ctx.checkPermission('agentsChat');

    return listPublicConnections(ctx.models, ctx.user._id);
  },

  agentsBuiltin: async (_p: undefined, _a: undefined, ctx: IContext) => {
    await ctx.checkPermission('agentsChat');

    return getBuiltinStatus(ctx.models);
  },
};
