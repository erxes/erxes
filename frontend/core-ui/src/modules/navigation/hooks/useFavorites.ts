import { useQuery } from '@apollo/client';
import { GET_FAVORITES } from '@/navigation/graphql/queries/getFavorites';
import { usePluginsModules } from '@/navigation/hooks/usePluginsModules';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';

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

export function useFavorites(): FavoriteModule[] {
  const modules = usePluginsModules();
  const currentUser = useAtomValue(currentUserState);

  const { data } = useQuery<GetFavoritesResponse>(GET_FAVORITES, {
    skip: !currentUser?._id,
  });
  const favorites = data?.getFavoritesByCurrentUser ?? [];

  return favorites.reduce<FavoriteModule[]>((acc, favorite) => {
    if (favorite.type === 'module') {
      const module = modules?.find(
        (m) => m.path === favorite.path.replace('/', ''),
      );

      if (module) {
        acc.push({
          name: module.name,
          icon: module.icon,
          path: module.path,
        });
      }
    }

    return acc;
  }, []);
}
