import { gql } from '@apollo/client';
import type { DataModel, DataModelRecord, ModelField } from './types';

export type RecordWire = Omit<DataModelRecord, 'values'> &
  Record<string, unknown>;

export const modelFieldSelection = (field: ModelField): string =>
  field.type === 'relation' ? `${field.name} { _id }` : field.name;

export const createReverseRelationDocument = (
  model: Pick<DataModel, 'name' | 'source'>,
  field: ModelField,
) => {
  if (
    !/^[a-z][a-z0-9_]{0,62}$/.test(model.name) ||
    !/^[a-z][A-Za-z0-9_]{0,62}$/.test(field.name) ||
    !field.relation?.isInverse
  )
    throw new Error('Invalid reverse relation identity');
  const root =
    model.source === 'CUSTOM'
      ? `dataModel_${model.name}Detail`
      : `${model.name}Detail`;
  return gql(`query dataModelsUiReverseLinks($_id: String!, $offset: Int!) {
    record: ${root}(_id: $_id) { _id links: ${field.name}(limit: 26, offset: $offset) { _id } }
  }`);
};

export const relationValueIds = (
  field: ModelField,
  value: unknown,
): unknown => {
  if (field.type !== 'relation') return value;
  const id = (entry: unknown): unknown =>
    entry && typeof entry === 'object' && '_id' in entry ? entry._id : entry;
  return Array.isArray(value) ? value.map(id) : id(value);
};

export const createRecordDocuments = (
  model: DataModel,
  fields: ModelField[],
) => {
  if (
    !/^[a-z][a-z0-9_]{0,62}$/.test(model.name) ||
    fields.some((field) => !/^[a-z][A-Za-z0-9_]{0,62}$/.test(field.name))
  )
    throw new Error('Invalid GraphQL model identity');
  const type = `DataModel_${model.name}`;
  const root = `dataModel_${model.name}`;
  const selection = `_id dataModelId version createdAt updatedAt createdBy updatedBy deletedAt deletedBy ${fields
    .map(modelFieldSelection)
    .join(' ')}`;
  return {
    detail: gql(`query dataModelsUiRecordDetail($_id: String!) {
      dataModelRecordDetail: ${root}Detail(_id: $_id) { ${selection} }
    }`),
    list: gql(`query dataModelsUiRecords($limit: Int, $offset: Int, $deleted: Boolean, $sort: ${type}Sort) {
      dataModelRecordList: ${root}List(limit: $limit, offset: $offset, deleted: $deleted, sort: $sort) { list { ${selection} } totalCount }
    }`),
    create: gql(
      `mutation dataModelsUiRecordCreate($input: ${type}CreateInput!) { dataModelRecordCreate: ${root}Create(input: $input) { _id version } }`,
    ),
    update: gql(
      `mutation dataModelsUiRecordUpdate($_id: String!, $expectedVersion: Int!, $input: ${type}UpdateInput!) { dataModelRecordUpdate: ${root}Update(_id: $_id, expectedVersion: $expectedVersion, input: $input) { _id version } }`,
    ),
    remove: gql(
      `mutation dataModelsUiRecordRemove($_id: String!, $expectedVersion: Int!) { dataModelRecordRemove: ${root}Remove(_id: $_id, expectedVersion: $expectedVersion) { _id version } }`,
    ),
    restore: gql(
      `mutation dataModelsUiRecordRestore($_id: String!, $expectedVersion: Int!, $input: ${type}UpdateInput) { dataModelRecordRestore: ${root}Restore(_id: $_id, expectedVersion: $expectedVersion, input: $input) { _id version } }`,
    ),
  };
};

export const recordFromWire = (
  record: RecordWire,
  fields: ModelField[],
): DataModelRecord => ({
  ...record,
  values: Object.fromEntries(
    fields.map((field) => [
      field._id,
      relationValueIds(field, record[field.name]),
    ]),
  ),
});

export const recordInputByName = (
  patch: Record<string, unknown>,
  fields: ModelField[],
): Record<string, unknown> =>
  Object.fromEntries(
    fields
      .filter(
        (field) =>
          !field.relation?.isInverse &&
          Object.prototype.hasOwnProperty.call(patch, field._id),
      )
      .map((field) => [field.name, patch[field._id]]),
  );
