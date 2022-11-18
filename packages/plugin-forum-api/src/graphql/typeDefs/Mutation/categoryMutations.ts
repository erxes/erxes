import { requiredIf } from '../utils';

const commonParams = (isInsert = false): string => {
  return `
    parentId: String
    name: String${requiredIf(isInsert)}
    code: String
    thumbnail: String

    userLevelReqPostRead: String${requiredIf(isInsert)}
    userLevelReqPostWrite: String${requiredIf(isInsert)}
    userLevelReqCommentWrite: String${requiredIf(isInsert)}

    postsReqCrmApproval: Boolean${requiredIf(isInsert)}
  `;
};

const categoryMutations = `
  forumCreateCategory(
    ${commonParams(true)}
  ): ForumCategory

  forumPatchCategory(
    _id: ID!
    ${commonParams()}
  ): ForumCategory

  forumDeleteCategory(_id: ID!): ForumCategory
`;

export default categoryMutations;
