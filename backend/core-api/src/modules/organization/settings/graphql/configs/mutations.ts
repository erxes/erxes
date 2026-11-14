import fetch from 'node-fetch';
import {
  getCoreDomain,
  redis,
  resetConfigsCache,
  USER_ACTIVITY_TRACKING_CONFIG,
  userActivityTrackingKey,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const organizationConfigMutations = {
  /**
   * Create or update config object
   */
  async configsUpdate(
    _parent: undefined,
    { configsMap }: { configsMap: Record<string, string> },
    { models, subdomain }: IContext,
  ) {
    const codes = Object.keys(configsMap);

    for (const code of codes) {
      if (!code) {
        continue;
      }

      const value = configsMap[code];
      const doc = { code, value };

      await models.Configs.createOrUpdateConfig(doc);
    }

    await resetConfigsCache();

    // Gateway cannot read configs, so it checks this marker before recording
    if (USER_ACTIVITY_TRACKING_CONFIG in configsMap) {
      const enabled =
        String(configsMap[USER_ACTIVITY_TRACKING_CONFIG]) === 'true';
      const key = userActivityTrackingKey(subdomain);

      await (enabled ? redis.set(key, '1') : redis.del(key));
    }

    return true;
  },

  async configsActivateInstallation(
    _parent: undefined,
    args: { token: string; hostname: string },
  ) {
    try {
      return await fetch(`${getCoreDomain()}/activate-installation`, {
        method: 'POST',
        body: JSON.stringify(args),
        headers: { 'Content-Type': 'application/json' },
      }).then((res) => res.json());
    } catch (e) {
      throw new Error(e.message);
    }
  },
};
