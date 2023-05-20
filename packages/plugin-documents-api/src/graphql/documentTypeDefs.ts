export const types = ({ tags }) => `
  ${
    tags
      ? `extend type Tag @key(fields: "_id") {
          _id: String! @external
        }`
      : ''
  }
  type Document {
    _id: String!

    createdAt: Date
    createdUserId: String

    contentType: String!
    name: String!
    content: String
    replacer: String
    ${tags ? 'tags: [Tag]' : ''}
  }

  type DocumentEditorAttribute {
    value: String
    name: String
  }

  type DocumentsTypes {
    label: String
    contentType: String
  }

`;

const params = `
  limit: Int,
  page: Int,
  perPage: Int,
  contentType: String
  tag: String
`;

export const queries = `
  documents(${params}): [Document]
  documentsDetail(_id: String!): Document
  documentsGetEditorAttributes(contentType: String!): [DocumentEditorAttribute]
  documentsGetContentTypes:[DocumentsTypes]
  documentsTotalCount: Int
`;

export const mutations = `
  documentsSave(_id: String, contentType: String, name: String!, content: String, replacer: String): Document
  documentsRemove(_id: String!): JSON
`;
