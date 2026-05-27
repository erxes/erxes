export const types = `
  type ContentCMS {
    _id: String!
    name: String
    description: String
    clientPortalId: String
    content: String
    domain: String
    publicUrl: String
    metaTitle: String
    metaDescription: String
    metaKeywords: [String]
    metaImage: Attachment
    googleTrackingId: String
    googleTagManagerId: String
    customScripts: [String]
    defaultPostStatus: String
    allowComments: Boolean
    siteLogo: Attachment
    favicon: Attachment
    language: String
    languages: [String]
    postUrlField: String
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
    domain: String
    publicUrl: String
    metaTitle: String
    metaDescription: String
    metaKeywords: [String]
    metaImage: AttachmentInput
    googleTrackingId: String
    googleTagManagerId: String
    customScripts: [String]
    defaultPostStatus: String
    allowComments: Boolean
    siteLogo: AttachmentInput
    favicon: AttachmentInput
    language: String
    languages: [String]
    postUrlField: String
  }
`;

export const queries = `    
  contentCMSList: [ContentCMS]
  contentCMS(id: String!): ContentCMS
`;

export const mutations = `
  contentCreateCMS(input: ContentCMSInput): ContentCMS
  cpContentCreateCMS(input: ContentCMSInput): ContentCMS
  contentUpdateCMS(id: String!, input: ContentCMSInput): ContentCMS
  contentDeleteCMS(id: String!): JSON
`;
