import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

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
  },

  /* <<< Client portal */
  async forumCreatePostCp(_, args, { models: { Post }, cpUser }) {
    return Post.createPostCp(args, cpUser);
  },
  async forumPatchPostCp(_, args, { models: { Post }, cpUser }) {
    const { _id, ...patch } = args;
    return Post.patchPostCp(_id, patch, cpUser);
  },
  async forumDeletePostCp(_, { _id }, { models: { Post }, cpUser }) {
    return Post.deletePostCp(_id, cpUser);
  },
  async forumPostDraftCp(_, { _id }, { models: { Post }, cpUser }) {
    return Post.draftCp(_id, cpUser);
  },
  async forumPostPublishCp(_, { _id }, { models: { Post }, cpUser }) {
    return Post.publishCp(_id, cpUser);
  }
  /* >>> Client portal */
};

export default postMutations;
