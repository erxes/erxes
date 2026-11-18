import { useQuery } from '@tanstack/react-query';
import { orpc } from '@erxes/core-contract/client';
import { usePluginText } from '~/modules/plugins/pluginText';

/** The plugins installed here, which a product can be used by, with their titles in the member's language. */
export const useInstalledPlugins = () => {
  // The same request (and cache entry) the plugin loader makes.
  const query = useQuery(orpc.plugins.list.queryOptions({ staleTime: Infinity, retry: false }));
  const text = usePluginText();

  const plugins = (query.data?.data ?? [])
    .filter((plugin) => plugin.installation?.status === 'active')
    .map(({ name, manifest }) => ({ name, title: text(name, manifest?.title ?? name) }));

  return { plugins, error: query.error };
};

/** A plugin's title, or its name when it isn't installed (any more). */
export const pluginTitle = (plugins: { name: string; title: string }[], name: string) =>
  plugins.find((plugin) => plugin.name === name)?.title ?? name;
