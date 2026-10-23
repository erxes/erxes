export const types = `
  type DataExtensionFieldOption {
    value: String!
    label: String!
  }

  type DataExtensionFieldRelation {
    targetRecordType: String!
    kind: String!
    side: String!
    inverseFieldId: String
  }

  type DataExtensionField {
    _id: String!
    recordType: String!
    key: String!
    label: String!
    description: String
    type: String!
    options: [DataExtensionFieldOption!]
    relation: DataExtensionFieldRelation
    order: Int!
    status: String!
    createdBy: String
    updatedBy: String
    createdAt: Date
    updatedAt: Date
  }

  type DataExtensionRecordType {
    recordType: String!
    label: String!
    typeName: String!
    owner: String!
    fieldCount: Int!
  }

  input DataExtensionFieldOptionInput {
    value: String!
    label: String
  }

  input DataExtensionFieldAddInput {
    recordType: String!
    key: String!
    label: String!
    description: String
    type: String!
    options: [DataExtensionFieldOptionInput!]
    order: Int
  }

  input DataExtensionRelationAddInput {
    recordType: String!
    key: String!
    label: String!
    description: String
    targetRecordType: String!
    kind: String!
    inverseKey: String!
    inverseLabel: String!
  }

  input DataExtensionFieldEditInput {
    label: String
    description: String
    options: [DataExtensionFieldOptionInput!]
    order: Int
  }
`;

export const queries = `
  dataExtensionRecordTypes: [DataExtensionRecordType!]!
  dataExtensionFields(recordType: String, includeArchived: Boolean): [DataExtensionField!]!
  dataExtensionSchemaVersion: Int!
`;

export const mutations = `
  dataExtensionFieldAdd(input: DataExtensionFieldAddInput!): DataExtensionField!
  dataExtensionRelationAdd(input: DataExtensionRelationAddInput!): [DataExtensionField!]!
  dataExtensionFieldEdit(_id: String!, input: DataExtensionFieldEditInput!): DataExtensionField!
  dataExtensionFieldArchive(_id: String!): DataExtensionField!
  dataExtensionFieldRestore(_id: String!): DataExtensionField!
  """
  Deletes a field and its stored values for good (both sides of a relation).
  Returns the deleted definition ids.
  """
  dataExtensionFieldDelete(_id: String!): [String!]!
`;
