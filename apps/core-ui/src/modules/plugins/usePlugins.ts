import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { orpc } from '~/lib/api';
import { loadPlugins, parsePluginRemotes } from './remotes';

const LOCAL_REMOTES = parsePluginRemotes();

/**
 * Plugin UIs available to the signed-in member (loaded once per session): the
 * installed plugins' manifests (`GET /plugins`), plus `PUBLIC_PLUGINS` for
 * development (it wins for the same remote, so a local build can stand in
 * for a deployed one). Without the registry, the local ones still load.
 */
export const usePlugins = () => {
  const registry = useQuery(
    orpc.plugins.list.queryOptions({
      staleTime: Infinity,
      retry: false,
      select: ({ data }) =>
        data.flatMap((plugin) =>
          plugin.installed && plugin.ui ? [{ name: plugin.ui.remote, entry: plugin.ui.entry }] : [],
        ),
    }),
  );

  useEffect(() => {
    if (registry.error) console.error('[plugins] could not list installed plugins', registry.error);
  }, [registry.error]);

  const names = new Set(LOCAL_REMOTES.map((remote) => remote.name));

  const remotes = [
    ...LOCAL_REMOTES,
    ...(registry.data ?? []).filter((remote) => !names.has(remote.name)),
  ];

  // Module Federation loading, not an API call: keyed by the remotes it loads.
  const loaded = useQuery({
    queryKey: ['plugin-uis', remotes],
    queryFn: () => loadPlugins(remotes),
    enabled: !registry.isPending,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  return { plugins: loaded.data ?? [], loading: registry.isPending || loaded.isPending };
};
