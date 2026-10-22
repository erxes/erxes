import { Mongoose, Query } from 'mongoose';
import {
  DataModelFields,
  getDataModelFieldModel,
  type IDataModelField,
} from '../fields/registry';
import { DataModelRelations } from '../relations';
import { DataModelRegistry } from '../registry';
import { normalizeDataModelRecordValue } from '../records/fields';
import { buildDataModelRecordQuery } from '../records/query';
import { recordField, recordSetup } from './recordFixtures';

const setup = () => {
  const connection = new Mongoose().connection;
  const model = recordSetup().model;
  const target = { ...model, _id: 'target-model', name: 'building' };
  const registry = {
    get: jest.fn(async (id: string) => (id === target._id ? target : model)),
  };
  const fields = getDataModelFieldModel(connection);
  const service = new DataModelFields(connection, registry);
  const permission = jest
    .fn<Promise<void>, [string]>()
    .mockResolvedValue(undefined);
  return { connection, model, target, registry, fields, service, permission };
};
const relationMetadata = {
  targetModelId: 'target-model',
  multiple: false,
  inverseFieldId: 'inverse-field',
  isInverse: false,
};
const definition = (
  overrides: Partial<IDataModelField> = {},
): IDataModelField => ({
  _id: 'owner-field',
  dataModelId: 'model-a',
  name: 'building',
  label: 'Building',
  description: '',
  type: 'relation',
  required: false,
  options: [],
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'actor',
  updatedBy: 'actor',
  archivedAt: null,
  relation: {
    targetModelId: 'target-model',
    multiple: false,
    inverseFieldId: 'inverse-field',
    isInverse: false,
  },
  ...overrides,
});
afterEach(() => jest.restoreAllMocks());

it('creates reciprocal field identities with one writable side and a computed reverse list', async () => {
  const { model, target, fields, service } = setup();
  jest.spyOn(Query.prototype, 'exec').mockResolvedValue(0);
  jest.spyOn(fields, 'init').mockResolvedValue(new fields());
  const insert = jest.spyOn(fields.collection, 'insertMany').mockResolvedValue({
    acknowledged: true,
    insertedCount: 2,
    insertedIds: {},
  });
  const field = await service.create(
    model._id,
    {
      name: 'building',
      label: 'Building',
      type: 'relation',
      relation: {
        targetModelId: target._id,
        multiple: false,
        inverseName: 'assets',
        inverseLabel: 'Assets',
      },
    },
    'actor',
  );
  const [owner, inverse] = insert.mock.calls[0][0];
  expect(owner).toMatchObject({
    _id: field._id,
    dataModelId: model._id,
    relation: {
      targetModelId: target._id,
      inverseFieldId: inverse._id,
      isInverse: false,
    },
  });
  expect(inverse).toMatchObject({
    dataModelId: target._id,
    name: 'assets',
    required: false,
    relation: {
      targetModelId: model._id,
      inverseFieldId: owner._id,
      multiple: true,
      isInverse: true,
    },
  });
});

it('rejects missing configurations, mismatched types, reserved reverse names and ambiguous self links', async () => {
  const { model, target, service } = setup();
  const relation = {
    targetModelId: target._id,
    multiple: false,
    inverseName: 'assets',
    inverseLabel: 'Assets',
  };
  await expect(
    service.create(
      model._id,
      { name: 'link', label: 'Link', type: 'relation' },
      'actor',
    ),
  ).rejects.toThrow('require a target');
  await expect(
    service.create(
      model._id,
      { name: 'link', label: 'Link', type: 'text', relation },
      'actor',
    ),
  ).rejects.toThrow('other types');
  await expect(
    service.create(
      model._id,
      {
        name: 'link',
        label: 'Link',
        type: 'relation',
        relation: { ...relation, inverseName: 'existingField' },
      },
      'actor',
      [],
      ['existingField'],
    ),
  ).rejects.toThrow('reserved');
  await expect(
    service.create(
      model._id,
      {
        name: 'link',
        label: 'Link',
        type: 'relation',
        relation: {
          ...relation,
          targetModelId: model._id,
          inverseName: 'link',
        },
      },
      'actor',
    ),
  ).rejects.toThrow('different');
});

it('rejects direct reverse writes and invalid cardinalities before persistence', () => {
  const field = recordField({
    type: 'relation',
    relation: definition().relation ?? undefined,
  });
  expect(normalizeDataModelRecordValue(field, 'record-a')).toBe('record-a');
  expect(() => normalizeDataModelRecordValue(field, ['record-a'])).toThrow();
  expect(() =>
    normalizeDataModelRecordValue(
      { ...field, relation: { ...relationMetadata, isInverse: true } },
      'record-a',
    ),
  ).toThrow('read-only');
  expect(() =>
    normalizeDataModelRecordValue(
      { ...field, relation: { ...relationMetadata, multiple: true } },
      Array(101).fill('record-a'),
    ),
  ).toThrow();
});

