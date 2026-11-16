import { db } from '@erxes/core-db';
import { scoped } from '~/orpc';
import {
  addFavorite,
  listFavorites,
  removeFavorite,
  renameFavorite,
  reorderFavorites,
} from './favorites.service';

export const favoritesRouter = {
  list: scoped.favorites.list.handler(() => listFavorites(db())),
  add: scoped.favorites.add.handler(({ input }) => addFavorite(db(), input)),
  rename: scoped.favorites.rename.handler(({ input }) =>
    renameFavorite(db(), input.id, input.label),
  ),
  remove: scoped.favorites.remove.handler(({ input }) => removeFavorite(db(), input.id)),
  reorder: scoped.favorites.reorder.handler(({ input }) => reorderFavorites(db(), input.ids)),
};
