import { IContext, IModels } from '~/connectionResolvers';

const checkUserOwnsPost = async (
  models: IModels,
  userId: string,
  postId: string,
) => {
  const post = await models.Posts.findOne({
    _id: postId,
    authorId: userId,
  });

  if (!post) {
    throw new Error('Post not found');
  }

  return post;
};

const postMutations = {
  clientPortalUserAddPost: async (
    _root,
    args: { input: any },
    { portalUser, models }: IContext,
  ) => {
    if (!portalUser) {
      throw new Error('login required');
    }

    const doc = {
      ...args.input,
      authorId: portalUser._id,
      authorKind: 'clientPortalUser',
      clientPortalId: portalUser.clientPortalId,
    };

    return await models.Posts.createPost(doc);
  },

  clientPortalUserEditPost: async (
    _root,
    args: { _id: string; input: any },
    { portalUser, models }: IContext,
  ) => {
    if (!portalUser) {
      throw new Error('login required');
    }

    await checkUserOwnsPost(models, portalUser._id, args._id);

    return await models.Posts.updatePost(args._id, args.input);
  },

  clientPortalUserRemovePost: async (
    _root,
    args: { _id: string },
    { portalUser, models }: IContext,
  ) => {
    if (!portalUser) {
      throw new Error('login required');
    }

    await checkUserOwnsPost(models, portalUser._id, args._id);

    await models.Posts.deleteOne({ _id: args._id });
    return 'removed';
  },

  clientPortalUserChangeStatus: async (
    _root,
    args: {
      _id: string;
      status: 'draft' | 'published' | 'archived' | 'scheduled';
    },
    { portalUser, models }: IContext,
  ) => {
    if (!portalUser) {
      throw new Error('login required');
    }

    await checkUserOwnsPost(models, portalUser._id, args._id);

    return await models.Posts.changeStatus(args._id, args.status);
  },

  clientPortalUserToggleFeatured: async (
    _root,
    args: { _id: string },
    { portalUser, models }: IContext,
  ) => {
    if (!portalUser) {
      throw new Error('login required');
    }

    await checkUserOwnsPost(models, portalUser._id, args._id);

    return models.Posts.toggleFeatured(args._id);
  },
};

export default postMutations;
