export default `
  type ForumComment @key(fields: "_id") {
    _id: ID!
    content: String!

    createdAt: Date
    updatedAt: Date
    
    postId: String!
    replyToId: String
    createdById: String!

    createdBy: User!
    post: ForumPost!
    replyTo: ForumComment
    replies: [ForumComment!]
  }
`;
