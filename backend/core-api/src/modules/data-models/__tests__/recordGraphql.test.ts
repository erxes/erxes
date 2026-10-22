import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';
import { Mongoose, Query, Types } from 'mongoose';
import type {
  EventDispatcherReturn,
  ScopedEventHandlers,
} from 'erxes-api-shared/core-modules';
import { dataModelDefinitionSchema } from '../db/definitions/dataModelDefinitions';
import { getDataModelRecordModel } from '../db/models/DataModelRecords';
import { dataModelQueries, dataModelMutations } from '../graphql/resolvers';
import {
  dataModelRecordQueries,
  dataModelRecordMutations,
} from '../graphql/records';
import { types, queries, mutations } from '../graphql/schema';
import type {
  IDataModelDefinition,
  IDataModelDefinitionDocument,
} from '../types';

const schema = makeExecutableSchema({
  typeDefs: `scalar Date\nscalar JSON\n${types}\ntype Query { ${queries} }\ntype Mutation { ${mutations} }`,
  resolvers: {
    Query: { ...dataModelQueries, ...dataModelRecordQueries },
    Mutation: { ...dataModelMutations, ...dataModelRecordMutations },
  },
});

const definition: IDataModelDefinition = {
  _id: 'a',
  name: 'asset',
  labelSingular: 'Asset',
  labelPlural: 'Assets',
  icon: 'IconDatabase',
  description: '',
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'admin',
  updatedBy: 'admin',
  archivedAt: null,
  archivedBy: null,
};

const setup = () => {
  const mongoose = new Mongoose();
  const definitions = mongoose.model<IDataModelDefinitionDocument>(
    'definitions',
    dataModelDefinitionSchema.clone(),
  );
  const sendDbEventLog = jest.fn<
    ReturnType<EventDispatcherReturn['sendDbEventLog']>,
    Parameters<EventDispatcherReturn['sendDbEventLog']>
  >();
  const dispatcher: EventDispatcherReturn = {
    sendDbEventLog,
    sendAutomationTriggerTarget: jest.fn(),
    createActivityLog: jest.fn(),
    sendNotificationMessage: jest.fn(),
    getContext: () => ({ subdomain: 'tenant', userId: 'actor' }),
  };
  const eventHandlers: ScopedEventHandlers = () => () => dispatcher;
  const context = {
    models: {
      DataModelDefinitions: definitions,
    },
    user: { _id: 'actor' },
    eventHandlers,
    checkPermission: jest
      .fn<Promise<void>, [string]>()
      .mockResolvedValue(undefined),
  };
  return { context, sendDbEventLog };
};

afterEach(() => jest.restoreAllMocks());

