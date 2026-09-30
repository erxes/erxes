import { IContext } from '~/connectionResolvers';
import {
  fetchRegistryCatalog,
  IRegistryPlugin,
  isGithubInstallEnabled,
} from '~/modules/marketplace/registry';
import { IPluginInstallDocument } from '~/modules/marketplace/db/models/PluginInstalls';

const toMarketplacePlugin = (
  plugin: IRegistryPlugin,
  installs: IPluginInstallDocument[],
) => {
  const install = installs.find((i) => i.name === plugin.name);

  return {
    name: plugin.name,
    version: install?.version || plugin.version,
    description: install?.description || plugin.description,
    icon: install?.icon || plugin.icon,
    api: install?.api || plugin.api,
    ui: install?.ui || plugin.ui,
    installed: !!install,
    enabled: install?.enabled ?? false,
  };
};

export const marketplaceQueries = {
  async marketplacePlugins(
    _parent: undefined,
    _args: Record<string, never>,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('marketplaceRead');

    const installs = await models.PluginInstalls.find({}).lean();

    try {
      const catalog = await fetchRegistryCatalog();

      const installedOnly = installs
        .filter(
          (install) => !catalog.some((p) => p.name === install.name),
        )
        .map((install) =>
          toMarketplacePlugin({ name: install.name }, installs),
        );

      return [
        ...catalog.map((plugin) => toMarketplacePlugin(plugin, installs)),
        ...installedOnly,
      ];
    } catch {
      // Registry unreachable: still surface locally installed plugins.
      return installs.map((install) =>
        toMarketplacePlugin({ name: install.name }, installs),
      );
    }
  },

  async marketplaceCatalogError(
    _parent: undefined,
    _args: Record<string, never>,
    { checkPermission }: IContext,
  ) {
    await checkPermission('marketplaceRead');

    try {
      await fetchRegistryCatalog();
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  },

  async marketplaceInstalledPlugins(
    _parent: undefined,
    _args: Record<string, never>,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('marketplaceRead');

    return models.PluginInstalls.find({}).lean();
  },

  async marketplaceGithubInstallEnabled(
    _parent: undefined,
    _args: Record<string, never>,
    { checkPermission }: IContext,
  ) {
    await checkPermission('marketplaceRead');

    return isGithubInstallEnabled();
  },
};
