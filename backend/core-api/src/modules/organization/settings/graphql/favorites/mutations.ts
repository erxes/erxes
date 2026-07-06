import { IContext } from '~/connectionResolvers';
import { IFavorites } from '@/organization/settings/db/definitions/favorites';
import {
  normalizeFavoriteBreadcrumb,
  normalizeFavoriteIcon,
  normalizeFavoritePath,
} from '@/organization/settings/graphql/favorites/utils';

type ToggleFavoriteArgs = Pick<IFavorites, 'path' | 'breadcrumb' | 'icon'>;

export const favoriteMutations = {
  toggleFavorite: async (
    _parent: undefined,
    { path, breadcrumb, icon }: ToggleFavoriteArgs,
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
      breadcrumb: normalizeFavoriteBreadcrumb(breadcrumb),
      icon: normalizeFavoriteIcon(icon),
      userId: user._id,
    });
  },
};