describe('custom record executable GraphQL', () => {
  it.each([
    [
      'query dataModelRecordReadDenied { dataModelRecordDetail(dataModelId: "a", _id: "r") { _id } }',
      'dataModelRecordsRead',
    ],
    [
      'query dataModelRecordListDenied { dataModelRecordList(dataModelId: "a") { totalCount } }',
      'dataModelRecordsRead',
    ],
    [
      'mutation dataModelRecordCreateDenied { dataModelRecordCreate(dataModelId: "a", input: { propertiesData: {} }) { _id } }',
      'dataModelRecordsCreate',
    ],
    [
      'mutation dataModelRecordUpdateDenied { dataModelRecordUpdate(dataModelId: "a", _id: "r", expectedVersion: 1, input: { propertiesData: {} }) { _id } }',
      'dataModelRecordsUpdate',
    ],
    [
      'mutation dataModelRecordRemoveDenied { dataModelRecordRemove(dataModelId: "a", _id: "r", expectedVersion: 1) { _id } }',
      'dataModelRecordsDelete',
    ],
    [
      'mutation dataModelRecordRestoreDenied { dataModelRecordRestore(dataModelId: "a", _id: "r", expectedVersion: 1) { _id } }',
      'dataModelRecordsUpdate',
    ],
  ])(
    'checks the record action before accessing metadata or storage: %s',
    async (source, permission) => {
      const { context, sendDbEventLog } = setup();
      context.checkPermission.mockRejectedValue(new Error('Permission denied'));
      const execute = jest.spyOn(Query.prototype, 'exec');
      const result = await graphql({ schema, contextValue: context, source });
      expect(result.errors?.[0].message).toBe('Permission denied');
      expect(context.checkPermission).toHaveBeenCalledWith(permission);
      expect(execute).not.toHaveBeenCalled();
      expect(sendDbEventLog).not.toHaveBeenCalled();
    },
  );

  it('does not treat schema-management permission as record access', async () => {
    const { context } = setup();
    context.checkPermission.mockImplementation(async (action) => {
      if (action !== 'dataModelsManage')
        throw new Error('Record permission required');
    });
    const result = await graphql({
      schema,
      contextValue: context,
      source:
        'query dataModelRecordsSeparatePermissions { dataModelRecordList(dataModelId: "a") { totalCount } }',
    });
    expect(result.errors?.[0].message).toBe('Record permission required');
  });

  it('requires login independently of configured permissions', async () => {
    const { context } = setup();
    const result = await graphql({
      schema,
      contextValue: { ...context, user: null },
      source:
        'query dataModelRecordsAnonymous { dataModelRecordList(dataModelId: "a") { totalCount } }',
    });
    expect(result.errors?.[0].message).toBe('Authentication required');
    expect(context.checkPermission).not.toHaveBeenCalled();
  });

  it('creates a record through real schema/model adapters, with strict Properties validation', async () => {
    const { context, sendDbEventLog } = setup();
    const execute = jest.spyOn(Query.prototype, 'exec');
    execute.mockResolvedValueOnce(definition).mockResolvedValueOnce([
      {
        _id: 'enabled',
        name: 'enabled',
        label: 'Enabled',
        type: 'boolean',
        required: true,
      },
    ]);
    const recordModel = getDataModelRecordModel(
      context.models.DataModelDefinitions.db,
      'a',
    );
    jest.spyOn(recordModel, 'init').mockResolvedValue(new recordModel());
    const insert = jest
      .spyOn(recordModel.collection, 'insertOne')
      .mockResolvedValue({
        acknowledged: true,
        insertedId: new Types.ObjectId(),
      });
    const result = await graphql({
      schema,
      contextValue: context,
      source: `mutation dataModelRecordCreateBoolean {
        dataModelRecordCreate(dataModelId: "a", input: { propertiesData: { enabled: false } }) {
          _id dataModelId propertiesData version createdBy
        }
      }`,
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.dataModelRecordCreate).toMatchObject({
      _id: expect.any(String),
      dataModelId: 'a',
      propertiesData: { enabled: false },
      version: 1,
      createdBy: 'actor',
    });
    expect(execute.mock.contexts[1].getFilter()).toEqual({
      dataModelId: 'a',
      archivedAt: null,
    });
    expect(insert).toHaveBeenCalledTimes(1);
    expect(sendDbEventLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'create' }),
    );
  });

  it('resolves detail through model- and tenant-bound persistence', async () => {
    const { context } = setup();
    const execute = jest.spyOn(Query.prototype, 'exec');
    execute.mockResolvedValueOnce(definition).mockResolvedValueOnce({
      _id: 'r',
      dataModelId: 'a',
      propertiesData: { enabled: false },
      version: 2,
    });
    const result = await graphql({
      schema,
      contextValue: context,
      source:
        'query dataModelRecordDetailBoolean { dataModelRecordDetail(dataModelId: "a", _id: "r") { _id dataModelId propertiesData version } }',
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.dataModelRecordDetail).toEqual({
      _id: 'r',
      dataModelId: 'a',
      propertiesData: { enabled: false },
      version: 2,
    });
    expect(execute.mock.contexts[1].getFilter()).toEqual({
      _id: 'r',
      dataModelId: 'a',
      deletedAt: null,
    });
  });

  it('rejects archived models before opening their record collection', async () => {
    const { context } = setup();
    jest
      .spyOn(Query.prototype, 'exec')
      .mockResolvedValueOnce({ ...definition, archivedAt: new Date() });
    const result = await graphql({
      schema,
      contextValue: context,
      source:
        'query dataModelRecordsArchived { dataModelRecordList(dataModelId: "a") { totalCount } }',
    });
    expect(result.errors?.[0].message).toContain('Restore the data model');
    expect(
      context.models.DataModelDefinitions.db.models.data_model_records_a,
    ).toBeUndefined();
  });
});
