import { db } from '@erxes/core-db';
import {
  archiveFieldGroup,
  createFieldGroup,
  listFieldGroups,
  removeFieldGroup,
  reorderFieldGroups,
  restoreFieldGroup,
  updateFieldGroup,
} from '~/modules/fields/fieldGroups.service';
import {
  archiveFields,
  createField,
  fieldUsage,
  listFields,
  removeField,
  removeUnusedFields,
  reorderFields,
  restoreField,
  updateField,
} from '~/modules/fields/fields.service';
import { scoped, audited, recordOf } from '~/orpc';

export const fieldsRouter = {
  list: scoped.fields.list.handler(({ input }) => listFields(db(), input)),
  usage: scoped.fields.usage.handler(({ input }) => fieldUsage(db(), input)),
  create: scoped.fields.create.handler(({ input }) =>
    audited(
      (tx) => createField(tx, input),
      (field) => recordOf('field', 'created', field.id, field),
    ),
  ),
  update: scoped.fields.update.handler(({ input: { id, ...changes } }) =>
    audited(
      (tx) => updateField(tx, id, changes),
      (field) => ({ ...recordOf('field', 'updated', id, field), metadata: changes }),
    ),
  ),
  reorder: scoped.fields.reorder.handler(({ input }) => reorderFields(db(), input.orders)),
  archive: scoped.fields.archive.handler(({ input }) =>
    audited(
      (tx) => archiveFields(tx, input.ids),
      () => input.ids.map((id) => recordOf('field', 'archived', id)),
    ),
  ),
  restore: scoped.fields.restore.handler(({ input }) =>
    audited(
      (tx) => restoreField(tx, input.id),
      (field) => recordOf('field', 'restored', input.id, field),
    ),
  ),
  removeUnused: scoped.fields.removeUnused.handler(({ input }) =>
    audited(
      (tx) => removeUnusedFields(tx, input.ids),
      () => input.ids.map((id) => recordOf('field', 'deleted', id)),
    ),
  ),
  remove: scoped.fields.remove.handler(({ input }) =>
    audited(
      (tx) => removeField(tx, input.id),
      () => recordOf('field', 'deleted', input.id),
    ),
  ),
};

export const fieldGroupsRouter = {
  list: scoped.fieldGroups.list.handler(({ input }) => listFieldGroups(db(), input)),
  create: scoped.fieldGroups.create.handler(({ input }) =>
    audited(
      (tx) => createFieldGroup(tx, input),
      (group) => recordOf('field_group', 'created', group.id, group),
    ),
  ),
  update: scoped.fieldGroups.update.handler(({ input: { id, ...changes } }) =>
    audited(
      (tx) => updateFieldGroup(tx, id, changes),
      (group) => ({ ...recordOf('field_group', 'updated', id, group), metadata: changes }),
    ),
  ),
  reorder: scoped.fieldGroups.reorder.handler(({ input }) =>
    reorderFieldGroups(db(), input.orders),
  ),
  archive: scoped.fieldGroups.archive.handler(({ input }) =>
    audited(
      (tx) => archiveFieldGroup(tx, input.id),
      (group) => recordOf('field_group', 'archived', input.id, group),
    ),
  ),
  restore: scoped.fieldGroups.restore.handler(({ input }) =>
    audited(
      (tx) => restoreFieldGroup(tx, input.id),
      (group) => recordOf('field_group', 'restored', input.id, group),
    ),
  ),
  remove: scoped.fieldGroups.remove.handler(({ input }) =>
    audited(
      (tx) => removeFieldGroup(tx, input.id),
      () => recordOf('field_group', 'deleted', input.id),
    ),
  ),
};
