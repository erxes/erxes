import { db } from '@erxes/core-db';
import {
  addNote,
  editNote,
  listNoteVersions,
  pinNote,
  removeNote,
} from '~/modules/activities/activities.service';
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
  editNote: scoped.activities.editNote.handler(({ input: { id, ...changes } }) =>
    editNote(db(), id, changes),
  ),
  pinNote: scoped.activities.pinNote.handler(({ input }) => pinNote(db(), input.id, input.pinned)),
  noteVersions: scoped.activities.noteVersions.handler(({ input }) =>
    listNoteVersions(db(), input.id),
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
