import { translationAndPostCommonFields } from '../ForumPost';
import { requiredIf } from '../utils';

const commonPostParams = (isInsert = false) => {
  return `
    categoryId: ID${requiredIf(isInsert)}
    lang: String
    ${translationAndPostCommonFields}
    state: ForumPostState
    customIndexed: JSON
    tagIds: [ID!]
  `;
};

const postMutations = `
  forumCreatePost(
    ${commonPostParams(true)}
  ): ForumPost!
  forumPatchPost(
    _id: ID!
    ${commonPostParams()}
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

`;

export default postMutations;
