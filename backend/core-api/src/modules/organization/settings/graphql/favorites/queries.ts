import { IContext } from '~/connectionResolvers';
import { IFavorites } from '@/organization/settings/db/definitions/favorites';
import {
  normalizeFavoritePath,
  resolveFavoritesBreadcrumbs,
} from '@/organization/settings/graphql/favorites/utils';

export const favoriteQueries = {
  getFavoritesByCurrentUser: async (
    _parent: undefined,
    _args: undefined,
    { models, user, subdomain }: IContext,
  ) => {
    const favorites = await models.Favorites.getFavoritesByCurrentUser({
      userId: user._id,
    });

    return resolveFavoritesBreadcrumbs({ favorites, subdomain });
  },

  isFavorite: async (
    _parent: undefined,
    { path }: Pick<IFavorites, 'path'>,
    { models, user }: IContext,
  ) => {
    const favorite = await models.Favorites.getFavorite({
      path: normalizeFavoritePath(path),
      userId: user._id,
    });

    return favorite ? true : false;
  },
};
