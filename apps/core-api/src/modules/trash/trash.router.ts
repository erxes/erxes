import { db } from '@erxes/core-db';
import { listTrash, purgeFromTrash, restoreFromTrash } from '~/modules/trash/trash.service';
import { authed } from '~/orpc';

export const trashRouter = {
  list: authed.trash.list.handler(({ input, context }) => listTrash(db(), context.actor, input)),
  restore: authed.trash.restore.handler(({ input, context }) =>
    restoreFromTrash(db(), context.actor, input.ids),
  ),
  purge: authed.trash.purge.handler(({ input, context }) =>
    purgeFromTrash(db(), context.actor, input.ids),
  ),
};
