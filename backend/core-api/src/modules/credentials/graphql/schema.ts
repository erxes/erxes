export const types = `
  type CredentialTemplateField {
    key: String!
    label: String!
    type: String!
    secret: Boolean!
    required: Boolean!
    help: String
  }
  type CredentialFieldMetadata {
    key: String!
    label: String!
    type: String!
    secret: Boolean!
    required: Boolean!
    help: String
    hasValue: Boolean!
  }
  type CredentialTemplate {
    id: String!
    name: String!
    category: String!
    description: String!
    fields: [CredentialTemplateField!]!
  }
  type CredentialMetadata {
    _id: String!
    reference: String!
    name: String!
    description: String
    templateId: String!
    category: String!
    fields: [CredentialFieldMetadata!]!
    createdAt: Date!
    updatedAt: Date!
  }
  input CredentialFieldInput {
    key: String!
    label: String
    type: String
    secret: Boolean
    action: String!
    value: String
  }
  input CredentialInput {
    name: String!
    description: String
    templateId: String!
    category: String!
    fields: [CredentialFieldInput!]!
  }
  type CredentialGrantMetadata {
    _id: String!
    credentialId: String!
    pluginName: String!
    name: String!
    createdAt: Date!
    revokedAt: Date
  }
  type CredentialGrantIssued {
    grant: CredentialGrantMetadata!
    token: String!
  }
`;

export const queries = `
  credentialsTemplates: [CredentialTemplate!]!
  credentialsList(search: String, category: String): [CredentialMetadata!]!
  credentialsDetail(_id: String!): CredentialMetadata
  credentialsGrants(credentialId: String!): [CredentialGrantMetadata!]!
`;

export const mutations = `
  credentialsCreate(input: CredentialInput!): CredentialMetadata!
  credentialsUpdate(_id: String!, input: CredentialInput!): CredentialMetadata!
  credentialsDelete(_id: String!): Boolean!
  credentialsGrantCreate(credentialId: String!, pluginName: String!, name: String!): CredentialGrantIssued!
  credentialsGrantRevoke(_id: String!): Boolean!
`;
