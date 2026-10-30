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

  type DataExtensionView {
    _id: String!
    recordType: String!
    name: String!
    "table, kanban or calendar"
    type: String!
    "{ match: all|any, conditions: [{ field, operator, value }] }"
    filter: JSON
    sortField: String
    sortDirection: Int
    columns: [String!]
    groupBy: String
    dateField: String
    shared: Boolean!
    createdBy: String!
    createdAt: Date
    updatedAt: Date
  }

  input DataExtensionViewInput {
    recordType: String
    name: String
    type: String
    filter: JSON
    sortField: String
    sortDirection: Int
    columns: [String!]
    groupBy: String
    dateField: String
    shared: Boolean
  }

  type DataExtensionChange {
    _id: String!
    key: String!
    before: JSON
    after: JSON
    "created or updated"
    event: String!
    userId: String!
    createdAt: Date
  }

  type DataExtensionWebhook {
    _id: String!
    name: String!
    url: String!
    "Fires for these record types; every record type when empty."
    recordTypes: [String!]!
    active: Boolean!
    hasSecret: Boolean!
    "Only returned when the webhook is created."
    secret: String
    lastStatus: Int
    lastError: String
    lastAt: Date
    createdAt: Date
  }

  input DataExtensionWebhookInput {
    name: String
    url: String
    recordTypes: [String!]
    active: Boolean
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
  "The caller's own views of a record type and every shared one."
  dataExtensionViews(recordType: String!): [DataExtensionView!]!
  "Who changed which value of a record, newest first."
  dataExtensionChanges(recordType: String!, recordId: String!, limit: Int): [DataExtensionChange!]!
  dataExtensionWebhooks: [DataExtensionWebhook!]!
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
  dataExtensionViewAdd(input: DataExtensionViewInput!): DataExtensionView!
  dataExtensionViewEdit(_id: String!, input: DataExtensionViewInput!): DataExtensionView!
  dataExtensionViewDelete(_id: String!): String!
  "Creates a webhook; its signing secret is returned this once."
  dataExtensionWebhookAdd(input: DataExtensionWebhookInput!): DataExtensionWebhook!
  dataExtensionWebhookEdit(_id: String!, input: DataExtensionWebhookInput!): DataExtensionWebhook!
  dataExtensionWebhookDelete(_id: String!): String!
`;
