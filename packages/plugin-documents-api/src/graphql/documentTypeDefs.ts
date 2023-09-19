export const types = `
  type Document {
    _id: String!

    createdAt: Date
    createdUserId: String

    contentType: String!
    subType: String
    name: String!
    content: String
    replacer: String
  }

  type DocumentEditorAttribute {
    value: String
    name: String
  }

  type DocumentsTypes {
    label: String
    contentType: String
    subTypes: [String]
  }

`;

const params = `
  limit: Int,
  page: Int,
  perPage: Int,
  contentType: String,
  subType: String
`;

export const queries = `
  documents(${params}): [Document]
  documentsDetail(_id: String!): Document
  documentsGetEditorAttributes(contentType: String!): [DocumentEditorAttribute]
  documentsGetContentTypes:[DocumentsTypes]
  documentsTotalCount: Int
`;

export const mutations = `
  documentsSave(_id: String, contentType: String, subType: String, name: String!, content: String, replacer: String): Document
  documentsRemove(_id: String!): JSON
`;
