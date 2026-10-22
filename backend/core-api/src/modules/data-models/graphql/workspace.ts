import { createHash } from 'node:crypto';
import {
  extendSchema,
  parse,
  isObjectType,
  type GraphQLSchema,
  type GraphQLFieldResolver,
} from 'graphql';
import type { Connection } from 'mongoose';
import type { ScopedEventHandlers } from 'erxes-api-shared/core-modules';
import {
  BUILTIN_GRAPHQL_TYPES,
  getDataModelFieldModel,
  type IDataModelField,
} from '../fields/registry';
import { createDataModelDefinitionStore } from '../db/models/DataModelDefinitions';
import { createDataModelRecordStore } from '../db/models/DataModelRecords';
import { DataModelRegistry } from '../registry';
import { DataModelRecords } from '../records/service';
import {
  createDataModelRecordFields,
  validateDataModelRecordPatch,
} from '../records/fields';
import { createDataModelRecordEvents } from '../records/events';
import type { IDataModel } from '../types';
import type { DataModelContext } from './context';
import { DATA_MODEL_BUILTIN_ACCESS, DataModelRelations } from '../relations';

export interface WorkspaceContext extends DataModelContext {
  eventHandlers: ScopedEventHandlers;
  builtinValueLoads?: Map<string, Promise<BuiltinValues | null>>;
}

export interface WorkspaceModel {
  model: IDataModel;
  fields: IDataModelField[];
}
export interface WorkspaceSnapshot {
  models: WorkspaceModel[];
  version: string;
  sdl: string;
}

// Separate field-type namespace and a length-prefixed model name prevent
// collisions such as a.b_c vs a_b.c or a field enum vs a custom object type.
const fieldTypeName = (model: IDataModel, field: IDataModelField): string =>
  `DataModelField_${model.name.length}_${model.name}_${field.name}`;

const fieldType = (
  model: IDataModel,
  field: IDataModelField,
  models: WorkspaceModel[] = [],
  input = false,
): string => {
  if (field.type === 'relation') {
    if (!field.relation) throw new Error('Relation configuration is missing');
    const target = models.find(
      (entry) => entry.model._id === field.relation?.targetModelId,
    )?.model;
    if (!target)
      throw new Error('Relation target is not active in this workspace');
    const type = input
      ? 'String'
      : target.source === 'BUILTIN'
      ? BUILTIN_GRAPHQL_TYPES[target.name]
      : `DataModel_${target.name}`;
    if (!type) throw new Error('Unsupported relation target');
    return field.relation.multiple ? `[${type}!]` : type;
  }
  if (['select', 'radio', 'multiSelect', 'check'].includes(field.type)) {
    const name = `${fieldTypeName(model, field)}Choice`;
    return ['multiSelect', 'check'].includes(field.type) ? `[${name}!]` : name;
  }
  return (
    (
      {
        number: 'Float',
        boolean: 'Boolean',
        date: 'Date',
        list: '[String!]',
      } as Record<string, string>
    )[field.type] ?? 'String'
  );
};
const scalarType = (type: string): string => type.replace(/\[|\]|!/g, '');

