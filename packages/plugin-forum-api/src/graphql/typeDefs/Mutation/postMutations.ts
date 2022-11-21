import { requiredIf } from '../utils';

const commonPostParams = (isInsert = false) => {
  return `
    categoryId: ID${requiredIf(isInsert)}
    content: String
    title: String${requiredIf(isInsert)}
    state: ForumPostState
    thumbnail: String
    description: String
    custom: JSON
    customIndexed: JSON
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

  #updateTrendScoreOfPublished: Boolean
`;

export default postMutations;
