export const types = `
  type ConnectionTypeField {
    key: String!
    label: String!
    description: String
    placeholder: String
    required: Boolean
    secret: Boolean
    inputType: String
    pattern: String
    minLength: Int
    maxLength: Int
  }

  type ConnectionType {
    id: String!
    pluginName: String!
    label: String!
    description: String
    icon: String!
    fields: [ConnectionTypeField!]!
    allowCustomFields: Boolean!
    hasTest: Boolean!
  }

  type ConnectionField {
    key: String!
    label: String
    secret: Boolean!
    """Plain fields only. Secret values are never returned."""
    value: String
    hasValue: Boolean!
  }

  type Connection {
    _id: String!
    name: String!
    icon: String
    logo: String
    type: String!
    typeLabel: String!
    typeAvailable: Boolean!
    hasTest: Boolean!
    status: String!
    fields: [ConnectionField!]!
    lastTestedAt: Date
    lastTestStatus: String
    lastTestMessage: String
    createdBy: String
    updatedBy: String
    createdUser: User
    updatedUser: User
    createdAt: Date
    updatedAt: Date
  }

  type ConnectionTestResult {
    ok: Boolean!
    message: String
    connection: Connection
  }

  input ConnectionFieldInput {
    key: String!
    label: String
    secret: Boolean
    """Omit to keep the stored value; an empty string clears it."""
    value: String
  }

  input ConnectionAddInput {
    name: String!
    icon: String
    logo: String
    type: String!
    fields: [ConnectionFieldInput!]
  }

  input ConnectionEditInput {
    name: String
    icon: String
    logo: String
    """The complete list of keys the connection keeps."""
    fields: [ConnectionFieldInput!]
  }
`;

export const queries = `
  connectionsTypes: [ConnectionType!]!
  connections(searchValue: String, type: String): [Connection!]!
  connectionsDetail(_id: String!): Connection
`;

export const mutations = `
  connectionsAdd(input: ConnectionAddInput!): Connection
  connectionsEdit(_id: String!, input: ConnectionEditInput!): Connection
  connectionsRemove(_id: String!): String
  connectionsTest(_id: String!): ConnectionTestResult
`;
