import { IContext } from '~/connectionResolvers';
import { IFavorites } from '@/organization/settings/db/definitions/favorites';

export const favoriteMutations = {
  toggleFavorite: async (
    _parent: undefined,
    { type, path }: IFavorites,
    { models, user }: IContext,
  ) => {
    const favorite = await models.Favorites.getFavorites({
      type,
      path,
      userId: user._id,
    });

    if (favorite) {
      return models.Favorites.deleteFavorite({
        type,
        path,
        userId: user._id,
      });
    } else {
      return models.Favorites.createFavorite({
        type,
        path,
        userId: user._id,
      });
    }
  },
};

export default favoriteMutations;
