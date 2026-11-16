import type { ApiKeyPlugins } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useCan } from '~/modules/auth/session';
import type { Giver } from './keyDraft';

/** An installed plugin a key may call, and whether the member's role can use it. */
export interface KeyPlugin {
  name: string;
  title: string;
  description: string | null;
  usable: boolean;
}

/** The installed plugins, with the ones the member may give a key; titles by name. */
export const useKeyPlugins = () => {
  const can = useCan();
  const list = useQuery(orpc.plugins.list.queryOptions());
  const catalog = useQuery(orpc.roles.permissions.queryOptions());

  return useMemo(() => {
    const actionsOf = (name: string) =>
      (catalog.data?.data ?? [])
        .filter((permission) => permission.source === name)
        .map((permission) => permission.action);

    const plugins: KeyPlugin[] = (list.data?.data ?? []).flatMap(
      ({ name, manifest, installation }) => {
        if (installation?.status !== 'active') return [];

        const actions = actionsOf(name);

        return [
          {
            name,
            title: manifest?.title ?? name,
            description: manifest?.description ?? null,
            usable: !actions.length || actions.some(can),
          },
        ];
      },
    );

    const titles = new Map(plugins.map((plugin) => [plugin.name, plugin.title]));

    return {
      plugins,
      usable: plugins.filter((plugin) => plugin.usable).map((plugin) => plugin.name),
      /** A key's plugins under their titles, for its sentence. */
      titled: (access: ApiKeyPlugins) =>
        Object.entries(access).map(([name, level]) => ({
          title: titles.get(name) ?? name,
          access: level,
        })),
      loading: list.isPending || catalog.isPending,
    };
  }, [list.data, list.isPending, catalog.data, catalog.isPending, can]);
};

/** What the signed-in member may give a key. */
export const useGiver = (): Giver => {
  const can = useCan();
  const { usable } = useKeyPlugins();

  return { can, plugins: usable };
};
