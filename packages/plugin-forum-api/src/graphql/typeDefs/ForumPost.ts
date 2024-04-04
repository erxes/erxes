export const translationAndPostCommonFields = `
  title: String
  subTitle: String
  content: String
  description: String
  thumbnail: String
  thumbnailAlt: String
  custom: JSON
`;

export default function ForumPost({ isTagsEnabled }) {
  return `
  type ForumPostTranslation {
    lang: String!
    ${translationAndPostCommonFields}
  }

  type ForumPost @key(fields: "_id") @cacheControl(maxAge: 5) {
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

    wordCount: Int
    pollOptions: [ForumPollOption!]
    pollVoteCount: Int @cacheControl(maxAge: 5)

    isPollMultiChoice: Boolean
    pollEndDate: Date

    hasCurrentUserSavedIt: Boolean!

    isFeaturedByAdmin: Boolean
    isFeaturedByUser: Boolean

    quizzes: [ForumQuiz!]

    ${isTagsEnabled ? 'tags: [Tag!]' : ''}
  }
`;
}
