import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

// forumPostDraft(_id: ID!): ForumPost!
// forumPostPublish(_id: ID!): ForumPost!

const postMutations: IObjectTypeResolver<any, IContext> = {
  async forumCreatePost(_, args, { models: { Post }, user }) {
    return Post.createPost(args, user);
  },
  async forumPatchPost(_, args, { models: { Post }, user }) {
    const { _id, ...patch } = args;
    return Post.patchPost(_id, patch, user);
  },
  async forumDeletePost(_, { _id }, { models: { Post } }) {
    return Post.deletePost(_id);
  },
  async forumPostDraft(_, { _id }, { models: { Post }, user }) {
    return Post.draft(_id, user);
  },
  async forumPostPublish(_, { _id }, { models: { Post }, user }) {
    return Post.publish(_id, user);
  }
};

export default postMutations;
