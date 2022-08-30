import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

// forumPostDraft(_id: ID!): ForumPost!
// forumPostPublish(_id: ID!): ForumPost!

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
  },
  async forumPostDraft(_, { _id }, { models: { Post }, user }) {
    const post = await Post.findByIdOrThrow(_id);
    post.state = 'DRAFT';
    post.stateChangedAt = new Date();
    post.stateChangedById = user._id;
    await post.save();
    return post;
  },
  async forumPostPublish(_, { _id }, { models: { Post }, user }) {
    const post = await Post.findByIdOrThrow(_id);
    post.state = 'PUBLISHED';
    post.stateChangedAt = new Date();
    post.stateChangedById = user._id;
    await post.save();
    return post;
  }
};

export default postMutations;
