import { db } from '@erxes/core-db';
import {
  archiveFieldGroup,
  archiveFields,
  createField,
  createFieldGroup,
  fieldUsage,
  listFieldGroups,
  listFields,
  removeField,
  removeFieldGroup,
  removeUnusedFields,
  reorderFieldGroups,
  reorderFields,
  restoreField,
  restoreFieldGroup,
  updateField,
  updateFieldGroup,
} from '~/modules/fields/fields.service';
import { authed, audited, recordOf } from '~/orpc';

export const fieldsRouter = {
  list: authed.fields.list.handler(({ input, context }) => listFields(db(), context.actor, input)),
  usage: authed.fields.usage.handler(({ input, context }) =>
    fieldUsage(db(), context.actor, input),
  ),
  create: authed.fields.create.handler(({ input, context }) =>
    audited(
      context.actor,
      (tx) => createField(tx, context.actor, input),
      (field) => recordOf('field', 'created', field.id, field),
    ),
  ),
  update: authed.fields.update.handler(({ input: { id, ...changes }, context }) =>
    audited(
      context.actor,
      (tx) => updateField(tx, context.actor, id, changes),
      (field) => ({ ...recordOf('field', 'updated', id, field), metadata: changes }),
    ),
  ),
  reorder: authed.fields.reorder.handler(({ input, context }) =>
    reorderFields(db(), context.actor, input.orders),
  ),
  archive: authed.fields.archive.handler(({ input, context }) =>
    audited(
      context.actor,
      (tx) => archiveFields(tx, context.actor, input.ids),
      () => input.ids.map((id) => recordOf('field', 'archived', id)),
    ),
  ),
  restore: authed.fields.restore.handler(({ input, context }) =>
    audited(
      context.actor,
      (tx) => restoreField(tx, context.actor, input.id),
      (field) => recordOf('field', 'restored', input.id, field),
    ),
  ),
  removeUnused: authed.fields.removeUnused.handler(({ input, context }) =>
    audited(
      context.actor,
      (tx) => removeUnusedFields(tx, context.actor, input.ids),
      () => input.ids.map((id) => recordOf('field', 'deleted', id)),
    ),
  ),
  remove: authed.fields.remove.handler(({ input, context }) =>
    audited(
      context.actor,
      (tx) => removeField(tx, context.actor, input.id),
      () => recordOf('field', 'deleted', input.id),
    ),
  ),
};

export const fieldGroupsRouter = {
  list: authed.fieldGroups.list.handler(({ input, context }) =>
    listFieldGroups(db(), context.actor, input),
  ),
  create: authed.fieldGroups.create.handler(({ input, context }) =>
    audited(
      context.actor,
      (tx) => createFieldGroup(tx, context.actor, input),
      (group) => recordOf('field_group', 'created', group.id, group),
    ),
  ),
  update: authed.fieldGroups.update.handler(({ input: { id, ...changes }, context }) =>
    audited(
      context.actor,
      (tx) => updateFieldGroup(tx, context.actor, id, changes),
      (group) => ({ ...recordOf('field_group', 'updated', id, group), metadata: changes }),
    ),
  ),
  reorder: authed.fieldGroups.reorder.handler(({ input, context }) =>
    reorderFieldGroups(db(), context.actor, input.orders),
  ),
  archive: authed.fieldGroups.archive.handler(({ input, context }) =>
    audited(
      context.actor,
      (tx) => archiveFieldGroup(tx, context.actor, input.id),
      (group) => recordOf('field_group', 'archived', input.id, group),
    ),
  ),
  restore: authed.fieldGroups.restore.handler(({ input, context }) =>
    audited(
      context.actor,
      (tx) => restoreFieldGroup(tx, context.actor, input.id),
      (group) => recordOf('field_group', 'restored', input.id, group),
    ),
  ),
  remove: authed.fieldGroups.remove.handler(({ input, context }) =>
    audited(
      context.actor,
      (tx) => removeFieldGroup(tx, context.actor, input.id),
      () => recordOf('field_group', 'deleted', input.id),
    ),
  ),
};
