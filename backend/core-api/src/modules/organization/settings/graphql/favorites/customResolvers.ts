import { IFavoritesDocument } from '@/organization/settings/db/definitions/favorites';
import { resolveFavoritesBreadcrumbs } from '@/organization/settings/graphql/favorites/utils';
import { IContext } from '~/connectionResolvers';

type FavoriteWithBreadcrumb = IFavoritesDocument & {
  breadcrumb?: string[];
};

export const favoriteCustomResolvers = {
  Favorite: {
    breadcrumb: async (
      favorite: FavoriteWithBreadcrumb,
      _args: undefined,
      { subdomain }: IContext,
    ) => {
      if (favorite.breadcrumb?.length) {
        return favorite.breadcrumb;
      }

      const [resolvedFavorite] = await resolveFavoritesBreadcrumbs({
        favorites: [favorite],
        subdomain,
      });

      return resolvedFavorite.breadcrumb;
    },
  },
};
