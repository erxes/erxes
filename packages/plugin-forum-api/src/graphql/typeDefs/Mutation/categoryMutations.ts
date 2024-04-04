import { requiredIf } from '../utils';

const commonParams = (isInsert = false): string => {
  return `
    parentId: String
    name: String${requiredIf(isInsert)}
    code: String
    thumbnail: String

    description: String

    userLevelReqPostRead: String${requiredIf(isInsert)}
    userLevelReqPostWrite: String${requiredIf(isInsert)}
    userLevelReqCommentWrite: String${requiredIf(isInsert)}

    postsReqCrmApproval: Boolean${requiredIf(isInsert)}

    postReadRequiresPermissionGroup: Boolean
    postWriteRequiresPermissionGroup: Boolean
    commentWriteRequiresPermissionGroup: Boolean

    order: Float
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
