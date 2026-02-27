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

    return favorites.flatMap((favorite) => {
      if (favorite.type !== 'module' && favorite.type !== 'submenu') return [];

      const normalizedPath = favorite.path.replace(/^\//, '');

      const matchedModule = sortedModules.find((m) =>
        matchesModulePath(normalizedPath, m.path),
      );

      if (!matchedModule) return [];

      return [
        {
          name: matchedModule.name,
          icon: matchedModule.icon,
          path: normalizedPath,
        },
      ];
    });
  }, [favorites, sortedModules, pluginsLoading]);
}
