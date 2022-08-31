export default `
  type ForumPost @key(fields: "_id") {
    _id: ID!
    content: String!
    title: String!
    thumbnail: String
    state: ForumPostState

    createdAt: Date
    updatedAt: Date
    stateChangedAt: Date

    categoryId: ID!
    createdById: ID
    updatedById: ID
    stateChangedById: ID

    category: ForumCategory
    createdBy: User
    updatedBy: User
    stateChangedBy: User

    totalCommentCount: Int
  }
`;
