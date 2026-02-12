import { getPlugin, getPlugins } from 'erxes-api-shared/utils';

export const propertyQueries = {
  propertyTypes: async () => {
    const plugins = await getPlugins();
    const types = {};

    for (const pluginName of plugins) {
      const fieldTypes: Array<{ description: string; contentType: string }> =
        [];

      const plugin = await getPlugin(pluginName);

      if (!plugin) continue;

      const meta = plugin.config?.meta || {};

      if (meta?.properties) {
        const types = meta.properties.types || [];

        for (const type of types) {
          fieldTypes.push({
            description: type.description,
            contentType: `${pluginName}:${type.type}`,
          });
        }
      }

      if (fieldTypes.length > 0) {
        types[pluginName] = fieldTypes;
      }
    }

    return types;
  },
};
