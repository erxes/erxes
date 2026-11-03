import fetch from 'node-fetch';
import { getCoreDomain, resetConfigsCache } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const organizationConfigMutations = {
  /**
   * Create or update config object
   */
  async configsUpdate(
    _parent: undefined,
    { configsMap }: { configsMap: Record<string, string> },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('configsManage');

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

    return true;
  },

  async configsActivateInstallation(
    _parent: undefined,
    args: { token: string; hostname: string },
    { checkPermission }: IContext,
  ) {
    await checkPermission('configsManage');

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
