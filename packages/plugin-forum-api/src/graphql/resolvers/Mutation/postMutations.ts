import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const noLoginRequiredTest: IObjectTypeResolver<any, IContext> = {
  async updateTrendScoreOfPublished(_, __, { models: { Post } }) {
    await Post.updateTrendScoreOfPublished({});
    return true;
  }
};

const crmPostMutations: IObjectTypeResolver<any, IContext> = {
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
  async forumPostApprove(_, { _id }, { models: { Post }, user }) {
    const post = await Post.findByIdOrThrow(_id);
    post.categoryApprovalState = 'APPROVED';
    await post.save();
    return post;
  },
  async forumPostDeny(_, { _id }, { models: { Post }, user }) {
    const post = await Post.findByIdOrThrow(_id);
    post.categoryApprovalState = 'DENIED';
    await post.save();
    return post;
  },
  async forumPostAddTranslation(
    _,
    { _id, lang, ...translation },
    { models: { Post } }
  ) {
    await Post.addTranslation(_id, lang, translation);
    return true;
  },

  async forumPostUpdateTranslation(
    _,
    { _id, lang, ...translation },
    { models: { Post } }
  ) {
    await Post.updateTranslation(_id, lang, translation);
    return true;
  },

  async forumPostRemoveTranslation(_, { _id, lang }, { models: { Post } }) {
    await Post.removeTranslation(_id, lang);
    return true;
  }
};

moduleRequireLogin(crmPostMutations);

const cpPostMutations: IObjectTypeResolver<any, IContext> = {
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
  },
  async forumPostAddTranslationCp(
    _,
    { _id, lang, ...translation },
    { models: { Post }, cpUser }
  ) {
    await Post.addTranslation(_id, lang, translation, true, cpUser);
    return true;
  },

  async forumPostUpdateTranslationCp(
    _,
    { _id, lang, ...translation },
    { models: { Post }, cpUser }
  ) {
    await Post.updateTranslation(_id, lang, translation, true, cpUser);
    return true;
  },

  async forumPostRemoveTranslationCp(
    _,
    { _id, lang },
    { models: { Post }, cpUser }
  ) {
    await Post.removeTranslation(_id, lang, true, cpUser);
    return true;
  }
};

export default {
  ...noLoginRequiredTest,
  ...crmPostMutations,
  ...cpPostMutations
};
