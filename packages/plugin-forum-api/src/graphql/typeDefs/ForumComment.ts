export default `
  type ForumComment @key(fields: "_id") {
    _id: ID!
    content: String!

    createdAt: Date
    updatedAt: Date
    
    postId: String!
    replyToId: String
    createdById: String
    createdByCpId: String

    createdBy: User
    createdByCp: ClientPortalUser
    post: ForumPost!
    replyTo: ForumComment
    replies: [ForumComment!]

    upVoteCount: Int
    downVoteCount: Int

    upVotes: [ClientPortalUser]
    downVotes: [ClientPortalUser]
  }
`;
