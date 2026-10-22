import type { GraphQLResolveInfo } from 'graphql';
import {
  BUILTIN_GRAPHQL_TYPES,
  DataModelFields,
  type IDataModelField,
} from '../fields/registry';
import { authorizeDataModel, type DataModelContext } from './context';
import { getWorkspaceSnapshot } from './workspace';
import { DATA_MODEL_RECORD_FIELD_TYPES } from '../records/types';
import { DataModelRelations } from '../relations';

const authorize = async (context: DataModelContext, action: string) => {
  const { registry, actorId } = await authorizeDataModel(context, action);
  return {
    fields: new DataModelFields(
      context.models.DataModelDefinitions.db,
      registry,
    ),
    actorId,
    registry,
  };
};

export interface DataModelFieldIdentity {
  dataModelId: string;
  _id: string;
  expectedVersion: number;
}

export const dataModelFieldQueries = {
  dataModelRelationOptions: async (
    _root: unknown,
    {
      fieldId,
      search,
      limit,
      offset,
      recordIds,
    }: {
      fieldId: string;
      search: string;
      limit: number;
      offset: number;
      recordIds?: string[] | null;
    },
    context: DataModelContext,
  ) => {
    await authorizeDataModel(context, 'dataModelsRead');
    return new DataModelRelations(
      context.models.DataModelDefinitions.db,
      context.checkPermission,
    ).options(fieldId, search, limit, offset, recordIds);
  },
  dataModelWorkspaceSchema: async (
    _root: unknown,
    _args: unknown,
    context: DataModelContext,
  ): Promise<{ version: string; sdl: string }> => {
    const { version, sdl } = await getWorkspaceSnapshot(context);
    return { version, sdl };
  },
  dataModelFieldList: async (
    _root: unknown,
    { dataModelId, archived }: { dataModelId: string; archived?: boolean },
    context: DataModelContext,
  ): Promise<IDataModelField[]> => {
    const { fields } = await authorize(context, 'dataModelsRead');
    return fields.list(dataModelId, archived ?? false);
  },
};

export const dataModelFieldMutations = {
  dataModelFieldCreate: async (
    _root: unknown,
    { dataModelId, input }: { dataModelId: string; input: unknown },
    context: DataModelContext,
    info: GraphQLResolveInfo,
  ): Promise<IDataModelField> => {
    const { fields, actorId, registry } = await authorize(
      context,
      'dataModelsManage',
    );
    const model = await registry.get(dataModelId);
    const type = info.schema.getType(BUILTIN_GRAPHQL_TYPES[model.name] ?? '');
    const reserved =
      type && 'getFields' in type ? Object.keys(type.getFields()) : [];
    const targetReserved: Record<string, string[]> = {};
    const relation =
      typeof input === 'object' && input !== null && 'relation' in input
        ? input.relation
        : undefined;
    const targetIds =
      typeof relation === 'object' && relation !== null
        ? 'targetModelIds' in relation && Array.isArray(relation.targetModelIds)
          ? relation.targetModelIds
          : 'targetModelId' in relation
          ? [relation.targetModelId]
          : []
        : [];
    for (const targetId of targetIds) {
      if (typeof targetId !== 'string') continue;
      const target = await registry.get(targetId);
      const targetType = info.schema.getType(
        BUILTIN_GRAPHQL_TYPES[target.name] ?? '',
      );
      targetReserved[targetId] =
        targetType && 'getFields' in targetType
          ? Object.keys(targetType.getFields())
          : [];
    }
    return fields.create(dataModelId, input, actorId, reserved, targetReserved);
  },
  dataModelFieldUpdate: async (
    _root: unknown,
    {
      dataModelId,
      _id,
      expectedVersion,
      input,
    }: DataModelFieldIdentity & { input: unknown },
    context: DataModelContext,
  ): Promise<IDataModelField> => {
    const { fields, actorId } = await authorize(context, 'dataModelsManage');
    return fields.update(dataModelId, _id, input, expectedVersion, actorId);
  },
  dataModelFieldArchive: async (
    _root: unknown,
    { dataModelId, _id, expectedVersion }: DataModelFieldIdentity,
    context: DataModelContext,
  ): Promise<IDataModelField> => {
    const { fields, actorId } = await authorize(context, 'dataModelsManage');
    return fields.setArchived(dataModelId, _id, expectedVersion, actorId, true);
  },
  dataModelFieldRestore: async (
    _root: unknown,
    { dataModelId, _id, expectedVersion }: DataModelFieldIdentity,
    context: DataModelContext,
  ): Promise<IDataModelField> => {
    const { fields, actorId } = await authorize(context, 'dataModelsManage');
    return fields.setArchived(
      dataModelId,
      _id,
      expectedVersion,
      actorId,
      false,
    );
  },
};

export const dataModelFieldTypes = `
  type DataModelRelationOption { _id: String! label: String! imageUrl: String }
  type DataModelRelationOptions { list: [DataModelRelationOption!]! totalCount: Int! }
  type DataModelRelation { targetModelId: String! multiple: Boolean! inverseFieldId: String! isInverse: Boolean! morphId: String morphName: String morphSize: Int targetModelName: String targetModelLabel: String }
  input DataModelRelationInput { targetModelId: String targetModelIds: [String!] multiple: Boolean! inverseName: String! autoInverseName: Boolean inverseLabel: String! }
  enum DataModelFieldType { ${DATA_MODEL_RECORD_FIELD_TYPES.join(' ')} }
  type DataModelWorkspaceSchema { version: String! sdl: String! }
  type DataModelFieldOption { label: String! value: String! }
  input DataModelFieldOptionInput { label: String! value: String! }
  type DataModelField {
    _id: String! dataModelId: String! name: String! label: String! description: String!
    type: DataModelFieldType! required: Boolean! options: [DataModelFieldOption!]! version: Int!
    archivedAt: Date createdAt: Date! updatedAt: Date!
    relation: DataModelRelation
  }
  input DataModelFieldCreateInput {
    name: String! autoName: Boolean label: String! description: String type: DataModelFieldType! required: Boolean
    options: [DataModelFieldOptionInput!]
    relation: DataModelRelationInput
  }
  input DataModelFieldUpdateInput {
    label: String description: String required: Boolean options: [DataModelFieldOptionInput!]
  }
`;
export const dataModelFieldQueryDefs = `
  dataModelRelationOptions(fieldId: String!, search: String! = "", limit: Int! = 25, offset: Int! = 0, recordIds: [String!]): DataModelRelationOptions!
  dataModelWorkspaceSchema: DataModelWorkspaceSchema!
  dataModelFieldList(dataModelId: String!, archived: Boolean): [DataModelField!]!
`;
export const dataModelFieldMutationDefs = `
  dataModelFieldCreate(dataModelId: String!, input: DataModelFieldCreateInput!): DataModelField!
  dataModelFieldUpdate(dataModelId: String!, _id: String!, expectedVersion: Int!, input: DataModelFieldUpdateInput!): DataModelField!
  dataModelFieldArchive(dataModelId: String!, _id: String!, expectedVersion: Int!): DataModelField!
  dataModelFieldRestore(dataModelId: String!, _id: String!, expectedVersion: Int!): DataModelField!
`;
