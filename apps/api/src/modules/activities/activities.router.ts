import { db, type Db } from '@erxes/core-db';
import {
  addNote,
  editNote,
  listNoteVersions,
  pinNote,
  removeNote,
} from '~/modules/activities/activities.service';
import {
  createPluginActivity,
  importPluginNote,
  removePluginActivity,
  updatePluginActivity,
} from '~/modules/activities/pluginActivities.service';
import {
  activityTypes,
  listActivities,
  listMemberActivities,
  reactToActivity,
} from '~/modules/activities/timeline.service';
import { entryTarget, onTimeline } from '~/modules/activities/timelineAccess';
import { scoped, unscoped } from '~/orpc';

// A member's calls on a timeline are `unscoped`: `onTimeline` may ask the plugin about the
// record over the network before it opens the transaction they run in.
const onEntry = <T>(id: string, work: (tx: Db) => Promise<T>) =>
  onTimeline((tx) => entryTarget(tx, id), work);

export const activitiesRouter = {
  list: unscoped.activities.list.handler(({ input }) =>
    onTimeline(
      async () => input,
      (tx) => listActivities(tx, input),
    ),
  ),
  byMember: scoped.activities.byMember.handler(({ input }) => listMemberActivities(db(), input)),
  create: scoped.activities.create.handler(({ input }) => createPluginActivity(db(), input)),
  addNote: unscoped.activities.addNote.handler(({ input }) =>
    onTimeline(
      async () => input,
      (tx) => addNote(tx, input),
    ),
  ),
  importNote: scoped.activities.importNote.handler(({ input }) => importPluginNote(db(), input)),
  editNote: unscoped.activities.editNote.handler(({ input: { id, ...changes } }) =>
    onEntry(id, (tx) => editNote(tx, id, changes)),
  ),
  pinNote: unscoped.activities.pinNote.handler(({ input }) =>
    onEntry(input.id, (tx) => pinNote(tx, input.id, input.pinned)),
  ),
  noteVersions: unscoped.activities.noteVersions.handler(({ input }) =>
    onEntry(input.id, (tx) => listNoteVersions(tx, input.id)),
  ),
  removeNote: unscoped.activities.removeNote.handler(({ input }) =>
    onEntry(input.id, (tx) => removeNote(tx, input.id)),
  ),
  react: unscoped.activities.react.handler(({ input }) =>
    onEntry(input.id, (tx) => reactToActivity(tx, input.id, input.emoji)),
  ),
  types: scoped.activities.types.handler(() => activityTypes(db())),
  update: scoped.activities.update.handler(({ input: { id, ...changes } }) =>
    updatePluginActivity(db(), id, changes),
  ),
  remove: scoped.activities.remove.handler(({ input }) => removePluginActivity(db(), input.id)),
};
