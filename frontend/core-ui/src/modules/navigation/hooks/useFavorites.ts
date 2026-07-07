import { useQuery } from '@apollo/client';
import { IconStar } from '@tabler/icons-react';
import { GET_FAVORITES } from '@/navigation/graphql/queries/getFavorites';
import { usePluginsModules } from '@/navigation/hooks/usePluginsModules';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';

interface Favorite {
  _id: string;
  type: 'module' | 'submenu';
  path: string;
  label?: string | null;
}

interface FavoriteModule {
  _id: string;
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
    if (favorite.label) {
      acc.push({
        _id: favorite._id,
        name: favorite.label,
        icon: IconStar,
        path: favorite.path,
      });
      return acc;
    }

    if (favorite.type === 'module') {
      const module = modules?.find(
        (m) => m.path === favorite.path.replace('/', ''),
      );

      if (module) {
        acc.push({
          _id: favorite._id,
          name: module.name,
          icon: module.icon,
          path: module.path,
        });
      }
    }

    return acc;
  }, []);
}
