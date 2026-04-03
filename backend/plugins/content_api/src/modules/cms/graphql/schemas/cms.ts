export const types = `
  type ContentCMS {
    _id: String!
    name: String
    description: String
    clientPortalId: String
    content: String
    language: String
    languages: [String]
    createdAt: Date
    updatedAt: Date

  }
`;

export const inputs = `
  input ContentCMSInput {
    name: String
    description: String
    clientPortalId: String
    content: String
    language: String
    languages: [String]
  }
`;

export const queries = `    
  contentCMSList: [ContentCMS]
  contentCMS(id: String!): ContentCMS
`;

export const mutations = `
  contentCreateCMS(input: ContentCMSInput): ContentCMS
  contentUpdateCMS(id: String!, input: ContentCMSInput): ContentCMS
  contentDeleteCMS(id: String!): JSON
`;
