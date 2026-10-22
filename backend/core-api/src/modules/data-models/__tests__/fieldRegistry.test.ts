import { Mongoose, Query, Types } from 'mongoose';
import {
  DataModelFields,
  getDataModelFieldModel,
  type IDataModelField,
} from '../fields/registry';
import { recordSetup } from './recordFixtures';

const setup = () => {
  const connection = new Mongoose().connection;
  const model = recordSetup().model;
  const registry = { get: jest.fn().mockResolvedValue(model) };
  const fields = getDataModelFieldModel(connection);
  return {
    connection,
    model,
    registry,
    fields,
    service: new DataModelFields(connection, registry),
  };
};
const stored: IDataModelField = {
  _id: 'field-a',
  dataModelId: 'model-a',
  name: 'serialNumber',
  label: 'Serial number',
  description: '',
  type: 'text',
  required: false,
  options: [],
  version: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'actor',
  updatedBy: 'actor',
  archivedAt: null,
};
afterEach(() => jest.restoreAllMocks());

it('uses separate tenant-local field models with an immutable identity and unique model/name index', () => {
  const first = setup();
  const second = setup();
  expect(first.fields).not.toBe(second.fields);
  expect(first.fields.collection.collectionName).toBe('data_model_fields');
  expect(first.fields.schema.path('name').options.immutable).toBe(true);
  expect(first.fields.schema.path('type').options.immutable).toBe(true);
  expect(first.fields.schema.indexes()).toContainEqual([
    { dataModelId: 1, name: 1 },
    expect.objectContaining({ unique: true }),
  ]);
});

it.each(['_id', 'version', 'createdAt', 'propertiesData', 'constructor'])(
  'protects reserved field identity %s',
  async (name) => {
    const { service } = setup();
    await expect(
      service.create(
        'model-a',
        { name, label: 'Field', type: 'text' },
        'actor',
      ),
    ).rejects.toThrow();
  },
);

it('protects existing built-in GraphQL fields even when absent from basic system metadata', async () => {
  const { service } = setup();
  await expect(
    service.create(
      'model-a',
      { name: 'existingGraphqlField', label: 'Field', type: 'text' },
      'actor',
      ['existingGraphqlField'],
    ),
  ).rejects.toThrow('reserved');
});

it('persists first-class metadata without creating a Properties field or group', async () => {
  const { service, fields } = setup();
  jest.spyOn(Query.prototype, 'exec').mockResolvedValue(0);
  jest.spyOn(fields, 'init').mockResolvedValue(new fields());
  const insert = jest.spyOn(fields.collection, 'insertOne').mockResolvedValue({
    acknowledged: true,
    insertedId: new Types.ObjectId(),
  });
  const created = await service.create(
    'model-a',
    {
      name: 'serialNumber',
      label: 'Serial number',
      type: 'text',
      required: true,
    },
    'actor',
  );
  expect(created).toMatchObject({
    dataModelId: 'model-a',
    name: 'serialNumber',
    type: 'text',
    required: true,
    version: 1,
  });
  expect(insert).toHaveBeenCalledTimes(1);
});

it('rejects immutable type/name edits and stale versions', async () => {
  const { service } = setup();
  const execute = jest.spyOn(Query.prototype, 'exec').mockResolvedValue(stored);
  await expect(
    service.update('model-a', stored._id, { type: 'number' }, 3, 'actor'),
  ).rejects.toThrow();
  await expect(
    service.update('model-a', stored._id, { label: 'Changed' }, 2, 'actor'),
  ).rejects.toThrow('Field changed');
  expect(execute.mock.contexts[0].getFilter()).toEqual({
    _id: stored._id,
    dataModelId: 'model-a',
  });
});

it('archives without deleting the field or its stored values', async () => {
  const { service } = setup();
  const execute = jest
    .spyOn(Query.prototype, 'exec')
    .mockResolvedValueOnce(stored)
    .mockResolvedValueOnce({ ...stored, archivedAt: new Date(), version: 4 });
  const archived = await service.setArchived(
    'model-a',
    stored._id,
    3,
    'actor',
    true,
  );
  expect(archived.version).toBe(4);
  expect(execute.mock.contexts[1].getFilter()).toEqual({
    _id: stored._id,
    dataModelId: 'model-a',
    version: 3,
  });
  expect(execute.mock.contexts[1].getUpdate()).toMatchObject({
    $inc: { version: 1 },
    $set: { archivedAt: expect.any(Date) },
  });
});
