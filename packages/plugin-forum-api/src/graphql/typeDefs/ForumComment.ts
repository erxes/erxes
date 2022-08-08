export default `
  type ForumComment @key(fields: "_id") {
    _id: ID!
    postId: String!
    replyToId: String

    content: String!
    
    post: ForumPost!
    replyTo: ForumComment
    replies: [ForumComment!]
  }
`;
