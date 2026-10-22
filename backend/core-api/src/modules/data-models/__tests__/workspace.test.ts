import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql, printSchema } from 'graphql';
import { Mongoose, Query } from 'mongoose';
import type { ScopedEventHandlers } from 'erxes-api-shared/core-modules';
import { dataModelDefinitionSchema } from '../db/definitions/dataModelDefinitions';
import type { IDataModelDefinitionDocument } from '../types';
import type { IDataModelField } from '../fields/registry';
import {
  buildWorkspaceSDL,
  createWorkspaceSchema,
  type WorkspaceContext,
  type WorkspaceModel,
} from '../graphql/workspace';
import { DataModelRecords } from '../records/service';
import { recordSetup } from './recordFixtures';

const model = recordSetup().model;
const definition = (
  overrides: Partial<IDataModelField> = {},
): IDataModelField => ({
  _id: 'serial-id',
  dataModelId: model._id,
  name: 'serialNumber',
  label: 'Serial number',
  description: '',
  type: 'text',
  required: true,
  options: [],
  version: 1,
  createdAt: new Date('2026-10-22'),
  updatedAt: new Date('2026-10-22'),
  createdBy: 'actor',
  updatedBy: 'actor',
  archivedAt: null,
  ...overrides,
});
const base = () =>
  makeExecutableSchema({
    typeDefs:
      'scalar Date\ntype Customer { _id: String! firstName: String }\ntype Query { health: String! customers: [Customer!]! }\ntype Mutation { noop: Boolean }',
    resolvers: {
      Query: {
        health: () => 'ok',
        customers: () => [
          {
            _id: 'customer-a',
            firstName: 'Name',
            propertiesData: { 'legacy-property': 'not-this-field' },
          },
        ],
      },
    },
  });
const schemaFor = (models: WorkspaceModel[]) =>
  createWorkspaceSchema(base(), {
    models,
    version: 'test',
    sdl: buildWorkspaceSDL(models),
  });
const context = (): WorkspaceContext => {
  const mongoose = new Mongoose();
  const eventHandlers: ScopedEventHandlers = () => () => ({
    sendDbEventLog: jest.fn(),
    sendAutomationTriggerTarget: jest.fn(),
    createActivityLog: jest.fn(),
    sendNotificationMessage: jest.fn(),
    getContext: () => ({ subdomain: 'tenant', userId: 'actor' }),
  });
  return {
    models: {
      DataModelDefinitions: mongoose.model<IDataModelDefinitionDocument>(
        'definitions',
        dataModelDefinitionSchema.clone(),
      ),
    },
    user: { _id: 'actor' },
    checkPermission: jest.fn().mockResolvedValue(undefined),
    eventHandlers,
  };
};
afterEach(() => jest.restoreAllMocks());

it('generates introspectable named output fields, typed inputs, enums, filters and ordering', () => {
  const schema = schemaFor([
    {
      model,
      fields: [
        definition(),
        definition({
          _id: 'price-id',
          name: 'purchasePrice',
          type: 'number',
          required: false,
        }),
        definition({
          _id: 'state-id',
          name: 'state',
          type: 'select',
          required: false,
          options: [{ label: 'Ready', value: 'ready' }],
        }),
      ],
    },
  ]);
  const sdl = printSchema(schema);
  expect(sdl).toContain('serialNumber: String');
  expect(sdl).toContain('purchasePrice: Float');
  expect(sdl).toContain('serialNumber: String!');
  expect(sdl).toContain('input DataModel_assetFilter');
  expect(sdl).toContain('enum DataModelField_5_asset_stateChoice');
  expect(sdl).not.toContain('propertiesData');
});

it('exposes relations as target object selections, accepts IDs in forward inputs and omits reverse write/filter inputs', async () => {
  const builtin = {
    ...model,
    _id: 'core:customer',
    name: 'customer',
    source: 'BUILTIN' as const,
  };
  const owner = definition({
    _id: 'customer-link',
    name: 'customer',
    type: 'relation',
    required: false,
    relation: {
      targetModelId: builtin._id,
      multiple: false,
      inverseFieldId: 'assets-link',
      isInverse: false,
    },
  });
  const inverse = definition({
    _id: 'assets-link',
    dataModelId: builtin._id,
    name: 'assets',
    type: 'relation',
    required: false,
    relation: {
      targetModelId: model._id,
      multiple: true,
      inverseFieldId: owner._id,
      isInverse: true,
    },
  });
  const schema = schemaFor([
    { model, fields: [owner] },
    { model: builtin, fields: [inverse] },
  ]);
  const sdl = printSchema(schema);
  expect(sdl).toContain('customer: Customer');
  expect(sdl).toContain(
    'assets(limit: Int = 25, offset: Int = 0): [DataModel_asset!]',
  );
  expect(
    sdl.match(/input DataModel_assetCreateInput \{([^}]+)\}/)?.[1],
  ).toContain('customer: String');
  expect(
    sdl.match(/input DataModel_customerUpdateInput \{([^}]+)\}/)?.[1],
  ).not.toContain('assets');
  const result = await graphql({
    schema,
    source:
      'mutation dataModelReverseWriteDenied {dataModel_customerUpdateFields(_id:"customer-a",expectedVersion:0,input:{assets:["asset-a"]}){_id}}',
  });
  expect(result.errors?.[0].message).toContain('not defined');
});

