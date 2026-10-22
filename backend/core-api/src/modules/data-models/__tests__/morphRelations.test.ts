import { Mongoose, Query } from 'mongoose';
import { DataModelFields, getDataModelFieldModel } from '../fields/registry';
import { validateDataModelRecordPatch } from '../records/fields';
import { recordField, recordSetup } from './recordFixtures';

const setup = () => {
  const connection = new Mongoose().connection;
  const source = recordSetup().model;
  const alpha = { ...source, _id: 'alpha-model', name: 'alpha' };
  const beta = { ...source, _id: 'beta-model', name: 'beta' };
  const registry = {
    get: jest.fn(
      async (id: string) =>
        [source, alpha, beta].find((model) => model._id === id) ?? source,
    ),
  };
  const fields = getDataModelFieldModel(connection);
  return {
    source,
    alpha,
    beta,
    fields,
    service: new DataModelFields(connection, registry),
  };
};
const input = {
  name: 'related',
  label: 'Related to',
  type: 'relation',
  relation: {
    targetModelIds: ['alpha-model', 'beta-model'],
    multiple: false,
    inverseName: 'assets',
    inverseLabel: 'Assets',
  },
};
afterEach(() => jest.restoreAllMocks());

it('creates a grouped typed pair for each destination and keeps the same group identity', async () => {
  const { source, fields, service } = setup();
  jest.spyOn(Query.prototype, 'exec').mockResolvedValue(0);
  jest.spyOn(fields, 'init').mockResolvedValue(new fields());
  const insert = jest
    .spyOn(fields.collection, 'insertMany')
    .mockResolvedValue({
      acknowledged: true,
      insertedCount: 2,
      insertedIds: {},
    });
  const first = await service.create(source._id, input, 'actor');
  const rows = insert.mock.calls.flatMap((call) => call[0]);
  const forwards = rows.filter((row) => row.dataModelId === source._id);
  expect(forwards.map((row) => row.name)).toEqual([
    'related_alpha',
    'related_beta',
  ]);
  for (const row of forwards)
    expect(row.relation).toMatchObject({
      morphId: first.relation?.morphId,
      morphName: 'related',
      morphSize: 2,
      multiple: false,
      isInverse: false,
    });
  expect(
    rows.filter((row) => row.relation.isInverse).map((row) => row.dataModelId),
  ).toEqual(['alpha-model', 'beta-model']);
});

it('rolls back every completed pair if a later destination fails', async () => {
  const { source, fields, service } = setup();
  jest.spyOn(Query.prototype, 'exec').mockResolvedValue(0);
  jest.spyOn(fields, 'init').mockResolvedValue(new fields());
  const insert = jest
    .spyOn(fields.collection, 'insertMany')
    .mockResolvedValueOnce({
      acknowledged: true,
      insertedCount: 2,
      insertedIds: {},
    })
    .mockRejectedValueOnce({ code: 11000 });
  const remove = jest.spyOn(fields, 'deleteMany');
  await expect(service.create(source._id, input, 'actor')).rejects.toThrow(
    'already exists',
  );
  const initialPair = insert.mock.calls[0][0];
  expect(remove).toHaveBeenLastCalledWith({
    _id: { $in: initialPair.map((row) => row._id) },
  });
});

it('rejects duplicate targets and self combined with another target before inserting metadata', async () => {
  const { source, service } = setup();
  await expect(
    service.create(
      source._id,
      {
        ...input,
        relation: {
          ...input.relation,
          targetModelIds: ['alpha-model', 'alpha-model'],
        },
      },
      'actor',
    ),
  ).rejects.toThrow('unique');
  await expect(
    service.create(
      source._id,
      {
        ...input,
        relation: {
          ...input.relation,
          targetModelIds: [source._id, 'alpha-model'],
        },
      },
      'actor',
    ),
  ).rejects.toThrow('source object');
});

it('enforces one required value across a group on create and merged updates', async () => {
  const first = recordField({
    _id: 'alpha-field',
    type: 'relation',
    isRequired: true,
    relation: {
      targetModelId: 'alpha-model',
      inverseFieldId: 'alpha-inverse',
      multiple: false,
      isInverse: false,
      morphId: 'group',
      morphName: 'related',
      morphSize: 2,
    },
  });
  const second = {
    ...first,
    _id: 'beta-field',
    relation: {
      ...first.relation,
      targetModelId: 'beta-model',
      inverseFieldId: 'beta-inverse',
      multiple: false,
      isInverse: false,
    },
  };
  const fields = [first, second];
  const validate = jest.fn().mockResolvedValue(undefined);
  await expect(
    validateDataModelRecordPatch(fields, validate, { 'alpha-field': 'a' }),
  ).resolves.toEqual({ 'alpha-field': 'a' });
  await expect(
    validateDataModelRecordPatch(fields, validate, {}),
  ).rejects.toThrow('required');
  await expect(
    validateDataModelRecordPatch(
      fields,
      validate,
      { 'beta-field': 'b' },
      { 'alpha-field': 'a' },
    ),
  ).rejects.toThrow('one record');
  await expect(
    validateDataModelRecordPatch(
      fields,
      validate,
      { 'alpha-field': null, 'beta-field': 'b' },
      { 'alpha-field': 'a' },
    ),
  ).resolves.toEqual({ 'beta-field': 'b' });
});
