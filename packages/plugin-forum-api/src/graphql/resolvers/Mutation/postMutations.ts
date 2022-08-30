import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const postMutations: IObjectTypeResolver<any, IContext> = {
  async forumCreatePost(_, args, { models: { Post }, user }) {
    return await Post.create({ ...args, createdById: user._id });
  },
  async forumPatchPost(_, args, { models: { Post }, user }) {
    const { _id, ...patch } = args;
    return await Post.patchPost(_id, { ...patch, updatedById: user._id });
  },
  async forumDeletePost(_, { _id }, { models: { Post } }) {
    return await Post.deletePost(_id);
  }
};

export default postMutations;