it('keeps generated field types collision-free across arbitrary model and field API names', () => {
  const choice = {
    type: 'select',
    options: [{ label: 'Ready', value: 'ready' }],
  };
  const schema = schemaFor([
    {
      model: { ...model, name: 'a' },
      fields: [definition({ name: 'b_c', ...choice })],
    },
    {
      model: { ...model, name: 'a_b' },
      fields: [definition({ name: 'c', ...choice })],
    },
    { model: { ...model, name: 'a_b_cchoice' }, fields: [] },
  ]);
  expect(printSchema(schema)).toContain('DataModelField_1_a_b_cChoice');
  expect(printSchema(schema)).toContain('DataModelField_3_a_b_cChoice');
});

it('maps typed named inputs to immutable storage identities and preserves zero / false', async () => {
  const fields = [
    definition(),
    definition({
      _id: 'price-id',
      name: 'purchasePrice',
      type: 'number',
      required: false,
    }),
    definition({
      _id: 'enabled-id',
      name: 'enabled',
      type: 'boolean',
      required: false,
    }),
  ];
  const record = await recordSetup().records.create(
    model._id,
    { propertiesData: {} },
    'actor',
  );
  const create = jest
    .spyOn(DataModelRecords.prototype, 'create')
    .mockResolvedValue({
      ...record,
      propertiesData: {
        'serial-id': 'SN-1',
        'price-id': 0,
        'enabled-id': false,
      },
    });
  const result = await graphql({
    schema: schemaFor([{ model, fields }]),
    contextValue: context(),
    source:
      'mutation dataModelTypedCreate { dataModel_assetCreate(input: { serialNumber: "SN-1", purchasePrice: 0, enabled: false }) { serialNumber purchasePrice enabled } }',
  });
  expect(result.errors).toBeUndefined();
  expect(result.data?.dataModel_assetCreate).toEqual({
    serialNumber: 'SN-1',
    purchasePrice: 0,
    enabled: false,
  });
  expect(create).toHaveBeenCalledWith(
    model._id,
    {
      propertiesData: {
        'serial-id': 'SN-1',
        'price-id': 0,
        'enabled-id': false,
      },
    },
    'actor',
  );
});

it.each([
  'mutation dataModelRequiredInput { dataModel_assetCreate(input: {}) { _id } }',
  'mutation dataModelUnknownInput { dataModel_assetCreate(input: { serialNumber: "x", foreignField: "x" }) { _id } }',
  'query dataModelUnknownSelection { dataModel_assetList { list { foreignField } } }',
])(
  'rejects invalid typed operations before persistence: %s',
  async (source) => {
    const create = jest.spyOn(DataModelRecords.prototype, 'create');
    const result = await graphql({
      schema: schemaFor([{ model, fields: [definition()] }]),
      contextValue: context(),
      source,
    });
    expect(result.errors?.length).toBeGreaterThan(0);
    expect(create).not.toHaveBeenCalled();
  },
);

it('does not leak another workspace’s fields, including introspection', async () => {
  const first = schemaFor([{ model, fields: [definition()] }]);
  const second = schemaFor([
    {
      model,
      fields: [definition({ _id: 'private', name: 'privateTenantField' })],
    },
  ]);
  expect(printSchema(first)).not.toContain('privateTenantField');
  expect(printSchema(second)).not.toContain('serialNumber');
  const result = await graphql({
    schema: first,
    source:
      'query dataModelTenantIsolation { dataModel_assetList { list { privateTenantField } } }',
  });
  expect(result.errors?.[0].message).toContain('Cannot query field');
});

it('preserves existing platform queries while adding model operations', async () => {
  const result = await graphql({
    schema: schemaFor([{ model, fields: [] }]),
    source: 'query dataModelPlatformCompatibility { health }',
  });
  expect(result.data?.health).toBe('ok');
});

it('enforces record permissions independently of schema discovery permission', async () => {
  const workspace = context();
  workspace.checkPermission = jest
    .fn()
    .mockRejectedValue(new Error('Record permission required'));
  const list = jest.spyOn(DataModelRecords.prototype, 'list');
  const result = await graphql({
    schema: schemaFor([{ model, fields: [] }]),
    contextValue: workspace,
    source: 'query dataModelReadDenied { dataModel_assetList { totalCount } }',
  });
  expect(result.errors?.[0].message).toBe('Record permission required');
  expect(list).not.toHaveBeenCalled();
});

