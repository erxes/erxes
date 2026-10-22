import type { ScopedEventHandlers } from 'erxes-api-shared/core-modules';
import { createDataModelRecordStore } from '../db/models/DataModelRecords';
import { createDataModelRecordEvents } from '../records/events';
import { createDataModelRecordFields } from '../records/fields';
import { DataModelRecords } from '../records/service';
import type { IDataModelRecord, IDataModelRecordList } from '../records/types';
import type {
  DataModelRecordInput,
  DataModelRecordListInput,
} from '../records/validation';
import { authorizeDataModel } from './context';
import type { DataModelContext } from './context';

export interface DataModelRecordContext extends DataModelContext {
  eventHandlers: ScopedEventHandlers;
}

export interface RecordIdentity {
  dataModelId: string;
  _id: string;
}
export interface RecordVersion extends RecordIdentity {
  expectedVersion: number;
}

const authorizeRecords = async (
  context: DataModelRecordContext,
  action: string,
) => {
  const { registry, actorId } = await authorizeDataModel(context, action);
  return {
    actorId,
    records: new DataModelRecords({
      registry,
      fields: createDataModelRecordFields(
        context.models.DataModelDefinitions.db,
        context.checkPermission,
      ),
      store: (modelId) =>
        createDataModelRecordStore(
          context.models.DataModelDefinitions.db,
          modelId,
        ),
      emit: createDataModelRecordEvents(context.eventHandlers),
    }),
  };
};

export const dataModelRecordQueries = {
  dataModelRecordList: async (
    _root: unknown,
    {
      dataModelId,
      params,
    }: { dataModelId: string; params?: DataModelRecordListInput | null },
    context: DataModelRecordContext,
  ): Promise<IDataModelRecordList> => {
    const { records } = await authorizeRecords(context, 'dataModelRecordsRead');
    return records.list(dataModelId, params ?? {});
  },
  dataModelRecordDetail: async (
    _root: unknown,
    { dataModelId, _id }: RecordIdentity,
    context: DataModelRecordContext,
  ): Promise<IDataModelRecord> => {
    const { records } = await authorizeRecords(context, 'dataModelRecordsRead');
    return records.get(dataModelId, _id);
  },
};

export const dataModelRecordMutations = {
  dataModelRecordCreate: async (
    _root: unknown,
    {
      dataModelId,
      input,
    }: { dataModelId: string; input: DataModelRecordInput },
    context: DataModelRecordContext,
  ): Promise<IDataModelRecord> => {
    const { records, actorId } = await authorizeRecords(
      context,
      'dataModelRecordsCreate',
    );
    return records.create(dataModelId, input, actorId);
  },
  dataModelRecordUpdate: async (
    _root: unknown,
    {
      dataModelId,
      _id,
      input,
      expectedVersion,
    }: RecordVersion & { input: DataModelRecordInput },
    context: DataModelRecordContext,
  ): Promise<IDataModelRecord> => {
    const { records, actorId } = await authorizeRecords(
      context,
      'dataModelRecordsUpdate',
    );
    return records.update(dataModelId, _id, input, expectedVersion, actorId);
  },
  dataModelRecordRemove: async (
    _root: unknown,
    { dataModelId, _id, expectedVersion }: RecordVersion,
    context: DataModelRecordContext,
  ): Promise<IDataModelRecord> => {
    const { records, actorId } = await authorizeRecords(
      context,
      'dataModelRecordsDelete',
    );
    return records.remove(dataModelId, _id, expectedVersion, actorId);
  },
  dataModelRecordRestore: async (
    _root: unknown,
    {
      dataModelId,
      _id,
      expectedVersion,
      input,
    }: RecordVersion & { input?: DataModelRecordInput | null },
    context: DataModelRecordContext,
  ): Promise<IDataModelRecord> => {
    const { records, actorId } = await authorizeRecords(
      context,
      'dataModelRecordsUpdate',
    );
    return records.restore(
      dataModelId,
      _id,
      expectedVersion,
      actorId,
      input ?? { propertiesData: {} },
    );
  },
};
