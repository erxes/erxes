import { IContactFieldsMeta } from 'erxes-api-shared/core-modules';
import { getPlugin, getPlugins } from 'erxes-api-shared/utils';

/**
 * The enabled plugins whose records keep their contact as `customerId` /
 * `companyId`: those declaring `meta.contactFields`. Nothing is listed in
 * core; a plugin opts in by declaring it.
 */
export const getContactFieldPlugins = async (): Promise<string[]> => {
  const pluginNames = await getPlugins();
  const declared = await Promise.all(
    pluginNames.map(async (pluginName) => {
      const meta: IContactFieldsMeta | undefined = (await getPlugin(pluginName))
        .config?.meta?.contactFields;

      return meta?.contentTypes?.length ? pluginName : null;
    }),
  );

  return declared.filter((pluginName): pluginName is string => !!pluginName);
};
