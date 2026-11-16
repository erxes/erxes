import { PluginSearchResults } from '@erxes/core-contract/values';
import { orpc } from '@erxes/core-contract/client';
import { keepPreviousData, skipToken, useQueries, useQuery } from '@tanstack/react-query';
import { pluginJson } from 'erxes-ui';
import { useDebounce } from 'use-debounce';

/** Fewer characters match too much to be useful. */
const MIN_LENGTH = 2;

/** Hits per group, core's and each plugin's. */
const GROUP_SIZE = 5;

/** The installed plugins' search routes, from the manifests web already loaded. */
const usePluginSources = () =>
  useQuery(
    orpc.plugins.list.queryOptions({
      staleTime: Infinity,
      retry: false,
      select: ({ data }) =>
        data.flatMap(({ name, manifest, installation }) =>
          installation?.status === 'active'
            ? (manifest?.search ?? []).map((source) => ({ plugin: name, ...source }))
            : [],
        ),
    }),
  ).data ?? [];

/**
 * Core's matches and each plugin's, for the text typed (after a pause). Each
 * source loads and fails on its own, so a slow or broken plugin never hides
 * the rest.
 */
export const useGlobalSearch = (text: string) => {
  const [debounced] = useDebounce(text.trim(), 250);
  const q = debounced.length >= MIN_LENGTH ? debounced : '';
  const sources = usePluginSources();

  const core = useQuery(
    orpc.search.global.queryOptions({
      input: q ? { q, limit: GROUP_SIZE } : skipToken,
      placeholderData: keepPreviousData,
    }),
  );

  const plugins = useQueries({
    queries: sources.map((source) => ({
      queryKey: ['plugin-search', source.plugin, source.path, q],
      queryFn: q
        ? () =>
            pluginJson(
              source.plugin,
              `${source.path}?${new URLSearchParams({ q, limit: String(GROUP_SIZE) })}`,
              PluginSearchResults,
            )
        : skipToken,
      placeholderData: keepPreviousData,
      retry: false,
    })),
  });

  return {
    q,
    /** Still waiting for the pause after typing. */
    typing: text.trim() !== debounced,
    core,
    plugins: sources.flatMap((source, index) => {
      const query = plugins[index];

      return query ? [{ ...source, query }] : [];
    }),
  };
};
