import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';

/**
 * The installed plugins that publish an OpenAPI document (the manifest's `api.openapi`):
 * Settings › Developer lists one reference per plugin.
 */
export const usePluginReferences = () =>
  useQuery(
    orpc.plugins.list.queryOptions({
      staleTime: Infinity,
      retry: false,
      select: ({ data }) =>
        data.flatMap(({ name, manifest, installation }) =>
          installation?.status === 'active' && manifest?.api?.openapi
            ? [
                {
                  name,
                  title: manifest.title,
                  source: { plugin: name, apiUrl: manifest.api.url, openapi: manifest.api.openapi },
                },
              ]
            : [],
        ),
    }),
  );
