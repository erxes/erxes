import { Mongoose, Query } from 'mongoose';
import { DataModelRelations } from '../relations';
import { getDataModelFieldModel } from '../fields/registry';
import { DataModelRegistry } from '../registry';
import { recordSetup } from './recordFixtures';

const setup = () => {
  const connection = new Mongoose().connection;
  const target = { ...recordSetup().model, recordLabelField: 'title' };
  const permission = jest
    .fn<Promise<void>, [string]>()
    .mockResolvedValue(undefined);
  jest.spyOn(DataModelRegistry.prototype, 'get').mockResolvedValue(target);
  getDataModelFieldModel(connection);
  jest
    .spyOn(Query.prototype, 'exec')
    .mockResolvedValueOnce({
      _id: 'link',
      dataModelId: 'source',
      relation: { targetModelId: target._id },
    })
    .mockResolvedValueOnce([{ _id: 'title', type: 'text' }]);
  const service = new DataModelRelations(connection, permission);
  const collection = connection.collection(`data_model_records_${target._id}`);
  const cursor = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    maxTimeMS: jest.fn().mockReturnThis(),
    toArray: jest
      .fn()
      .mockResolvedValue([
        { _id: 'off-page', propertiesData: { title: 'Remote office' } },
      ]),
  };
  // The driver cursor is an external boundary; only the methods used by options are mocked.
  const find = jest
    .spyOn(collection, 'find')
    .mockReturnValue(cursor as unknown as ReturnType<typeof collection.find>);
  jest.spyOn(collection, 'countDocuments').mockResolvedValue(1);
  return { connection, target, permission, service, collection, cursor, find };
};

afterEach(() => jest.restoreAllMocks());

it('resolves labels for exact selected IDs without scanning the first picker page', async () => {
  const { target, service, find, cursor, permission } = setup();
  const result = await service.options('link', '', 100, 0, ['off-page']);
  expect(find).toHaveBeenCalledWith({
    dataModelId: target._id,
    deletedAt: null,
    _id: { $in: ['off-page'] },
  });
  expect(cursor.maxTimeMS).toHaveBeenCalledWith(3000);
  expect(result.list).toEqual([
    { _id: 'off-page', label: 'Remote office', imageUrl: null },
  ]);
  expect(permission).toHaveBeenCalledWith('dataModelRecordsRead');
});

it('treats an empty identity set as no records, not as an unfiltered list', async () => {
  const { service, find } = setup();
  await service.options('link', '', 100, 0, []);
  expect(find.mock.calls[0][0]).toMatchObject({
    _id: { $in: [] },
    deletedAt: null,
  });
});

it('bounds selected identities before querying record storage', async () => {
  const { service, find } = setup();
  await expect(
    service.options('link', '', 100, 0, Array(101).fill('record')),
  ).rejects.toThrow();
  expect(find).not.toHaveBeenCalled();
});

it('does not read record labels when source or target permission is denied', async () => {
  const { service, permission, find } = setup();
  permission.mockRejectedValue(new Error('Access denied'));
  await expect(
    service.options('link', '', 100, 0, ['off-page']),
  ).rejects.toThrow('Access denied');
  expect(find).not.toHaveBeenCalled();
});

it('excludes deleted or missing built-in records before paginating reverse links', async () => {
  const connection = new Mongoose().connection;
  const target = {
    ...recordSetup().model,
    _id: 'core:customer',
    name: 'customer',
    source: 'BUILTIN' as const,
  };
  jest.spyOn(DataModelRegistry.prototype, 'get').mockResolvedValue(target);
  getDataModelFieldModel(connection);
  jest.spyOn(Query.prototype, 'exec').mockResolvedValue({
    _id: 'forward',
    relation: { isInverse: false, inverseFieldId: 'reverse' },
  });
  const collection = connection.collection('data_model_builtin_values');
  const aggregate = jest.spyOn(collection, 'aggregate').mockReturnValue({
    toArray: jest.fn().mockResolvedValue([{ _id: 'active-customer' }]),
  } as unknown as ReturnType<typeof collection.aggregate>);
  const service = new DataModelRelations(connection, async () => undefined);
  const result = await service.resolve(
    {
      _id: 'reverse',
      dataModelId: 'source',
      name: 'customers',
      label: 'Customers',
      type: 'relation',
      description: '',
      required: false,
      options: [],
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'actor',
      updatedBy: 'actor',
      archivedAt: null,
      relation: {
        targetModelId: target._id,
        multiple: true,
        inverseFieldId: 'forward',
        isInverse: true,
      },
    },
    'source-record',
    null,
    { limit: 26, offset: 25 },
  );
  expect(result).toEqual([{ _id: 'active-customer' }]);
  expect(aggregate).toHaveBeenCalledWith(
    [
      {
        $match: {
          dataModelId: target._id,
          'propertiesData.forward': 'source-record',
        },
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'recordId',
          foreignField: '_id',
          as: 'linkedRecord',
        },
      },
      { $unwind: '$linkedRecord' },
      { $match: { 'linkedRecord.deletedAt': null } },
      { $sort: { recordId: 1 } },
      { $skip: 25 },
      { $limit: 26 },
      { $replaceRoot: { newRoot: '$linkedRecord' } },
    ],
    { maxTimeMS: 3000 },
  );
});