export const buildWorkspaceSDL = (models: WorkspaceModel[]): string => {
  const definitions = ['enum DataModelSortDirection { ASC DESC }'];
  const queries: string[] = [];
  const mutations: string[] = [];
  for (const { model, fields } of models) {
    const name = `DataModel_${model.name}`;
    const writable = fields.filter((field) => !field.relation?.isInverse);
    const output = fields
      .map(
        (field) =>
          `${JSON.stringify(field.description || field.label)} ${field.name}${
            field.relation?.isInverse
              ? '(limit: Int = 25, offset: Int = 0)'
              : ''
          }: ${fieldType(model, field, models)}`,
      )
      .join('\n');
    for (const field of fields) {
      if (['select', 'radio', 'multiSelect', 'check'].includes(field.type))
        definitions.push(
          `enum ${scalarType(fieldType(model, field))} { ${field.options
            .map((option) => `${JSON.stringify(option.label)} ${option.value}`)
            .join(' ')} }`,
        );
    }
    const updateFields = writable
      .map((field) => `${field.name}: ${fieldType(model, field, models, true)}`)
      .join('\n');
    definitions.push(
      `input ${name}UpdateInput { _modelVersion: Int ${updateFields} }`,
    );
    if (model.source === 'BUILTIN') {
      if (!fields.length) continue;
      const builtinType = BUILTIN_GRAPHQL_TYPES[model.name];
      if (!builtinType) continue;
      definitions.push(
        `extend type ${builtinType} { _dataModelVersion: Int ${output} }`,
        `type ${name}Fields { _id: String! version: Int! ${output} }`,
      );
      queries.push(
        `dataModel_${model.name}Fields(_id: String!): ${name}Fields! @deprecated(reason: "Select model fields on existing business queries")`,
      );
      mutations.push(
        `dataModel_${model.name}UpdateFields(_id: String!, input: ${name}UpdateInput!, expectedVersion: Int!): ${name}Fields!`,
      );
      continue;
    }
    definitions.push(
      `type ${name} { _id: String! dataModelId: String! version: Int! createdAt: Date! updatedAt: Date! createdBy: String! updatedBy: String! deletedAt: Date deletedBy: String ${output} }`,
      `type ${name}List { list: [${name}!]! totalCount: Int! }`,
      `input ${name}CreateInput { _modelVersion: Int ${writable
        .map(
          (field) =>
            `${field.name}: ${fieldType(model, field, models, true)}${
              field.required && !field.relation?.morphId ? '!' : ''
            }`,
        )
        .join('\n')} }`,
    );
    for (const field of writable) {
      const type = fieldType(model, field, models, true);
      const scalar = scalarType(type);
      const range = ['number', 'date'].includes(field.type)
        ? `gt: ${scalar} gte: ${scalar} lt: ${scalar} lte: ${scalar}`
        : '';
      const contains = ['text', 'textarea', 'phone'].includes(field.type)
        ? 'contains: String'
        : '';
      definitions.push(
        `input ${fieldTypeName(
          model,
          field,
        )}Filter { eq: ${type} ne: ${type} in: [${scalar}!] isEmpty: Boolean ${range} ${contains} }`,
      );
    }
    definitions.push(
      `input ${name}Filter { _id: String ${writable
        .map((field) => `${field.name}: ${fieldTypeName(model, field)}Filter`)
        .join(' ')} }`,
      `enum ${name}SortField { _id createdAt updatedAt ${fields
        .filter(
          (field) =>
            !['list', 'multiSelect', 'check', 'relation'].includes(field.type),
        )
        .map((field) => field.name)
        .join(' ')} }`,
      `input ${name}Sort { field: ${name}SortField! direction: DataModelSortDirection! }`,
    );
    queries.push(
      `dataModel_${model.name}List(limit: Int = 25, offset: Int = 0, deleted: Boolean = false, filter: ${name}Filter, sort: ${name}Sort): ${name}List!`,
      `dataModel_${model.name}Detail(_id: String!): ${name}!`,
    );
    mutations.push(
      `dataModel_${model.name}Create(input: ${name}CreateInput!): ${name}!`,
      `dataModel_${model.name}Update(_id: String!, input: ${name}UpdateInput!, expectedVersion: Int!): ${name}!`,
      `dataModel_${model.name}Remove(_id: String!, expectedVersion: Int!): ${name}!`,
      `dataModel_${model.name}Restore(_id: String!, input: ${name}UpdateInput, expectedVersion: Int!): ${name}!`,
    );
  }
  if (queries.length)
    definitions.push(`extend type Query { ${queries.join('\n')} }`);
  if (mutations.length)
    definitions.push(`extend type Mutation { ${mutations.join('\n')} }`);
  return definitions.join('\n');
};

