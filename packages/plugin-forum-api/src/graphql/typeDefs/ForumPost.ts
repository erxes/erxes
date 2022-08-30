export default `
  type ForumPost @key(fields: "_id") {
    _id: ID!
    content: String!
    title: String!
    thumbnail: String
    state: ForumPostState

    createdAt: Date
    updatedAt: Date

    categoryId: ID!

    category: ForumCategory
  }
`;
