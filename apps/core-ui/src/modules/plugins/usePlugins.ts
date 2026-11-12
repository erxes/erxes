import { useQuery } from '@tanstack/react-query';
import { api } from '~/lib/api';
import { loadPlugins, parsePluginRemotes, type PluginRemote } from './remotes';

/**
 * Plugin UIs to load: the installed plugins' manifests (`GET /plugins`), plus
 * `PUBLIC_PLUGINS` for development (it wins for the same remote, so a local
 * build can stand in for a deployed one).
 */
const pluginRemotes = async (): Promise<PluginRemote[]> => {
  const registered = await api.plugins
    .list()
    .then(({ data }) =>
      data.flatMap((plugin) =>
        plugin.installed && plugin.ui ? [{ name: plugin.ui.remote, entry: plugin.ui.entry }] : [],
      ),
    )
    .catch(() => [] as PluginRemote[]);

  const local = parsePluginRemotes();
  const names = new Set(local.map((remote) => remote.name));

  return [...local, ...registered.filter((remote) => !names.has(remote.name))];
};

/** Plugin UIs available to the signed-in member (loaded once per session). */
export const usePlugins = () => {
  const query = useQuery({
    queryKey: ['plugins'],
    queryFn: async () => loadPlugins(await pluginRemotes()),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  return { plugins: query.data ?? [], loading: query.isPending };
};