export const getWorkspaceSnapshot = async (
  context: DataModelContext,
): Promise<WorkspaceSnapshot> => {
  if (!context.user?._id) throw new Error('Authentication required');
  await context.checkPermission('dataModelsRead');
  const registry = new DataModelRegistry(
    createDataModelDefinitionStore(context.models.DataModelDefinitions),
  );
  const catalog = await registry.list({ limit: 200, offset: 0 });
  if (catalog.totalCount > 1000)
    throw new Error('The workspace exceeds the active data model limit');
  while (catalog.list.length < catalog.totalCount) {
    const next = await registry.list({
      limit: 200,
      offset: catalog.list.length,
    });
    if (!next.list.length)
      throw new Error('Model catalog changed while building the schema; retry');
    catalog.list.push(...next.list);
    catalog.totalCount = next.totalCount;
  }
  const definitions = await getDataModelFieldModel(
    context.models.DataModelDefinitions.db,
  )
    .find({ archivedAt: null })
    .sort({ dataModelId: 1, name: 1 })
    .lean<IDataModelField[]>()
    .exec();
  const models = catalog.list.map((model) => ({
    model,
    fields: definitions.filter((field) => field.dataModelId === model._id),
  }));
  // Publish a grouped relation only when every concrete pair is active and complete.
  const paired = (field: IDataModelField): boolean =>
    !field.relation ||
    (models.some(
      (entry) => entry.model._id === field.relation?.targetModelId,
    ) &&
      definitions.some(
        (inverse) =>
          inverse._id === field.relation?.inverseFieldId &&
          inverse.relation?.inverseFieldId === field._id,
      ));
  const complete = (field: IDataModelField): boolean => {
    if (!paired(field)) return false;
    const owner = field.relation?.isInverse
      ? definitions.find(
          (entry) => entry._id === field.relation?.inverseFieldId,
        )
      : field;
    if (!owner?.relation?.morphId) return true;
    const members = definitions.filter(
      (entry) =>
        entry.dataModelId === owner.dataModelId &&
        entry.relation?.morphId === owner.relation?.morphId,
    );
    return members.length === owner.relation.morphSize && members.every(paired);
  };
  for (const entry of models) entry.fields = entry.fields.filter(complete);
  const sdl = buildWorkspaceSDL(models);
  if (Buffer.byteLength(sdl, 'utf8') > 5 * 1024 * 1024)
    throw new Error(
      'Workspace GraphQL schema exceeds 5 MiB; archive unused models or fields',
    );
  return {
    models,
    sdl,
    version: createHash('sha256')
      .update(sdl)
      .update(JSON.stringify(models))
      .digest('hex'),
  };
};

const service = (context: WorkspaceContext): DataModelRecords =>
  new DataModelRecords({
    registry: new DataModelRegistry(
      createDataModelDefinitionStore(context.models.DataModelDefinitions),
    ),
    fields: createDataModelRecordFields(
      context.models.DataModelDefinitions.db,
      context.checkPermission,
    ),
    store: (id) =>
      createDataModelRecordStore(context.models.DataModelDefinitions.db, id),
    emit: createDataModelRecordEvents(context.eventHandlers),
  });

const valuesById = (
  model: IDataModel,
  fields: IDataModelField[],
  input: Record<string, unknown> = {},
): Record<string, unknown> => {
  if (
    input._modelVersion !== undefined &&
    input._modelVersion !== model.version
  )
    throw new Error('Model changed; reload its definition');
  return Object.fromEntries(
    fields
      .filter((field) =>
        Object.prototype.hasOwnProperty.call(input, field.name),
      )
      .map((field) => [field._id, input[field.name]]),
  );
};

const authorizeRecord = async (
  context: WorkspaceContext,
  action: string,
): Promise<string> => {
  if (!context.user?._id) throw new Error('Authentication required');
  await context.checkPermission(action);
  return context.user._id;
};

interface RecordSource {
  _id: string;
  version?: number;
  propertiesData?: Record<string, unknown>;
  dataModelFieldValues?: Record<string, unknown>;
}
interface RecordArgs {
  _id: string;
  expectedVersion: number;
  input?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  deleted?: boolean;
  filter?: Record<string, Record<string, unknown>>;
  sort?: { field: string; direction: string };
}

