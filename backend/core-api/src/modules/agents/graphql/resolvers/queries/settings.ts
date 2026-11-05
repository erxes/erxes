import type { IContext } from '~/connectionResolvers';
import type { IAgentsSettingsDocument } from '@/agents/@types/settings';

/**
 * Maps the settings document to the public GraphQL shape. The document
 * carries only non-sensitive feature flags, so the mapping is verbatim.
 */
export const toPublicSettings = (doc: IAgentsSettingsDocument) => ({
  codeModeEnabled: doc.codeModeEnabled,
  codeModeEnvironment: doc.codeModeEnvironment,
  // Fallback: docs written before approvalMode existed default to 'writes'.
  approvalMode: doc.approvalMode ?? 'writes',
  updatedAt: doc.updatedAt,
});

export const agentsSettingsQueries = {
  /**
   * Returns the tenant's settings. Readable by anyone who can view agents
   * (the flag shapes what every user's chat can do); changing it is gated
   * by `manageAgentsSettings` on the mutation.
   */
  agentsSettings: async (_p: undefined, _a: undefined, ctx: IContext) => {
    await ctx.checkPermission('showAgents');

    const doc = await ctx.models.AgentsSettings.getSettings();

    return toPublicSettings(doc);
  },
};
