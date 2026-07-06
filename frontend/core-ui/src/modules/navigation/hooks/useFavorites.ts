import { useQuery } from '@apollo/client';
import { GET_FAVORITES } from '@/navigation/graphql/queries/getFavorites';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { IconComponent } from 'erxes-ui';

import {
  createElement,
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

type FavoriteIconProps = ComponentPropsWithoutRef<typeof IconComponent>;

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

  const { data } = useQuery<GetFavoritesResponse>(GET_FAVORITES, {
    skip: !currentUser?._id,
  });

  const favorites = data?.getFavoritesByCurrentUser ?? [];

  return favorites.map((favorite) => ({
    name: favorite.breadcrumb?.join(' / ') || favorite.path,
    icon: resolveFavoriteIcon(favorite.icon),
    path: favorite.path,
  }));
}