export const createWorkspaceSchema = (
  base: GraphQLSchema,
  snapshot: WorkspaceSnapshot,
): GraphQLSchema => {
  const schema = extendSchema(base, parse(snapshot.sdl));
  const install = (
    typeName: string,
    fieldName: string,
    resolve: GraphQLFieldResolver<unknown, WorkspaceContext, RecordArgs>,
  ): void => {
    const type = schema.getType(typeName);
    if (!isObjectType(type) || !type.getFields()[fieldName])
      throw new Error(`Missing generated field ${typeName}.${fieldName}`);
    type.getFields()[fieldName].resolve = resolve;
  };
  for (const { model, fields } of snapshot.models) {
    const name = `DataModel_${model.name}`;
    if (model.source === 'BUILTIN') {
      if (!fields.length) continue;
      const builtinType = BUILTIN_GRAPHQL_TYPES[model.name];
      if (!builtinType) continue;
      for (const field of fields) {
        const read: GraphQLFieldResolver<unknown, WorkspaceContext> = async (
          source: RecordSource,
          _args,
          context,
        ) => {
          const values =
            source.dataModelFieldValues ??
            (await loadBuiltinRecord(context, model, source._id))
              ?.propertiesData;
          if (field.relation)
            return new DataModelRelations(
              context.models.DataModelDefinitions.db,
              context.checkPermission,
            ).resolve(field, source._id, values?.[field._id], _args);
          return values?.[field._id] ?? null;
        };
        install(builtinType, field.name, read);
        install(`${name}Fields`, field.name, read);
      }
      install(
        builtinType,
        '_dataModelVersion',
        async (source: RecordSource, _args, context) =>
          (await loadBuiltinRecord(context, model, source._id))?.version ?? 0,
      );
      install(
        'Query',
        `dataModel_${model.name}Fields`,
        async (_root, args, context) => {
          const record = await loadBuiltinRecord(context, model, args._id);
          return {
            _id: args._id,
            version: record?.version ?? 0,
            dataModelFieldValues: record?.propertiesData ?? {},
          };
        },
      );
      install(
        'Mutation',
        `dataModel_${model.name}UpdateFields`,
        async (_root, args, context) =>
          updateBuiltinValues(context, model, fields, args),
      );
      continue;
    }
    for (const field of fields)
      install(name, field.name, async (source: RecordSource, args, context) =>
        field.relation
          ? new DataModelRelations(
              context.models.DataModelDefinitions.db,
              context.checkPermission,
            ).resolve(
              field,
              source._id,
              source.propertiesData?.[field._id],
              args,
            )
          : source.propertiesData?.[field._id] ?? null,
      );
    install(
      'Query',
      `dataModel_${model.name}List`,
      async (_root, args, context) => {
        await authorizeRecord(context, 'dataModelRecordsRead');
        const filters = Object.entries(args.filter ?? {})
          .filter(([fieldName]) => fieldName !== '_id')
          .flatMap(([fieldName, conditions]) => {
            const field = fields.find((entry) => entry.name === fieldName);
            if (!field) throw new Error('Unknown filter field');
            return Object.entries(conditions).map(([operator, value]) => ({
              fieldId: field._id,
              operator:
                operator === 'isEmpty'
                  ? value
                    ? 'IS_EMPTY'
                    : 'IS_NOT_EMPTY'
                  : operator.toUpperCase(),
              ...(operator === 'isEmpty' ? {} : { value }),
            }));
          });
        const sortField = args.sort
          ? fields.find((field) => field.name === args.sort?.field)?._id ??
            args.sort.field
          : undefined;
        return service(context).list(model._id, {
          limit: args.limit ?? 25,
          offset: args.offset ?? 0,
          deleted: args.deleted ?? false,
          filters,
          ...(args.filter &&
          Object.prototype.hasOwnProperty.call(args.filter, '_id')
            ? { recordId: args.filter._id }
            : {}),
          ...(args.sort ? { sort: { ...args.sort, field: sortField } } : {}),
        });
      },
    );
    install(
      'Query',
      `dataModel_${model.name}Detail`,
      async (_root, args, context) => {
        await authorizeRecord(context, 'dataModelRecordsRead');
        return service(context).get(model._id, args._id);
      },
    );
    for (const action of ['Create', 'Update', 'Remove', 'Restore'] as const) {
      install(
        'Mutation',
        `dataModel_${model.name}${action}`,
        async (_root, args, context) => {
          const actor = await authorizeRecord(
            context,
            `dataModelRecords${
              action === 'Remove'
                ? 'Delete'
                : action === 'Restore'
                ? 'Update'
                : action
            }`,
          );
          const records = service(context);
          const input = {
            propertiesData: valuesById(model, fields, args.input),
          };
          if (action === 'Create')
            return records.create(model._id, input, actor);
          if (action === 'Update')
            return records.update(
              model._id,
              args._id,
              input,
              args.expectedVersion,
              actor,
            );
          if (action === 'Restore')
            return records.restore(
              model._id,
              args._id,
              args.expectedVersion,
              actor,
              input,
            );
          return records.remove(
            model._id,
            args._id,
            args.expectedVersion,
            actor,
          );
        },
      );
    }
  }
  return schema;
};

