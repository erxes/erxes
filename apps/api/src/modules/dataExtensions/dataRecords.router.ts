import { db } from '@erxes/core-db';
import { scoped, audited, recordOf } from '~/orpc';
import { getValues, lookupValues, updateValues } from './hostValues.service';
import { createRecord, setRecordDeleted, updateRecord } from './recordWrites';
import { getRecord, listRecords } from './records.service';

const entry = (
  action: string,
  record: { id: string; recordType: string; label: string | null },
) => ({
  ...recordOf('data_record', action, record.id, { label: record.label ?? undefined }),
  metadata: { recordType: record.recordType },
});

export const dataRecordsRouter = {
  list: scoped.dataRecords.list.handler(({ input }) => listRecords(db(), input)),
  get: scoped.dataRecords.get.handler(({ input }) => getRecord(db(), input.objectKey, input.id)),
  create: scoped.dataRecords.create.handler(({ input }) =>
    audited(
      (tx) => createRecord(tx, input),
      (record) => entry('created', record),
    ),
  ),
  update: scoped.dataRecords.update.handler(({ input }) =>
    audited(
      (tx) => updateRecord(tx, input),
      (record) => ({
        ...entry('updated', record),
        metadata: { recordType: record.recordType, values: Object.keys(input.values) },
      }),
    ),
  ),
  remove: scoped.dataRecords.remove.handler(({ input }) =>
    audited(
      (tx) => setRecordDeleted(tx, input.objectKey, input.id, true),
      (record) => entry('deleted', record),
    ),
  ),
  restore: scoped.dataRecords.restore.handler(({ input }) =>
    audited(
      (tx) => setRecordDeleted(tx, input.objectKey, input.id, false),
      (record) => entry('restored', record),
    ),
  ),
};

export const dataValuesRouter = {
  get: scoped.dataValues.get.handler(({ input }) => getValues(db(), input)),
  lookup: scoped.dataValues.lookup.handler(async ({ input }) => ({
    data: await lookupValues(db(), input),
  })),
  update: scoped.dataValues.update.handler(({ input }) =>
    audited(
      (tx) => updateValues(tx, input),
      (values) => ({
        action: 'data_values.updated',
        targetType: input.recordType,
        targetId: values.recordId,
        metadata: { values: Object.keys(input.values) },
      }),
    ),
  ),
};
