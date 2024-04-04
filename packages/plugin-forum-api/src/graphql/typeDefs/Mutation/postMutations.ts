import { translationAndPostCommonFields } from '../ForumPost';

const commonPostParams = (isInsert = false) => {
  return `
    categoryId: ID
    lang: String
    ${translationAndPostCommonFields}
    state: ForumPostState
    customIndexed: JSON
    tagIds: [ID!]
    pollOptions: [ForumPollOptionInput!]
    isPollMultiChoice: Boolean
    pollEndDate: Date
  `;
};

const postMutations = `
  forumCreatePost(
    ${commonPostParams(true)}
    createdAt: Date
    lastPublishedAt: Date
    createdById: String
  ): ForumPost!
  forumPatchPost(
    _id: ID!
    ${commonPostParams()}
    createdAt: Date
    lastPublishedAt: Date
    createdById: String
    ): ForumPost!
  forumDeletePost(_id: ID!): ForumPost!
  forumPostDraft(_id: ID!): ForumPost!
  forumPostPublish(_id: ID!): ForumPost!
  forumPostApprove(_id: ID!): ForumPost!
  forumPostDeny(_id: ID!): ForumPost!

  forumCreatePostCp(
    ${commonPostParams(true)}
  ): ForumPost!

  forumPatchPostCp(
    _id: ID!
    ${commonPostParams()}): ForumPost!
  forumDeletePostCp(_id: ID!): ForumPost!
  forumPostDraftCp(_id: ID!): ForumPost!
  forumPostPublishCp(_id: ID!): ForumPost!

  forumPostAddTranslation(
    _id: ID!
    lang: ID!
    ${translationAndPostCommonFields}
  ): Boolean

  forumPostUpdateTranslation(
    _id: ID!
    lang: ID!
    ${translationAndPostCommonFields}
  ): Boolean

  forumPostRemoveTranslation(
    _id: ID!
    lang: ID!
  ): Boolean

  forumPostAddTranslationCp(
    _id: ID!
    lang: ID!
    ${translationAndPostCommonFields}
  ): Boolean

  forumPostUpdateTranslationCp(
    _id: ID!
    lang: ID!
    ${translationAndPostCommonFields}
  ): Boolean

  forumPostRemoveTranslationCp(
    _id: ID!
    lang: ID!
  ): Boolean

  forumPostSetFeatured(_id: ID!, featured: Boolean!): Boolean
  forumPostSetFeaturedCp(_id: ID!, featured: Boolean!): Boolean

`;

export default postMutations;