it('validates existence in the exact target model and refuses duplicate or deleted references', async () => {
  const { connection, target, permission } = setup();
  jest.spyOn(DataModelRegistry.prototype, 'get').mockResolvedValue(target);
  const relations = new DataModelRelations(connection, permission);
  const records = jest
    .spyOn(relations, 'records')
    .mockResolvedValue([{ _id: 'record-a' }]);
  await relations.validate(definition(), 'record-a');
  expect(records).toHaveBeenCalledWith(target, ['record-a']);
  records.mockResolvedValue([]);
  await expect(relations.validate(definition(), 'record-a')).rejects.toThrow(
    'missing, deleted',
  );
  await expect(
    relations.validate(
      definition({ relation: { ...relationMetadata, multiple: true } }),
      ['record-a', 'record-a'],
    ),
  ).rejects.toThrow('duplicate');
});

it('enforces target permissions, including the original built-in business grant', async () => {
  jest.spyOn(Query.prototype, 'exec').mockResolvedValue(null);
  const { connection, permission } = setup();
  const relations = new DataModelRelations(connection, permission);
  permission.mockImplementation(async (action) => {
    if (action === 'contactsRead') throw new Error('Contacts access denied');
  });
  await expect(
    relations.validate(
      definition({
        relation: { ...relationMetadata, targetModelId: 'core:customer' },
      }),
      'customer-a',
    ),
  ).rejects.toThrow('Contacts access denied');
});

it('preserves forward ordering, drops deleted targets, and traverses reverse links with bounded pagination', async () => {
  const { connection, target, model, permission } = setup();
  jest.spyOn(DataModelRegistry.prototype, 'get').mockResolvedValue(target);
  const relations = new DataModelRelations(connection, permission);
  const records = jest
    .spyOn(relations, 'records')
    .mockResolvedValue([{ _id: 'b' }, { _id: 'a' }]);
  expect(
    await relations.resolve(
      definition({ relation: { ...relationMetadata, multiple: true } }),
      'source',
      ['a', 'missing', 'b'],
    ),
  ).toEqual([{ _id: 'a' }, { _id: 'b' }]);
  records.mockRestore();
  const reverse = definition({
    _id: 'inverse-field',
    dataModelId: target._id,
    name: 'assets',
    relation: {
      targetModelId: model._id,
      multiple: true,
      inverseFieldId: 'owner-field',
      isInverse: true,
    },
  });
  const owner = definition({
    relation: { ...relationMetadata, inverseFieldId: reverse._id },
  });
  jest.spyOn(DataModelRegistry.prototype, 'get').mockResolvedValue(model);
  const execute = jest
    .spyOn(Query.prototype, 'exec')
    .mockResolvedValueOnce(owner)
    .mockResolvedValueOnce([{ _id: 'asset-a' }]);
  expect(
    await relations.resolve(reverse, 'building-a', null, {
      limit: 10,
      offset: 20,
    }),
  ).toEqual([{ _id: 'asset-a' }]);
  expect(execute.mock.contexts[1].getFilter()).toEqual({
    dataModelId: model._id,
    deletedAt: null,
    'propertiesData.owner-field': 'building-a',
  });
  expect(execute.mock.contexts[1].getOptions()).toMatchObject({
    limit: 10,
    skip: 20,
    maxTimeMS: 3000,
  });
  await expect(
    relations.resolve(reverse, 'building-a', null, { limit: 101 }),
  ).rejects.toThrow();
});

it('never reuses models across tenant connections and scopes relation reads to model and active records', async () => {
  const first = setup();
  const second = setup();
  const execute = jest.spyOn(Query.prototype, 'exec').mockResolvedValue([]);
  await new DataModelRelations(first.connection, first.permission).records(
    first.model,
    ['record-a'],
  );
  await new DataModelRelations(second.connection, second.permission).records(
    second.model,
    ['record-a'],
  );
  expect(execute.mock.contexts[0].model.db).not.toBe(
    execute.mock.contexts[1].model.db,
  );
  expect(execute.mock.contexts[0].getFilter()).toEqual({
    dataModelId: first.model._id,
    _id: { $in: ['record-a'] },
    deletedAt: null,
  });
});

it('supports filtering stored links by target identity and rejects reverse-list filters', () => {
  const field = recordField({
    type: 'relation',
    relation: { ...relationMetadata, multiple: true },
  });
  const query = buildDataModelRecordQuery([field], {
    filters: [{ fieldId: field._id, operator: 'IN', value: ['target-a'] }],
  });
  expect(query.filter).toEqual({
    $and: [{ 'propertiesData.title': { $in: ['target-a'] } }],
  });
  expect(() =>
    buildDataModelRecordQuery(
      [{ ...field, relation: { ...relationMetadata, isInverse: true } }],
      { filters: [{ fieldId: field._id, operator: 'IS_EMPTY' }] },
    ),
  ).toThrow('Reverse');
});
