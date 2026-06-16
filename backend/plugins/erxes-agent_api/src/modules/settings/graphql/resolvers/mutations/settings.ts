import { IContext } from '~/connectionResolvers';
import { IMastraSettings } from '@/settings/@types/settings';
import { isKnowledgeEnabled, knowledgeTenant } from '~/mastra/knowledge/config';
import { enqueueKnowledgeSweep } from '~/mastra/knowledge/worker';

/** Mutations for the plugin-wide Mastra settings document. */
export const settingsMutations = {
  mastraSettingsSave: (
    _parent: undefined,
    { doc }: { doc: IMastraSettings },
    { models }: IContext,
  ) => {
    return models.MastraSettings.saveSettings(doc);
  },

  /**
   * Force a Company Knowledge reindex now — AS the requesting user. Agent =
   * Person: the sweep reads company data with this user's permissions (the
   * same `user` header the chat/workflow paths use), never an unattended
   * service token. It runs in the background worker; the read-only status
   * block reflects the result on the next settings load.
   */
  mastraKnowledgeSync: async (
    _parent: undefined,
    _args: unknown,
    { subdomain, user }: IContext,
  ) => {
    if (!user?._id) {
      throw new Error('Login required');
    }
    if (!isKnowledgeEnabled()) {
      throw new Error('Company knowledge is not enabled on this deployment.');
    }
    const userHeader = Buffer.from(JSON.stringify(user)).toString('base64');
    await enqueueKnowledgeSweep({
      subdomain: knowledgeTenant(subdomain) ?? subdomain,
      auth: { userHeader },
    });
    return { ok: true, queued: true };
  },
};
