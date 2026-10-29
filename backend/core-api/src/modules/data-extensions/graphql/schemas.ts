export const types = `
  type DataExtensionFieldOption {
    value: String!
    label: String!
    color: String
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
    "Optional behaviour: required, unique, defaultValue, min, max, maxLength, scale, currency, multiple, precision, group, showInCreate, placeholder."
    settings: JSON
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
    contentTypes: [String!]!
    createMutations: [String!]!
    "A tenant-defined object; its records are listed and created on the typed endpoint."
    custom: Boolean!
    icon: String
    singularLabel: String
    description: String
    fieldCount: Int!
  }

  type DataExtensionObject {
    _id: String!
    key: String!
    "Record type of its records, custom:<key>."
    recordType: String!
    singularLabel: String!
    pluralLabel: String!
    description: String
    icon: String
    status: String!
    createdBy: String
    createdAt: Date
    updatedAt: Date
  }

  input DataExtensionObjectAddInput {
    key: String!
    singularLabel: String!
    pluralLabel: String!
    description: String
    icon: String
  }

  input DataExtensionObjectEditInput {
    singularLabel: String
    pluralLabel: String
    description: String
    icon: String
  }

  input DataExtensionFieldOptionInput {
    value: String!
    label: String
    color: String
  }

  input DataExtensionFieldAddInput {
    recordType: String!
    key: String!
    label: String!
    description: String
    type: String!
    options: [DataExtensionFieldOptionInput!]
    settings: JSON
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
    "Replaces the settings; unique and multiple stay as created."
    settings: JSON
    order: Int
  }
`;

export const queries = `
  dataExtensionRecordTypes: [DataExtensionRecordType!]!
  dataExtensionFields(recordType: String, includeArchived: Boolean): [DataExtensionField!]!
  dataExtensionSchemaVersion: Int!
  dataExtensionObjects(includeArchived: Boolean): [DataExtensionObject!]!
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
  dataExtensionObjectAdd(input: DataExtensionObjectAddInput!): DataExtensionObject!
  dataExtensionObjectEdit(_id: String!, input: DataExtensionObjectEditInput!): DataExtensionObject!
  dataExtensionObjectArchive(_id: String!): DataExtensionObject!
  dataExtensionObjectRestore(_id: String!): DataExtensionObject!
  "Deletes an archived object, its fields, relations to it and every record. Returns the object id."
  dataExtensionObjectDelete(_id: String!): String!
`;
