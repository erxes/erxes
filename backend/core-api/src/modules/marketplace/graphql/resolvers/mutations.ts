import { IContext } from '~/connectionResolvers';
import {
  fetchPluginManifest,
  fetchRegistryCatalog,
  IRegistryPlugin,
  registerPluginService,
  registryEntryToInstall,
  unregisterPluginService,
} from '~/modules/marketplace/registry';

export const marketplaceMutations = {
  async marketplacePluginInstall(
    _parent: undefined,
    { name, repoUrl }: { name?: string; repoUrl?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('marketplaceManage');

    if (!name && !repoUrl) {
      throw new Error('pluginInstall requires a name or a repoUrl');
    }

    let plugin: IRegistryPlugin | undefined;
    let source: 'catalog' | 'github' = 'catalog';

    if (repoUrl) {
      plugin = await fetchPluginManifest(repoUrl);
      source = 'github';

      if (name && name !== plugin.name) {
        throw new Error(
          `Plugin name mismatch: manifest declares "${plugin.name}"`,
        );
      }
    } else {
      const catalog = await fetchRegistryCatalog();

      plugin = catalog.find((p) => p.name === name);

      if (!plugin) {
        throw new Error(`Plugin "${name}" not found in the registry`);
      }
    }

    const install = await models.PluginInstalls.install(
      registryEntryToInstall(plugin, source, repoUrl),
    );

    await registerPluginService(plugin);

    return install;
  },

  async marketplacePluginSetEnabled(
    _parent: undefined,
    { _id, enabled }: { _id: string; enabled: boolean },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('marketplaceManage');

    const install = await models.PluginInstalls.setEnabled(_id, enabled);

    if (!install) {
      throw new Error('Plugin install not found');
    }

    if (enabled) {
      await registerPluginService(install);
    } else {
      await unregisterPluginService(install.name);
    }

    return install;
  },

  async marketplacePluginUninstall(
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('marketplaceManage');

    const install = await models.PluginInstalls.getInstall(_id);

    await models.PluginInstalls.uninstall(_id);
    await unregisterPluginService(install.name);

    return { removed: true, name: install.name };
  },
};
