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
  icon?: ElementType;
  submenus?: Array<{
    path: string;
    icon?: ElementType;
  }>;
};

type FavoriteIconProps = ComponentPropsWithoutRef<typeof IconComponent>;

function stripSearchAndHash(path: string) {
  const searchIndex = path.indexOf('?');
  const hashIndex = path.indexOf('#');

  if (searchIndex === -1 && hashIndex === -1) {
    return path;
  }

  if (searchIndex === -1) {
    return path.slice(0, hashIndex);
  }

  if (hashIndex === -1) {
    return path.slice(0, searchIndex);
  }

  return path.slice(0, Math.min(searchIndex, hashIndex));
}

function trimPathSlashes(path: string) {
  let start = 0;
  let end = path.length;

  while (start < end && path[start] === '/') {
    start += 1;
  }

  while (end > start && path[end - 1] === '/') {
    end -= 1;
  }

  return path.slice(start, end);
}

function normalizeNavigationPath(path: string) {
  return trimPathSlashes(stripSearchAndHash(path).replace('_ui', ''));
}

function addAllowedPath(
  paths: Map<string, ElementType | undefined>,
  path?: string,
  icon?: ElementType,
) {
  if (!path) {
    return;
  }

  const normalizedPath = normalizeNavigationPath(path);

  if (normalizedPath) {
    paths.set(normalizedPath, icon);
  }
}

function getAllowedFavoritePaths(modules?: AccessibleModule[]) {
  const paths = new Map<string, ElementType | undefined>();

  modules?.forEach((module) => {
    addAllowedPath(paths, module.path, module.icon);
    module.submenus?.forEach((submenu) =>
      addAllowedPath(paths, submenu.path, submenu.icon),
    );
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
    candidates.push(trimPathSlashes(normalizedPath.slice('settings'.length)));
  }

  return candidates;
}

function getAllowedFavoritePath(
  path: string,
  allowedPaths: Map<string, ElementType | undefined>,
) {
  const candidates = getFavoritePathCandidates(path);

  for (const candidate of candidates) {
    for (const allowedPath of allowedPaths.keys()) {
      const [candidateRoot] = candidate.split('/');

      const isAllowed =
        candidate === allowedPath ||
        candidate.startsWith(`${allowedPath}/`) ||
        (!!candidateRoot &&
          (allowedPath === candidateRoot ||
            allowedPath.endsWith(`/${candidateRoot}`)));

      if (isAllowed) {
        return allowedPath;
      }
    }
  }

  return undefined;
}

function resolveFavoriteIcon(icon?: string): ElementType | undefined {
  if (!icon) {
    return undefined;
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

  return favorites.reduce<FavoriteModule[]>((acc, favorite) => {
    const allowedPath = getAllowedFavoritePath(favorite.path, allowedPaths);

    if (!allowedPath) {
      return acc;
    }

    acc.push({
      name: favorite.breadcrumb?.join(' / ') || favorite.path,
      icon: resolveFavoriteIcon(favorite.icon) || allowedPaths.get(allowedPath) || IconStar,
      path: favorite.path,
    });

    return acc;
  }, []);
}
