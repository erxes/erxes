import { Mongoose, Query } from 'mongoose';
import {
  createDataModelRecordStore,
  getDataModelRecordModel,
} from '../db/models/DataModelRecords';
import { createDataModelRecordSchema } from '../db/definitions/dataModelRecords';
import { dataModelRecordCollectionName } from '../records/identity';
import type { IDataModelRecordQuery } from '../records/types';

afterEach(() => jest.restoreAllMocks());

const query: IDataModelRecordQuery = {
  filter: {},
  sort: { createdAt: -1, _id: -1 },
  limit: 10,
  offset: 20,
  deleted: false,
};

describe('custom record persistence', () => {
  it('reuses models only inside the same tenant connection and model identity', () => {
    const first = new Mongoose().connection;
    const second = new Mongoose().connection;
    const a = getDataModelRecordModel(first, 'a');
    expect(getDataModelRecordModel(first, 'a')).toBe(a);
    expect(getDataModelRecordModel(first, 'b')).not.toBe(a);
    expect(getDataModelRecordModel(second, 'a')).not.toBe(a);
    expect(a.collection.collectionName).toBe('data_model_records_a');
  });

  it.each([
    '../companies',
    '$where',
    'a.b',
    'core:company',
    '__proto__',
    'a'.repeat(65),
  ])('rejects an unsafe collection identity %s', (id) => {
    expect(() =>
      getDataModelRecordModel(new Mongoose().connection, id),
    ).toThrow();
  });

  it('always scopes get/update by model ID, deleted state, and version', async () => {
    const store = createDataModelRecordStore(new Mongoose().connection, 'a');
    const execute = jest.spyOn(Query.prototype, 'exec').mockResolvedValue(null);
    await store.get('record', false);
    await store.update('record', 5, true, {
      propertiesData: {},
      updatedAt: new Date(),
      updatedBy: 'actor',
      deletedAt: null,
      deletedBy: null,
    });
    expect(execute.mock.contexts.map((entry) => entry.getFilter())).toEqual([
      { dataModelId: 'a', _id: 'record', deletedAt: null },
      { dataModelId: 'a', _id: 'record', version: 5, deletedAt: { $ne: null } },
    ]);
    expect(execute.mock.contexts[1].getUpdate()).toMatchObject({
      $inc: { version: 1 },
    });
  });

  it('combines filters without allowing them to override model/deleted constraints', async () => {
    const store = createDataModelRecordStore(new Mongoose().connection, 'a');
    const execute = jest.spyOn(Query.prototype, 'exec').mockResolvedValue([]);
    const plan = {
      ...query,
      filter: { dataModelId: 'b', deletedAt: { $ne: null } },
    };
    await store.list(plan);
    execute.mockResolvedValue(0);
    await store.count(plan);
    const selector = {
      $and: [{ dataModelId: 'a', deletedAt: null }, plan.filter],
    };
    expect(execute.mock.contexts.map((entry) => entry.getFilter())).toEqual([
      selector,
      selector,
    ]);
    expect(execute.mock.contexts[0].getOptions()).toMatchObject({
      maxTimeMS: 3000,
      limit: 10,
      skip: 20,
      sort: query.sort,
    });
    expect(execute.mock.contexts[1].getOptions()).toMatchObject({
      maxTimeMS: 3000,
    });
  });

  it('keeps system identity immutable and indexes the default active-record ordering', () => {
    const schema = createDataModelRecordSchema();
    expect(schema.path('dataModelId').options.immutable).toBe(true);
    expect(schema.path('createdBy').options.immutable).toBe(true);
    expect(schema.indexes()).toContainEqual([
      { deletedAt: 1, createdAt: -1, _id: -1 },
      expect.any(Object),
    ]);
  });

  it('keeps record collection names distinct from definition storage', () => {
    expect(dataModelRecordCollectionName('definitions')).not.toBe(
      'data_model_definitions',
    );
  });
});
