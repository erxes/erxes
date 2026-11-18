import { type UseQueryResult, useQueries, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { orpc } from '@erxes/core-contract/client';
import { loadPlugin, parsePluginRemotes } from './remotes';
import type { LoadedPlugin } from './types';

const LOCAL_REMOTES = parsePluginRemotes();

// Module scope, so React Query keeps the combined result between renders.
const loadedPlugins = (results: UseQueryResult<LoadedPlugin | null>[]) => ({
  plugins: results.flatMap(({ data }) => (data ? [data] : [])),
  pending: results.some(({ isPending }) => isPending),
});

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
        data.flatMap(({ manifest, installation }) =>
          installation?.status === 'active' && manifest?.ui
            ? [{ name: manifest.ui.remote, entry: manifest.ui.entry }]
            : [],
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

  // Module Federation loading, not an API call: one query per remote, so each plugin's pages,
  // links and panels appear as soon as its own config arrives.
  const loaded = useQueries({
    queries: remotes.map((remote) => ({
      queryKey: ['plugin-ui', remote.name, remote.entry],
      queryFn: () => loadPlugin(remote, remotes),
      enabled: !registry.isPending,
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false,
    })),
    combine: loadedPlugins,
  });

  return { plugins: loaded.plugins, loading: registry.isPending || loaded.pending };
};