it('selects a new field directly on the existing built-in GraphQL type, not legacy Properties data', async () => {
  const builtin = {
    ...model,
    _id: 'core:customer',
    name: 'customer',
    source: 'BUILTIN' as const,
  };
  const workspace = context();
  const collection = workspace.models.DataModelDefinitions.db.collection<{
    _id: string;
    version: number;
    propertiesData: Record<string, unknown>;
  }>('data_model_builtin_values');
  const find = jest.spyOn(collection, 'findOne').mockResolvedValue({
    _id: 'core:customer:customer-a',
    version: 3,
    propertiesData: { 'serial-id': 'owned-by-data-models' },
  });
  const result = await graphql({
    schema: schemaFor([
      { model: builtin, fields: [definition({ dataModelId: builtin._id })] },
    ]),
    contextValue: workspace,
    source:
      'query dataModelBuiltinSelection { customers { _id firstName serialNumber _dataModelVersion } }',
  });
  expect(result.errors).toBeUndefined();
  expect(result.data?.customers).toEqual([
    {
      _id: 'customer-a',
      firstName: 'Name',
      serialNumber: 'owned-by-data-models',
      _dataModelVersion: 3,
    },
  ]);
  expect(find).toHaveBeenCalledWith({
    _id: 'core:customer:customer-a',
    dataModelId: 'core:customer',
    recordId: 'customer-a',
  });
  expect(find).toHaveBeenCalledTimes(1);
});

it('writes typed built-in values to the tenant sidecar, checks business permissions and emits an audit event', async () => {
  const builtin = {
    ...model,
    _id: 'core:customer',
    name: 'customer',
    source: 'BUILTIN' as const,
  };
  const workspace = context();
  const connection = workspace.models.DataModelDefinitions.db;
  const original = connection.collection<{ _id: string }>('customers');
  jest.spyOn(original, 'findOne').mockResolvedValue({ _id: 'customer-a' });
  const originalWrite = jest.spyOn(original, 'updateOne');
  const sidecar = connection.collection<{ _id: string }>(
    'data_model_builtin_values',
  );
  jest.spyOn(sidecar, 'findOne').mockResolvedValue(null);
  const insert = jest.spyOn(sidecar, 'insertOne').mockResolvedValue({
    acknowledged: true,
    insertedId: 'core:customer:customer-a',
  });
  jest
    .spyOn(Query.prototype, 'exec')
    .mockResolvedValue([definition({ dataModelId: builtin._id })]);
  const handlers = workspace.eventHandlers('core')(
    'dataModels',
    'data_model_builtin_values',
  );
  workspace.eventHandlers = () => () => handlers;
  const audit = jest.spyOn(handlers, 'sendDbEventLog');
  const result = await graphql({
    schema: schemaFor([
      { model: builtin, fields: [definition({ dataModelId: builtin._id })] },
    ]),
    contextValue: workspace,
    source:
      'mutation dataModelBuiltinTypedWrite { dataModel_customerUpdateFields(_id: "customer-a", input: { serialNumber: "SN-2" }, expectedVersion: 0) { _id version serialNumber } }',
  });
  expect(result.errors).toBeUndefined();
  expect(result.data?.dataModel_customerUpdateFields).toEqual({
    _id: 'customer-a',
    version: 1,
    serialNumber: 'SN-2',
  });
  expect(workspace.checkPermission).toHaveBeenCalledWith('contactsUpdate');
  expect(insert).toHaveBeenCalledWith(
    expect.objectContaining({
      dataModelId: 'core:customer',
      recordId: 'customer-a',
      propertiesData: { 'serial-id': 'SN-2' },
      createdBy: 'actor',
      updatedBy: 'actor',
    }),
  );
  expect(originalWrite).not.toHaveBeenCalled();
  expect(audit).toHaveBeenCalledWith(
    expect.objectContaining({
      action: 'create',
      docId: 'core:customer:customer-a',
    }),
  );
});

it('rejects built-in extra-field writes when the original business permission is denied', async () => {
  const builtin = {
    ...model,
    _id: 'core:customer',
    name: 'customer',
    source: 'BUILTIN' as const,
  };
  const workspace = context();
  workspace.checkPermission = jest.fn(async (action: string) => {
    if (action === 'contactsUpdate')
      throw new Error('Business permission required');
  });
  const sidecar = workspace.models.DataModelDefinitions.db.collection<{
    _id: string;
  }>('data_model_builtin_values');
  const insert = jest.spyOn(sidecar, 'insertOne');
  const result = await graphql({
    schema: schemaFor([
      { model: builtin, fields: [definition({ dataModelId: builtin._id })] },
    ]),
    contextValue: workspace,
    source:
      'mutation dataModelBuiltinDeniedWrite { dataModel_customerUpdateFields(_id: "customer-a", input: { serialNumber: "SN-2" }, expectedVersion: 0) { _id } }',
  });
  expect(result.errors?.[0].message).toBe('Business permission required');
  expect(insert).not.toHaveBeenCalled();
});
