export const types = `
  type InternalNote {
    _id: String!
    contentType: String!
    contentTypeId: String
    content: String
    createdUserId: String
    createdDate: Date

    createdUser: User
  }
`;

export const queries = `
  internalNotes(contentType: String!, contentTypeId: String): [InternalNote]
`;

export const mutations = `
  internalNotesAdd(contentType: String!, contentTypeId: String, content: String): InternalNote
  internalNotesEdit(_id: String!, content: String): InternalNote
  internalNotesRemove(_id: String!): InternalNote
`;
