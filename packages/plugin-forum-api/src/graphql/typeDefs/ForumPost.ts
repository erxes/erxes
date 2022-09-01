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

    createdUserType: ForumUserType
    createdById: ID
    createdByCpId: ID

    updatedUserType: ForumUserType
    updatedById: ID
    updatedByCpId: ID

    stateChangedUserType: ForumUserType
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
