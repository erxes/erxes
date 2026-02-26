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

function matchesModulePath(urlPath: string, modulePath: string): boolean {
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

    return [...modules].sort((a, b) => {
      const aPartsCount = a.path.split('/').length;
      const bPartsCount = b.path.split('/').length;

      if (bPartsCount !== aPartsCount) return bPartsCount - aPartsCount;

      return getDynamicParamCount(a.path) - getDynamicParamCount(b.path);
    });
  }, [modules]);
  return useMemo(() => {
    if (pluginsLoading || !sortedModules.length) return [];

    return favorites.flatMap((favorite) => {
      if (favorite.type !== 'module') return [];

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
