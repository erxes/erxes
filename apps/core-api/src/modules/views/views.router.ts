import { db } from '@erxes/core-db';
import {
  createView,
  listFilterFields,
  listViews,
  removeView,
  updateView,
} from '~/modules/views/views.service';
import { scoped } from '~/orpc';

export const viewsRouter = {
  list: scoped.views.list.handler(({ input }) => listViews(db(), input.recordType)),
  create: scoped.views.create.handler(({ input }) => createView(db(), input)),
  update: scoped.views.update.handler(({ input: { id, ...changes } }) =>
    updateView(db(), id, changes),
  ),
  remove: scoped.views.remove.handler(({ input }) => removeView(db(), input.id)),
  fields: scoped.views.fields.handler(({ input }) => listFilterFields(db(), input.recordType)),
};
