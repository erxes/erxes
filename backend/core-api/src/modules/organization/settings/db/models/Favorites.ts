import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import {
  IFavorites,
  favoritesSchema,
  IFavoritesDocument,
} from '@/organization/settings/db/definitions/favorites';

export interface IFavoritesModel extends Model<IFavoritesDocument> {
  createFavorite(doc: IFavorites): Promise<IFavoritesDocument>;
  getFavorite(
    doc: Pick<IFavorites, 'path' | 'userId'>,
  ): Promise<IFavoritesDocument | null>;
  deleteFavorite(
    doc: Pick<IFavorites, 'path' | 'userId'>,
  ): Promise<IFavoritesDocument | null>;

  getFavoritesByCurrentUser({
    userId,
  }: {
    userId: string;
  }): Promise<IFavoritesDocument[]>;
}

export const loadFavoritesClass = (models: IModels) => {
  class Favorites {
    public static async createFavorite(doc: IFavorites) {
      const favorite = await models.Favorites.create(doc);
      return favorite;
    }

    public static async getFavoritesByCurrentUser({
      userId,
    }: {
      userId: string;
    }) {
      const favorites = await models.Favorites.find({ userId }).sort({
        createdAt: 1,
      });
      return favorites;
    }

    public static async deleteFavorite(
      doc: Pick<IFavorites, 'path' | 'userId'>,
    ) {
      const favorite = await models.Favorites.findOneAndDelete(doc);

      return favorite;
    }

    public static async getFavorite(doc: Pick<IFavorites, 'path' | 'userId'>) {
      const favorite = await models.Favorites.findOne(doc);
      return favorite;
    }
  }

  favoritesSchema.loadClass(Favorites);

  return favoritesSchema;
};
