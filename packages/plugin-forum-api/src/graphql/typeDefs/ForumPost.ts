export const translationAndPostCommonFields = `
  title: String
  content: String
  description: String
  thumbnail: String
  custom: JSON
`;

export default function ForumPost({ isTagsEnabled }) {
  return `
  type ForumPostTranslation {
    lang: String!
    ${translationAndPostCommonFields}
  }

  type ForumPost @key(fields: "_id") {
    _id: ID!
    state: ForumPostState

    lang: String

    ${translationAndPostCommonFields}

    translations: [ForumPostTranslation!]

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
    
    lastPublishedAt: Date

    categoryApprovalState: String!
    
    categoryId: ID
    category: ForumCategory

    upVoteCount: Int
    downVoteCount: Int

    upVotes: [ClientPortalUser]
    downVotes: [ClientPortalUser]

    requiredLevel: String
    isPermissionRequired: Boolean

    customIndexed: JSON

    tagIds: [ID!]

    ${isTagsEnabled ? 'tags: [Tag!]' : ''}
  }
`;
}
