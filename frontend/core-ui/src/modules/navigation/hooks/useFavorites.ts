import { useQuery } from '@apollo/client';
import { GET_FAVORITES } from '@/navigation/graphql/queries/getFavorites';
import { usePluginsModules } from '@/navigation/hooks/usePluginsModules';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { IconComponent } from 'erxes-ui';

import {
  createElement,
  useMemo,
  type ComponentPropsWithoutRef,
  type ElementType,
} from 'react';
import { IconStar } from '@tabler/icons-react';

interface Favorite {
  _id: string;
  path: string;
  breadcrumb?: string[];
  icon?: string;
}

interface FavoriteModule {
  name: string;
  icon?: ElementType;
  path: string;
}

interface GetFavoritesResponse {
  getFavoritesByCurrentUser: Favorite[];
}

type AccessibleModule = {
  path: string;
  submenus?: Array<{
    path: string;
  }>;
};

type FavoriteIconProps = ComponentPropsWithoutRef<typeof IconComponent>;

function normalizeNavigationPath(path: string) {
  return path
    .split(/[?#]/)[0]
    .replace('_ui', '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}

function addAllowedPath(paths: Set<string>, path?: string) {
  if (!path) {
    return;
  }

  const normalizedPath = normalizeNavigationPath(path);

  if (normalizedPath) {
    paths.add(normalizedPath);
  }
}

function getAllowedFavoritePaths(modules?: AccessibleModule[]) {
  const paths = new Set<string>();

  modules?.forEach((module) => {
    addAllowedPath(paths, module.path);
    module.submenus?.forEach((submenu) => addAllowedPath(paths, submenu.path));
  });

  return paths;
}

function getFavoritePathCandidates(path: string) {
  const normalizedPath = normalizeNavigationPath(path);

  if (!normalizedPath) {
    return [];
  }

  const candidates = [normalizedPath];

  if (normalizedPath.startsWith('settings/')) {
    candidates.push(normalizedPath.replace(/^settings\/+/, ''));
  }

  return candidates;
}

function isAllowedFavoritePath(path: string, allowedPaths: Set<string>) {
  const candidates = getFavoritePathCandidates(path);

  return candidates.some((candidate) =>
    Array.from(allowedPaths).some((allowedPath) => {
      const [candidateRoot] = candidate.split('/');

      return (
        candidate === allowedPath ||
        candidate.startsWith(`${allowedPath}/`) ||
        (!!candidateRoot &&
          (allowedPath === candidateRoot ||
            allowedPath.endsWith(`/${candidateRoot}`)))
      );
    }),
  );
}

function resolveFavoriteIcon(icon?: string): ElementType {
  if (!icon) {
    return IconStar;
  }

  return function FavoriteIcon(props: FavoriteIconProps) {
    return createElement(IconComponent, { ...props, name: icon });
  };
}

export function useFavorites(): FavoriteModule[] {
  const currentUser = useAtomValue(currentUserState);
  const modules = usePluginsModules();

  const { data } = useQuery<GetFavoritesResponse>(GET_FAVORITES, {
    skip: !currentUser?._id,
  });

  const allowedPaths = useMemo(
    () => getAllowedFavoritePaths(modules),
    [modules],
  );
  const favorites = data?.getFavoritesByCurrentUser ?? [];

  return favorites
    .filter((favorite) => isAllowedFavoritePath(favorite.path, allowedPaths))
    .map((favorite) => ({
      name: favorite.breadcrumb?.join(' / ') || favorite.path,
      icon: resolveFavoriteIcon(favorite.icon),
      path: favorite.path,
    }));
}
