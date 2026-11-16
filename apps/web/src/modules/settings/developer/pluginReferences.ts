import { PLUGIN_API_AUDIENCES } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';

/**
 * The installed plugins that publish OpenAPI documents (the manifest's `api.docs`), each
 * with its documents in audience order, members' first: Settings › Developer › API
 * reference lists them.
 */
export const usePluginReferences = () =>
  useQuery(
    orpc.plugins.list.queryOptions({
      staleTime: Infinity,
      retry: false,
      select: ({ data }) =>
        data.flatMap(({ name, manifest, installation }) => {
          if (installation?.status !== 'active' || !manifest?.api?.docs?.length) return [];

          const apiUrl = manifest.api.url;

          const docs = manifest.api.docs
            .toSorted(
              (a, b) =>
                PLUGIN_API_AUDIENCES.indexOf(a.audience) - PLUGIN_API_AUDIENCES.indexOf(b.audience),
            )
            .map(({ audience, path }) => ({
              audience,
              source: { plugin: name, audience, apiUrl, path },
            }));

          return [{ name, title: manifest.title, docs }];
        }),
    }),
  );
