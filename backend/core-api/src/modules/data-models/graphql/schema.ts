import {
  dataModelRecordTypes,
  dataModelRecordQueryDefs,
  dataModelRecordMutationDefs,
} from './recordSchema';
import {
  dataModelFieldTypes,
  dataModelFieldQueryDefs,
  dataModelFieldMutationDefs,
} from './fields';

export const types = `
  ${dataModelFieldTypes}
  ${dataModelRecordTypes}
  enum DataModelSource {
    BUILTIN
    CUSTOM
  }

  type DataModelSystemField {
    code: String!
    name: String!
    type: String!
  }

  type DataModel {
    _id: String!
    name: String!
    labelSingular: String!
    labelPlural: String!
    description: String!
    icon: String!
    recordLabelField: String
    recordImageField: String
    source: DataModelSource!
    contentType: String!
    version: Int!
    systemFields: [DataModelSystemField!]!
    recordFieldTypes: [String!]!
    createdAt: Date
    updatedAt: Date
    createdBy: String
    updatedBy: String
    archivedAt: Date
    archivedBy: String
  }

  type DataModelList {
    list: [DataModel!]!
    totalCount: Int!
  }

  input DataModelCreateInput {
    name: String!
    labelSingular: String!
    labelPlural: String!
    description: String
    icon: String
  }

  input DataModelUpdateInput {
    labelSingular: String
    labelPlural: String
    description: String
    icon: String
    recordLabelField: String
    recordImageField: String
  }
`;

export const queries = `
  ${dataModelFieldQueryDefs}
  ${dataModelRecordQueryDefs}
  dataModelList(archived: Boolean = false, limit: Int = 50, offset: Int = 0): DataModelList!
  dataModelDetail(_id: String!): DataModel!
`;

export const mutations = `
  ${dataModelFieldMutationDefs}
  ${dataModelRecordMutationDefs}
  dataModelCreate(input: DataModelCreateInput!): DataModel!
  dataModelUpdate(_id: String!, input: DataModelUpdateInput!, expectedVersion: Int!): DataModel!
  dataModelArchive(_id: String!, expectedVersion: Int!): DataModel!
  dataModelRestore(_id: String!, expectedVersion: Int!): DataModel!
`;
