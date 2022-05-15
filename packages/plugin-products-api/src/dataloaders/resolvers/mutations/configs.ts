import { IContext } from '../../../connectionResolver';

const configMutations = {
  /**
   * Create or update config object
   */
  async productsConfigsUpdate(_root, { configsMap }, { models }: IContext) {
    const codes = Object.keys(configsMap);

    for (const code of codes) {
      if (!code) {
        continue;
      }

      const value = configsMap[code];
      const doc = { code, value };

      await models.ProductsConfigs.createOrUpdateConfig(doc);

      // resetConfigsCache();
    }

    return ['success'];
  }
};

// moduleCheckPermission(configMutations, 'manageGeneralSettings');
// requireLogin(configMutations, 'configsActivateInstallation');
// requireLogin(configMutations, 'configsManagePluginInstall');

export default configMutations;
