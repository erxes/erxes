import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_FAVORITES } from '@/navigation/graphql/queries/getFavorites';
import { usePluginsModules } from '@/navigation/hooks/usePluginsModules';
import { useAtomValue } from 'jotai';
import { currentUserState, loadingPluginsConfigState } from 'ui-modules';

interface Favorite {
  _id: string;
  type: 'module' | 'submenu';
  path: string;
}

interface FavoriteModule {
  name: string;
  icon?: React.ElementType;
  path: string;
  favoriteName?: string | ((path: string) => string);
  favoriteNameComponent?: React.ComponentType<{
    path: string;
    fallbackName: string;
  }>;
  parentName?: string;
}

interface GetFavoritesResponse {
  getFavoritesByCurrentUser: Favorite[];
}

function matchesModulePath(
  urlPathWithQuery: string,
  modulePath: string,
): boolean {
  const urlPath = urlPathWithQuery.split('?')[0];

  if (urlPath === modulePath) return true;

  if (!modulePath.includes(':')) {
    return urlPath.startsWith(`${modulePath}/`);
  }

  const urlParts = urlPath.split('/');
  const modParts = modulePath.split('/');

  if (modParts.length > urlParts.length) return false;

  return modParts.every(
    (part, i) => part.startsWith(':') || part === urlParts[i],
  );
}

function toTitleCase(value: string): string {
  return value
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

function getFavoriteName(path: string, matchedModule: FavoriteModule): string {
  if (typeof matchedModule.favoriteName === 'function') {
    return matchedModule.favoriteName(path);
  }

  if (matchedModule.favoriteName) {
    return matchedModule.favoriteName;
  }

  return toTitleCase(matchedModule.name);
}

function disambiguateFavoriteNames(
  favorites: FavoriteModule[],
): FavoriteModule[] {
  const nameCounts = favorites.reduce((counts, favorite) => {
    counts.set(favorite.name, (counts.get(favorite.name) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());

  const parentNames = favorites.map((favorite) => {
    if (favorite.favoriteNameComponent) {
      return favorite;
    }

    if (
      (nameCounts.get(favorite.name) ?? 0) > 1 &&
      favorite.parentName &&
      favorite.parentName !== favorite.name &&
      !favorite.name.startsWith(`${favorite.parentName} /`)
    ) {
      return {
        ...favorite,
        name: `${favorite.parentName} / ${favorite.name}`,
      };
    }

    return favorite;
  });

  const finalCounts = parentNames.reduce((counts, favorite) => {
    counts.set(favorite.name, (counts.get(favorite.name) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());

  const seenNames = new Map<string, number>();

  return parentNames.map((favorite) => {
    if (
      favorite.favoriteNameComponent ||
      (finalCounts.get(favorite.name) ?? 0) < 2
    ) {
      return favorite;
    }

    const nextIndex = (seenNames.get(favorite.name) ?? 0) + 1;
    seenNames.set(favorite.name, nextIndex);

    return {
      ...favorite,
      name: `${favorite.name} ${nextIndex}`,
    };
  });
}

export function useFavorites(): FavoriteModule[] {
  const modules = usePluginsModules();
  const currentUser = useAtomValue(currentUserState);
  const pluginsLoading = useAtomValue(loadingPluginsConfigState);

  const { data } = useQuery<GetFavoritesResponse>(GET_FAVORITES, {
    skip: !currentUser?._id,
  });

  const favorites = data?.getFavoritesByCurrentUser ?? [];
  function getDynamicParamCount(path: string): number {
    return path.split('/').filter((p) => p.startsWith(':')).length;
  }

  const sortedModules = useMemo(() => {
    if (!modules) return [];

    return [...modules].sort((moduleA, moduleB) => {
      const aPartsCount = (moduleA.path || '').split('/').length;
      const bPartsCount = (moduleB.path || '').split('/').length;

      if (bPartsCount !== aPartsCount) return bPartsCount - aPartsCount;

      return (
        getDynamicParamCount(moduleA.path) - getDynamicParamCount(moduleB.path)
      );
    });
  }, [modules]);
  return useMemo(() => {
    if (pluginsLoading || !sortedModules.length) return [];

    const favoriteModules = favorites.flatMap((favorite) => {
      if (favorite.type !== 'module' && favorite.type !== 'submenu') return [];

      const normalizedPath = favorite.path.replace(/^\//, '');

      const matchedModule = sortedModules.find((m) =>
        matchesModulePath(normalizedPath, m.path),
      );

      if (!matchedModule) return [];

      return [
        {
          name: getFavoriteName(normalizedPath, matchedModule),
          icon: matchedModule.icon,
          favoriteNameComponent: matchedModule.favoriteNameComponent,
          parentName: toTitleCase(matchedModule.name),
          path: normalizedPath,
        },
      ];
    });

    return disambiguateFavoriteNames(favoriteModules);
  }, [favorites, sortedModules, pluginsLoading]);
}
