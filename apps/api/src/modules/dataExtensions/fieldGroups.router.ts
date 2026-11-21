import { db } from '@erxes/core-db';
import { audited, recordOf, scoped } from '~/orpc';
import {
  createGroup,
  listGroups,
  removeGroup,
  reorderGroups,
  setGroupArchived,
  updateGroup,
} from './fieldGroups.service';

const entry = (action: string, group: { id: string; label: string }) =>
  recordOf('data_field_group', action, group.id, group);

export const dataFieldGroupsRouter = {
  list: scoped.dataFieldGroups.list.handler(({ input }) =>
    listGroups(db(), input.recordType, input.archived),
  ),
  create: scoped.dataFieldGroups.create.handler(({ input }) =>
    audited(
      (tx) => createGroup(tx, input),
      (group) => entry('created', group),
    ),
  ),
  update: scoped.dataFieldGroups.update.handler(({ input }) =>
    audited(
      (tx) => updateGroup(tx, input),
      (group) => ({ ...entry('updated', group), metadata: input }),
    ),
  ),
  reorder: scoped.dataFieldGroups.reorder.handler(({ input }) =>
    reorderGroups(db(), input.recordType, input.ids),
  ),
  archive: scoped.dataFieldGroups.archive.handler(({ input }) =>
    audited(
      (tx) => setGroupArchived(tx, input.id, true),
      (group) => entry('archived', group),
    ),
  ),
  restore: scoped.dataFieldGroups.restore.handler(({ input }) =>
    audited(
      (tx) => setGroupArchived(tx, input.id, false),
      (group) => entry('restored', group),
    ),
  ),
  remove: scoped.dataFieldGroups.remove.handler(({ input }) =>
    audited(
      (tx) => removeGroup(tx, input.id),
      () => recordOf('data_field_group', 'deleted', input.id),
    ),
  ),
};
