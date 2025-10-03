import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import {
  IFavorites,
  favoritesSchema,
  IFavoritesDocument,
} from '@/organization/settings/db/definitions/favorites';

export interface IFavoritesModel extends Model<IFavoritesDocument> {
  createFavorite({
    type,
    path,
    userId,
  }: IFavorites): Promise<IFavoritesDocument>;
  getFavorites({
    type,
    path,

    userId,
  }: IFavorites): Promise<IFavoritesDocument[]>;

  getFavorite({
    type,
    path,

    userId,
  }: IFavorites): Promise<IFavoritesDocument>;

  deleteFavorite({ type, path }: IFavorites): Promise<IFavoritesDocument>;

  getFavoritesByCurrentUser({
    userId,
  }: {
    userId: string;
  }): Promise<IFavoritesDocument[]>;
}

export const loadFavoritesClass = (models: IModels) => {
  class Favorites {
    public static async createFavorite(doc: IFavoritesDocument) {
      const favorite = await models.Favorites.create(doc);
      return favorite;
    }

    public static async getFavoritesByCurrentUser({
      userId,
    }: {
      userId: string;
    }) {
      const favorites = await models.Favorites.find({ userId });
      return favorites;
    }

    public static async deleteFavorite(doc: IFavorites) {
      const favorite = await models.Favorites.findOneAndDelete(doc);

      return favorite;
    }

    public static async getFavorites(doc: IFavorites) {
      const favorite = await models.Favorites.findOne(doc);
      return favorite;
    }

    public static async getFavorite(doc: IFavorites) {
      const favorite = await models.Favorites.findOne(doc);
      return favorite;
    }
  }

  favoritesSchema.loadClass(Favorites);

  return favoritesSchema;
};
