import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const postMutations: IObjectTypeResolver<any, IContext> = {
  async forumCreatePost(_, args, { models: { Post } }) {
    return await Post.create(args);
  },
  async forumPatchPost(_, args, { models: { Post } }) {
    const { _id, ...patch } = args;
    return await Post.patchPost(_id, patch);
  },
  async forumDeletePost(_, { _id }, { models: { Post } }) {
    return await Post.deletePost(_id);
  }
};

export default postMutations;