const builtinActions = DATA_MODEL_BUILTIN_ACCESS;

interface BuiltinValues {
  _id: string;
  dataModelId: string;
  recordId: string;
  version: number;
  propertiesData: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}
const builtinCollection = (connection: Connection) =>
  connection.collection<BuiltinValues>('data_model_builtin_values');

const loadBuiltinRecord = async (
  context: WorkspaceContext,
  model: IDataModel,
  id: string,
): Promise<BuiltinValues | null> => {
  await authorizeRecord(context, 'dataModelRecordsRead');
  await context.checkPermission(builtinActions[model.name].read);
  context.builtinValueLoads ??= new Map();
  const key = `${model._id}:${id}`;
  let load = context.builtinValueLoads.get(key);
  if (!load) {
    load = builtinCollection(context.models.DataModelDefinitions.db).findOne({
      _id: key,
      dataModelId: model._id,
      recordId: id,
    });
    context.builtinValueLoads.set(key, load);
  }
  return load;
};

const updateBuiltinValues = async (
  context: WorkspaceContext,
  model: IDataModel,
  fields: IDataModelField[],
  args: RecordArgs,
): Promise<RecordSource> => {
  const actor = await authorizeRecord(context, 'dataModelRecordsUpdate');
  const target = builtinActions[model.name];
  await context.checkPermission(target.update);
  const connection = context.models.DataModelDefinitions.db;
  if (
    !(await connection
      .collection<{ _id: string }>(target.collection)
      .findOne({ _id: args._id }, { projection: { _id: 1 } }))
  )
    throw new Error('Built-in record not found');
  const collection = builtinCollection(connection);
  const key = `${model._id}:${args._id}`;
  const previous = await collection.findOne({
    _id: key,
    dataModelId: model._id,
    recordId: args._id,
  });
  if ((previous?.version ?? 0) !== args.expectedVersion)
    throw new Error('Record fields changed; reload before saving');
  const provider = createDataModelRecordFields(
    connection,
    context.checkPermission,
  );
  const propertiesData = await validateDataModelRecordPatch(
    await provider.list(model._id),
    provider.validate,
    valuesById(model, fields, args.input),
    previous?.propertiesData,
  );
  const now = new Date();
  const current: BuiltinValues = {
    _id: key,
    dataModelId: model._id,
    recordId: args._id,
    version: (previous?.version ?? 0) + 1,
    propertiesData,
    createdBy: previous?.createdBy ?? actor,
    createdAt: previous?.createdAt ?? now,
    updatedBy: actor,
    updatedAt: now,
  };
  if (!previous) {
    try {
      await collection.insertOne(current);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 11000)
        throw new Error('Record fields changed; reload before saving');
      throw error;
    }
  } else {
    const updated = await collection.updateOne(
      { _id: key, dataModelId: model._id, version: args.expectedVersion },
      {
        $set: { propertiesData, updatedBy: actor, updatedAt: now },
        $inc: { version: 1 },
      },
    );
    if (!updated.modifiedCount)
      throw new Error('Record fields changed; reload before saving');
  }
  const { sendDbEventLog } = context.eventHandlers('core')(
    'dataModels',
    'data_model_builtin_values',
  );
  if (previous)
    sendDbEventLog({
      action: 'update',
      docId: key,
      currentDocument: current,
      prevDocument: previous,
    });
  else
    sendDbEventLog({ action: 'create', docId: key, currentDocument: current });
  context.builtinValueLoads?.delete(key);
  return {
    _id: args._id,
    version: (previous?.version ?? 0) + 1,
    dataModelFieldValues: propertiesData,
  };
};
