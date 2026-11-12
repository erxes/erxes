import { db } from '@erxes/core-db';
import {
  createView,
  listFilterFields,
  listViews,
  removeView,
  updateView,
} from '~/modules/views/views.service';
import { authed } from '~/orpc';

export const viewsRouter = {
  list: authed.views.list.handler(({ input, context }) =>
    listViews(db(), context.actor, input.recordType),
  ),
  create: authed.views.create.handler(({ input, context }) =>
    createView(db(), context.actor, input),
  ),
  update: authed.views.update.handler(({ input: { id, ...changes }, context }) =>
    updateView(db(), context.actor, id, changes),
  ),
  remove: authed.views.remove.handler(({ input, context }) =>
    removeView(db(), context.actor, input.id),
  ),
  fields: authed.views.fields.handler(({ input, context }) =>
    listFilterFields(db(), context.actor, input.recordType),
  ),
};
