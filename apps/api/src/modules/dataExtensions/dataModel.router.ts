import { db } from '@erxes/core-db';
import { scoped, audited, recordOf } from '~/orpc';
import {
  createField,
  listFields,
  removeField,
  reorderFields,
  setFieldStatus,
} from './fields.service';
import { updateField } from './fieldUpdate';
import {
  createObject,
  getObject,
  listObjects,
  removeObject,
  setObjectStatus,
  updateObject,
} from './objects.service';
import { createRelation } from './relations.service';

const objectEntry = (action: string, object: { id: string; pluralLabel: string }) =>
  recordOf('data_object', action, object.id, { label: object.pluralLabel });

export const dataObjectsRouter = {
  list: scoped.dataObjects.list.handler(({ input }) => listObjects(db(), input.archived)),
  get: scoped.dataObjects.get.handler(({ input }) => getObject(db(), input.key)),
  create: scoped.dataObjects.create.handler(({ input }) =>
    audited(
      (tx) => createObject(tx, input),
      (object) => objectEntry('created', object),
    ),
  ),
  update: scoped.dataObjects.update.handler(({ input }) =>
    audited(
      (tx) => updateObject(tx, input),
      (object) => ({ ...objectEntry('updated', object), metadata: input }),
    ),
  ),
  archive: scoped.dataObjects.archive.handler(({ input }) =>
    audited(
      (tx) => setObjectStatus(tx, input.key, 'archived'),
      (object) => objectEntry('archived', object),
    ),
  ),
  restore: scoped.dataObjects.restore.handler(({ input }) =>
    audited(
      (tx) => setObjectStatus(tx, input.key, 'active'),
      (object) => objectEntry('restored', object),
    ),
  ),
  remove: scoped.dataObjects.remove.handler(({ input }) =>
    audited(
      (tx) => removeObject(tx, input.key),
      () => ({ action: 'data_object.deleted', targetType: 'data_object', targetLabel: input.key }),
    ),
  ),
};

export const dataFieldsRouter = {
  list: scoped.dataFields.list.handler(({ input }) =>
    listFields(db(), input.recordType, input.archived),
  ),
  create: scoped.dataFields.create.handler(({ input }) =>
    audited(
      (tx) => createField(tx, input),
      (field) => recordOf('data_field', 'created', field.id, field),
    ),
  ),
  relate: scoped.dataFields.relate.handler(({ input }) =>
    audited(
      (tx) => createRelation(tx, input),
      ({ field, inverse }) => [
        recordOf('data_field', 'created', field.id, field),
        recordOf('data_field', 'created', inverse.id, inverse),
      ],
    ),
  ),
  update: scoped.dataFields.update.handler(({ input }) =>
    audited(
      (tx) => updateField(tx, input),
      (field) => ({ ...recordOf('data_field', 'updated', field.id, field), metadata: input }),
    ),
  ),
  reorder: scoped.dataFields.reorder.handler(({ input }) =>
    reorderFields(db(), input.recordType, input.ids),
  ),
  archive: scoped.dataFields.archive.handler(({ input }) =>
    audited(
      (tx) => setFieldStatus(tx, input.id, 'archived'),
      (field) => recordOf('data_field', 'archived', field.id, field),
    ),
  ),
  restore: scoped.dataFields.restore.handler(({ input }) =>
    audited(
      (tx) => setFieldStatus(tx, input.id, 'active'),
      (field) => recordOf('data_field', 'restored', field.id, field),
    ),
  ),
  remove: scoped.dataFields.remove.handler(({ input }) =>
    audited(
      (tx) => removeField(tx, input.id),
      () => recordOf('data_field', 'deleted', input.id),
    ),
  ),
};
