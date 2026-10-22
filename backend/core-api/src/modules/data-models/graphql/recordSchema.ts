const legacy =
  '@deprecated(reason: "Use generated dataModel_<name> operations with typed fields and inputs.")';

export const dataModelRecordTypes = `
  type DataModelRecord {
    _id: String!
    dataModelId: String!
    propertiesData: JSON! ${legacy}
    version: Int!
    createdAt: Date!
    updatedAt: Date!
    createdBy: String!
    updatedBy: String!
    deletedAt: Date
    deletedBy: String
  }
  type DataModelRecordList {
    list: [DataModelRecord!]!
    totalCount: Int!
  }
  input DataModelRecordInput {
    propertiesData: JSON!
  }
  enum DataModelRecordFilterOperator {
    EQ NE GT GTE LT LTE IN CONTAINS IS_EMPTY IS_NOT_EMPTY
  }
  enum DataModelRecordSortDirection { ASC DESC }
  input DataModelRecordFilterInput {
    fieldId: String!
    operator: DataModelRecordFilterOperator!
    value: JSON
  }
  input DataModelRecordSortInput {
    field: String!
    direction: DataModelRecordSortDirection!
  }
  input DataModelRecordListParams {
    deleted: Boolean = false
    limit: Int = 50
    offset: Int = 0
    filters: [DataModelRecordFilterInput!]
    sort: DataModelRecordSortInput
  }
`;

export const dataModelRecordQueryDefs = `
  dataModelRecordList(dataModelId: String!, params: DataModelRecordListParams): DataModelRecordList! ${legacy}
  dataModelRecordDetail(dataModelId: String!, _id: String!): DataModelRecord! ${legacy}
`;

export const dataModelRecordMutationDefs = `
  dataModelRecordCreate(dataModelId: String!, input: DataModelRecordInput!): DataModelRecord! ${legacy}
  dataModelRecordUpdate(dataModelId: String!, _id: String!, input: DataModelRecordInput!, expectedVersion: Int!): DataModelRecord! ${legacy}
  dataModelRecordRemove(dataModelId: String!, _id: String!, expectedVersion: Int!): DataModelRecord! ${legacy}
  dataModelRecordRestore(dataModelId: String!, _id: String!, expectedVersion: Int!, input: DataModelRecordInput): DataModelRecord! ${legacy}
`;
