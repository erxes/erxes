import { db } from '@erxes/core-db';
import {
  addNote,
  createPluginActivity,
  listActivities,
  removeNote,
  updateNote,
  reactToActivity,
  activityTypes,
  updatePluginActivity,
  removePluginActivity,
} from '~/modules/activities/activities.service';
import { authed, plugin } from '~/orpc';

export const activitiesRouter = {
  list: authed.activities.list.handler(({ input, context }) =>
    listActivities(db(), context.actor, input),
  ),
  create: plugin.activities.create.handler(({ input, context }) =>
    createPluginActivity(db(), context.plugin, input),
  ),
  addNote: authed.activities.addNote.handler(({ input, context }) =>
    addNote(db(), context.actor, input),
  ),
  updateNote: authed.activities.updateNote.handler(({ input: { id, ...changes }, context }) =>
    updateNote(db(), context.actor, id, changes),
  ),
  removeNote: authed.activities.removeNote.handler(({ input, context }) =>
    removeNote(db(), context.actor, input.id),
  ),
  react: authed.activities.react.handler(({ input, context }) =>
    reactToActivity(db(), context.actor, input.id, input.emoji),
  ),
  types: authed.activities.types.handler(({ context }) => activityTypes(db(), context.actor.orgId)),
  update: plugin.activities.update.handler(({ input: { id, ...changes }, context }) =>
    updatePluginActivity(db(), context.plugin, id, changes),
  ),
  remove: plugin.activities.remove.handler(({ input, context }) =>
    removePluginActivity(db(), context.plugin, input.id),
  ),
};
