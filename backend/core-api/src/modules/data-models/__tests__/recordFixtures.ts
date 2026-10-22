import { getBuiltinDataModels } from '../builtins';
import type { IDataModel } from '../types';
import { DataModelRecords } from '../records/service';
import type {
  DataModelRecordChanges,
  DataModelRecordEventSink,
  IDataModelRecord,
  IDataModelRecordField,
  IDataModelRecordQuery,
  IDataModelRecordStore,
} from '../records/types';
import { DATA_MODEL_RECORD_FIELD_TYPES } from '../records/types';

export const recordField = (
  overrides: Partial<IDataModelRecordField> = {},
): IDataModelRecordField => ({
  _id: 'title',
  code: 'title',
  name: 'Title',
  type: 'text',
  owned: false,
  groupAvailable: true,
  repeating: false,
  ...overrides,
});

export class MemoryRecordStore implements IDataModelRecordStore {
  readonly records = new Map<string, IDataModelRecord>();

  async list(query: IDataModelRecordQuery): Promise<IDataModelRecord[]> {
    return [...this.records.values()]
      .filter((record) => Boolean(record.deletedAt) === query.deleted)
      .slice(query.offset, query.offset + query.limit);
  }

  async count(query: IDataModelRecordQuery): Promise<number> {
    return [...this.records.values()].filter(
      (record) => Boolean(record.deletedAt) === query.deleted,
    ).length;
  }

  async get(id: string, deleted: boolean): Promise<IDataModelRecord | null> {
    const record = this.records.get(id);
    return record && Boolean(record.deletedAt) === deleted ? record : null;
  }

  async insert(record: IDataModelRecord): Promise<IDataModelRecord> {
    this.records.set(record._id, record);
    return record;
  }

  async update(
    id: string,
    version: number,
    deleted: boolean,
    changes: DataModelRecordChanges,
  ): Promise<IDataModelRecord | null> {
    const record = await this.get(id, deleted);
    // Re-read after the await, matching the DB's atomic version predicate.
    const current = this.records.get(id);
    if (!record || current?.version !== version) return null;
    const updated = { ...record, ...changes, version: version + 1 };
    this.records.set(id, updated);
    return updated;
  }
}

export const recordSetup = (initialFields = [recordField()]) => {
  const model: IDataModel = {
    ...getBuiltinDataModels()[0],
    _id: 'model-a',
    name: 'asset',
    source: 'CUSTOM',
    contentType: 'core:dataModel_model-a',
    recordFieldTypes: DATA_MODEL_RECORD_FIELD_TYPES,
  };
  const models = new Map<string, IDataModel>([[model._id, model]]);
  const stores = new Map<string, MemoryRecordStore>();
  const store = jest.fn((id: string): MemoryRecordStore => {
    let existing = stores.get(id);
    if (!existing) {
      existing = new MemoryRecordStore();
      stores.set(id, existing);
    }
    return existing;
  });
  const fields = {
    list: jest
      .fn<Promise<IDataModelRecordField[]>, [string]>()
      .mockResolvedValue(initialFields),
    validate: jest
      .fn<Promise<void>, [string, unknown]>()
      .mockResolvedValue(undefined),
  };
  const emit = jest.fn<
    ReturnType<DataModelRecordEventSink>,
    Parameters<DataModelRecordEventSink>
  >();
  const records = new DataModelRecords({
    registry: {
      get: async (id) => {
        const value =
          models.get(id) ??
          getBuiltinDataModels().find((entry) => entry._id === id);
        if (!value) throw new Error('Data model not found');
        return value;
      },
    },
    fields,
    store,
    emit,
  });
  return { model, models, stores, store, fields, emit, records };
};
