import { db } from '@erxes/core-db';
import { listTrash, purgeFromTrash, restoreFromTrash } from '~/modules/trash/trash.service';
import { scoped } from '~/orpc';

export const trashRouter = {
  list: scoped.trash.list.handler(({ input }) => listTrash(db(), input)),
  restore: scoped.trash.restore.handler(({ input }) => restoreFromTrash(db(), input.ids)),
  purge: scoped.trash.purge.handler(({ input }) => purgeFromTrash(db(), input.ids)),
};
