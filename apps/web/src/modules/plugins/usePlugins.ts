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
 * The plugins in their order, each that extends another loaded one moved right after it (sales'
 * enterprise edition after sales), so its apps, settings and widgets follow that plugin's.
 */
const afterTheirHosts = (plugins: LoadedPlugin[]) => {
  const indexOf = new Map(plugins.map((plugin, index) => [plugin.remote, index]));

  const place = (plugin: LoadedPlugin, index: number) => {
    const host =
      plugin.extends === undefined || plugin.extends === plugin.remote
        ? undefined
        : indexOf.get(plugin.extends);

    return host === undefined ? index : host + 0.5;
  };

  return plugins
    .map((plugin, index) => ({ plugin, place: place(plugin, index) }))
    .toSorted((a, b) => a.place - b.place)
    .map(({ plugin }) => plugin);
};

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
        data.flatMap(({ name, manifest, installation }) =>
          installation?.status === 'active' && manifest?.ui
            ? [
                {
                  name: manifest.ui.remote,
                  entry: manifest.ui.entry,
                  plugin: name,
                  extends: manifest.extends,
                },
              ]
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

  // A local build of an installed plugin keeps its manifest's word on what it extends.
  const installed = registry.data ?? [];

  /** What an installed plugin extends: `core`, or the remote of the installed plugin it names. */
  const hostOf = (remote: string) => {
    const extended = installed.find((plugin) => plugin.name === remote)?.extends;

    if (extended === undefined || extended === 'core') return extended;

    return installed.find((plugin) => plugin.plugin === extended)?.name;
  };

  return {
    plugins: afterTheirHosts(
      loaded.plugins.map((plugin) => ({ ...plugin, extends: hostOf(plugin.remote) })),
    ),
    loading: registry.isPending || loaded.pending,
  };
};
