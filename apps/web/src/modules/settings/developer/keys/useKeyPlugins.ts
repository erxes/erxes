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
  /** Its actions, as the roles page names them. */
  actions: { action: string; label: string }[];
}

/** The installed plugins, with the ones the member may give a key; titles and action labels. */
export const useKeyPlugins = () => {
  const can = useCan();
  const list = useQuery(orpc.plugins.list.queryOptions());
  const catalog = useQuery(orpc.roles.permissions.queryOptions());

  return useMemo(() => {
    const permissions = catalog.data?.data ?? [];
    const labels = new Map(permissions.map(({ action, label }) => [action, label]));

    const actionsOf = (name: string) =>
      permissions
        .filter((permission) => permission.source === name)
        .map(({ action, label }) => ({ action, label }));

    const plugins: KeyPlugin[] = (list.data?.data ?? []).flatMap(
      ({ name, manifest, installation }) => {
        if (installation?.status !== 'active') return [];

        const actions = actionsOf(name);

        return [
          {
            name,
            title: manifest?.title ?? name,
            description: manifest?.description ?? null,
            usable: !actions.length || actions.some(({ action }) => can(action)),
            actions,
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
          name,
          title: titles.get(name) ?? name,
          access: level,
        })),
      /** An action as the roles page names it. */
      labelOf: (action: string) => labels.get(action) ?? action,
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
