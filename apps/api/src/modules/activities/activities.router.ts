import { db } from '@erxes/core-db';
import { addNote, removeNote, updateNote } from '~/modules/activities/activities.service';
import {
  createPluginActivity,
  removePluginActivity,
  updatePluginActivity,
} from '~/modules/activities/pluginActivities.service';
import {
  activityTypes,
  listActivities,
  reactToActivity,
} from '~/modules/activities/timeline.service';
import { scoped } from '~/orpc';

export const activitiesRouter = {
  list: scoped.activities.list.handler(({ input }) => listActivities(db(), input)),
  create: scoped.activities.create.handler(({ input }) => createPluginActivity(db(), input)),
  addNote: scoped.activities.addNote.handler(({ input }) => addNote(db(), input)),
  updateNote: scoped.activities.updateNote.handler(({ input: { id, ...changes } }) =>
    updateNote(db(), id, changes),
  ),
  removeNote: scoped.activities.removeNote.handler(({ input }) => removeNote(db(), input.id)),
  react: scoped.activities.react.handler(({ input }) =>
    reactToActivity(db(), input.id, input.emoji),
  ),
  types: scoped.activities.types.handler(() => activityTypes(db())),
  update: scoped.activities.update.handler(({ input: { id, ...changes } }) =>
    updatePluginActivity(db(), id, changes),
  ),
  remove: scoped.activities.remove.handler(({ input }) => removePluginActivity(db(), input.id)),
};
