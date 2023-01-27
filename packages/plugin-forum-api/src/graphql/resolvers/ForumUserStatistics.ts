import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const ForumUserStatistics: IObjectTypeResolver<any, IContext> = {
  async publishedPostCount({ _id }, _, { models: { Post } }) {
    return Post.countDocuments({
      createdByCpId: _id,
      state: 'PUBLISHED'
    });
  },
  async pendingPostCount({ _id }, _, { models: { Post } }) {
    return Post.countDocuments({
      createdByCpId: _id,
      categoryApprovalState: 'PENDING'
    });
  },
  async approvedPostCount({ _id }, _, { models: { Post } }) {
    return Post.countDocuments({
      createdByCpId: _id,
      categoryApprovalState: 'APPROVED'
    });
  },
  async deniedPostCount({ _id }, _, { models: { Post } }) {
    return Post.countDocuments({
      createdByCpId: _id,
      categoryApprovalState: 'DENIED'
    });
  },
  async savedPostCount({ _id }, _, { models: { SavedPost } }) {
    return SavedPost.countDocuments({
      cpUserId: _id
    });
  }
};

export default ForumUserStatistics;
