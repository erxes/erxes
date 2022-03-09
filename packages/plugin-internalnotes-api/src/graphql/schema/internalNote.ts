const commonFields = `
  _id: String!
  contentType: String!
  createdAt: Date
`;

export const types = `
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type InternalNote {
    ${commonFields}
    contentTypeId: String
    content: String
    createdUserId: String

    createdUser: User
  }

  type ModifiedNote {
    ${commonFields}
    createdBy: String
    contentId: String
    action: String
    content: String
    contentTypeDetail: JSON
  }

  type InternalNotesByAction {
    list: [ModifiedNote]
    totalCount: Int
  }
`;

export const queries = `
  internalNoteDetail(_id: String!): InternalNote
  internalNotes(contentType: String!, contentTypeId: String): [InternalNote]
  internalNotesByAction(contentType: String, pipelineId: String, page: Int, perPage: Int): InternalNotesByAction
  internalNotesAsLogs(contentTypeId: String!): [JSON]
`;

export const mutations = `
  internalNotesAdd(contentType: String!, contentTypeId: String, content: String, mentionedUserIds: [String]): InternalNote
  internalNotesEdit(_id: String!, content: String, mentionedUserIds: [String]): InternalNote
  internalNotesRemove(_id: String!): InternalNote
`;
