export const types = `
  type Document {
    _id: String!

    createdAt: Date
    createdUserId: String

    contentType: String!
    name: String!
    content: String
    replacer: String
  }

  type DocumentEditorAttribute {
    value: String
    name: String
  }
`;

const params = `
  limit: Int,
  page: Int,
  perPage: Int,
  contentType: String
`;

export const queries = `
  documents(${params}): [Document]
  documentsDetail(_id: String!): Document
  documentsGetEditorAttributes(contentType: String!): [DocumentEditorAttribute]
  documentsTotalCount: Int
`;

export const mutations = `
  documentsSave(_id: String, contentType: String, name: String!, content: String, replacer: String): Document
  documentsRemove(_id: String!): JSON
`;
