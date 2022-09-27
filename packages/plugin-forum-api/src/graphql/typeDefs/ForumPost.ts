export default `
  type ForumPost @key(fields: "_id") {
    _id: ID!
    content: String
    description: String
    title: String!
    thumbnail: String
    state: ForumPostState
    commentCount: Int!

    
    createdUserType: ForumUserType!
    createdAt: Date!

    createdById: ID
    createdBy: User

    createdByCpId: ID
    createdByCp: ClientPortalUser
    

    updatedUserType: ForumUserType!
    updatedAt: Date!

    updatedById: ID
    updatedBy: User

    updatedByCpId: ID
    updatedByCp: ClientPortalUser

    
    stateChangedUserType: ForumUserType!
    stateChangedAt: Date!

    stateChangedById: ID
    stateChangedBy: User

    stateChangedByCpId: ID
    stateChangedByCp: ClientPortalUser

    
    categoryId: [ID!]
    category: [ForumCategory!]

    upVoteCount: Int
    downVoteCount: Int

    upVotes: [ClientPortalUser]
    downVotes: [ClientPortalUser]
  }
`;
