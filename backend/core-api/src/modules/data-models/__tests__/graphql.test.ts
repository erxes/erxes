import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';
import { Mongoose, Query } from 'mongoose';
import { dataModelDefinitionSchema } from '../db/definitions/dataModelDefinitions';
import { dataModelMutations, dataModelQueries } from '../graphql/resolvers';
import { mutations, queries, types } from '../graphql/schema';
import type { IDataModelDefinitionDocument } from '../types';

const createContext = () => {
  const mongoose = new Mongoose();
  const model = mongoose.model<IDataModelDefinitionDocument>(
    'data_model_definitions',
    dataModelDefinitionSchema.clone(),
  );
  return {
    models: { DataModelDefinitions: model },
    user: { _id: 'admin' },
    checkPermission: jest
      .fn<Promise<void>, [string]>()
      .mockResolvedValue(undefined),
  };
};

const schema = makeExecutableSchema({
  typeDefs: `scalar Date\nscalar JSON\n${types}\ntype Query { ${queries} }\ntype Mutation { ${mutations} }`,
  resolvers: { Query: dataModelQueries, Mutation: dataModelMutations },
});

describe('data model GraphQL contract', () => {
  afterEach(() => jest.restoreAllMocks());
  it('exposes protected built-ins through the executable schema', async () => {
    jest.spyOn(Query.prototype, 'exec').mockResolvedValue(null);
    const contextValue = createContext();
    const result = await graphql({
      schema,
      contextValue,
      source:
        'query dataModelRegistryCompany { dataModelDetail(_id: "core:company") { _id source contentType systemFields { code } } }',
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.dataModelDetail).toMatchObject({
      _id: 'core:company',
      source: 'BUILTIN',
      contentType: 'core:company',
    });
    expect(contextValue.checkPermission).toHaveBeenCalledWith('dataModelsRead');
  });

  it('rejects built-in archive mutations even for an authorized manager', async () => {
    jest.spyOn(Query.prototype, 'exec').mockResolvedValue(null);
    const contextValue = createContext();
    const result = await graphql({
      schema,
      contextValue,
      source:
        'mutation dataModelRegistryProtectCompany { dataModelArchive(_id: "core:company", expectedVersion: 1) { _id } }',
    });
    expect(result.errors?.[0].message).toContain(
      'Built-in models cannot be changed',
    );
    expect(contextValue.checkPermission).toHaveBeenCalledWith(
      'dataModelsManage',
    );
  });

  it.each([
    'query dataModelRegistryReadDenied { dataModelDetail(_id: "core:company") { _id } }',
    'query dataModelRegistryListDenied { dataModelList { totalCount } }',
    'mutation dataModelRegistryCreateDenied { dataModelCreate(input: { name: "asset", labelSingular: "Asset", labelPlural: "Assets" }) { _id } }',
    'mutation dataModelRegistryUpdateDenied { dataModelUpdate(_id: "custom", input: { labelSingular: "Changed" }, expectedVersion: 1) { _id } }',
    'mutation dataModelRegistryArchiveDenied { dataModelArchive(_id: "custom", expectedVersion: 1) { _id } }',
    'mutation dataModelRegistryRestoreDenied { dataModelRestore(_id: "custom", expectedVersion: 1) { _id } }',
  ])('checks permissions before accessing persistence: %s', async (source) => {
    const contextValue = createContext();
    const read = jest.spyOn(
      contextValue.models.DataModelDefinitions,
      'findOne',
    );
    const list = jest.spyOn(contextValue.models.DataModelDefinitions, 'find');
    const create = jest.spyOn(
      contextValue.models.DataModelDefinitions,
      'create',
    );
    contextValue.checkPermission.mockRejectedValue(
      new Error('Permission denied'),
    );
    const result = await graphql({ schema, contextValue, source });
    expect(result.errors?.[0].message).toBe('Permission denied');
    expect(read).not.toHaveBeenCalled();
    expect(list).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('requires a signed-in user even when the permission function would allow access', async () => {
    const context = createContext();
    const result = await graphql({
      schema,
      contextValue: { ...context, user: null },
      source:
        'query dataModelRegistryAnonymous { dataModelDetail(_id: "core:company") { _id } }',
    });
    expect(result.errors?.[0].message).toBe('Authentication required');
    expect(context.checkPermission).not.toHaveBeenCalled();
  });

  it('does not admit protected settings through GraphQL inputs', async () => {
    const contextValue = createContext();
    const result = await graphql({
      schema,
      contextValue,
      source:
        'mutation dataModelRegistryInjectOwner { dataModelCreate(input: { name: "asset", labelSingular: "Asset", labelPlural: "Assets", source: BUILTIN }) { _id } }',
    });
    expect(result.errors?.[0].message).toContain('is not defined by type');
    expect(contextValue.checkPermission).not.toHaveBeenCalled();
  });
});

describe('data model persistence schema', () => {
  it('uses immutable identity and a tenant-local unique name index', () => {
    expect(dataModelDefinitionSchema.path('name').options.immutable).toBe(true);
    expect(dataModelDefinitionSchema.path('createdBy').options.immutable).toBe(
      true,
    );
    expect(dataModelDefinitionSchema.indexes()).toContainEqual([
      { name: 1 },
      expect.objectContaining({ unique: true }),
    ]);
  });

  it('validates required definition fields without a database', async () => {
    const { models } = createContext();
    const definition = new models.DataModelDefinitions({
      _id: 'custom',
      name: 'asset',
      labelSingular: 'Asset',
      labelPlural: 'Assets',
      createdBy: 'admin',
      updatedBy: 'admin',
    });
    await expect(definition.validate()).resolves.toBeUndefined();
    definition.name = '$where';
    await expect(definition.validate()).rejects.toThrow();
  });

  it('registers separate tenant model connections, not global models', () => {
    const first = createContext();
    const second = createContext();
    expect(first.models.DataModelDefinitions.db).not.toBe(
      second.models.DataModelDefinitions.db,
    );
  });
});
