export default function ForumPost({ isTagsEnabled }) {
  return `
  type ForumPost @key(fields: "_id") {
    _id: ID!
    content: String
    description: String
    title: String!
    thumbnail: String
    state: ForumPostState
    commentCount: Int!

    viewCount: Int!
    trendScore: Float
    
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

    categoryApprovalState: String!
    
    categoryId: ID
    category: ForumCategory

    upVoteCount: Int
    downVoteCount: Int

    upVotes: [ClientPortalUser]
    downVotes: [ClientPortalUser]

    contentRestricted: Boolean

    custom: JSON
    customIndexed: JSON

    tagIds: [ID!]

    ${isTagsEnabled ? 'tags: [Tag!]' : ''}
  }
`;
}
