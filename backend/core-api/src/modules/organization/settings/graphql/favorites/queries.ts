import { IContext } from '~/connectionResolvers';
import { IFavorites } from '@/organization/settings/db/definitions/favorites';

export const favoriteQueries = {
  getFavoritesByCurrentUser: async (
    _parent: undefined,
    _args: undefined,
    { models, user }: IContext,
  ) => {
    return models.Favorites.getFavoritesByCurrentUser({ userId: user._id });
  },

  isFavorite: async (
    _parent: undefined,
    { type, path }: IFavorites,
    { models, user }: IContext,
  ) => {
    const favorite = await models.Favorites.getFavorite({
      type,
      path,
      userId: user._id,
    });

    return favorite ? true : false;
  },
};

export default favoriteQueries;
