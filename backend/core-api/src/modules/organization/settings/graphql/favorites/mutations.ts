import { IContext } from '~/connectionResolvers';
import { IFavorites } from '@/organization/settings/db/definitions/favorites';
import { normalizeFavoritePath } from '@/organization/settings/graphql/favorites/utils';

export const favoriteMutations = {
  toggleFavorite: async (
    _parent: undefined,
    { path }: Pick<IFavorites, 'path'>,
    { models, user }: IContext,
  ) => {
    const normalizedPath = normalizeFavoritePath(path);

    const favorite = await models.Favorites.getFavorite({
      path: normalizedPath,
      userId: user._id,
    });

    if (favorite) {
      return models.Favorites.deleteFavorite({
        path: normalizedPath,
        userId: user._id,
      });
    }

    return models.Favorites.createFavorite({
      path: normalizedPath,
      userId: user._id,
    });
  },
};
