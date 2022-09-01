export default `
  type ForumPost @key(fields: "_id") {
    _id: ID!
    content: String!
    title: String!
    thumbnail: String
    state: ForumPostState
    commentCount: Int

    createdAt: Date
    updatedAt: Date
    stateChangedAt: Date

    categoryId: ID!
    createdById: ID
    createdByCpId: ID
    updatedById: ID
    updatedByCpId: ID
    stateChangedById: ID
    stateChangedByCpId: ID

    category: ForumCategory
    createdBy: User
    createdByCp: ClientPortalUser
    updatedBy: User
    updatedByCp: ClientPortalUser
    stateChangedBy: User
    stateChangedByCp: ClientPortalUser
  }
`;
