import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';

const checkUserOwnsPost = async (subdomain, userId: string, postId: string) => {
  const post = await sendCommonMessage({
    subdomain,
    serviceName: 'cms',
    action: 'getPost',
    data: { _id: postId, authorId: userId },
    isRPC: true,
    defaultValue: null,
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
    { subdomain, cpUser }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const doc = {
      ...args.input,
      authorId: cpUser._id,
      authorKind: 'clientPortalUser',
      clientPortalId: cpUser.clientPortalId,
    };

    const result = await sendCommonMessage({
      subdomain,
      serviceName: 'cms',
      action: 'addPost',
      data: doc,
      isRPC: true,
      defaultValue: null,
    });

    return result.data;
  },

  clientPortalUserEditPost: async (
    _root,
    args: { _id: string; input: any },
    { subdomain, cpUser }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    await checkUserOwnsPost(subdomain, cpUser._id, args._id);

    const result = await sendCommonMessage({
      subdomain,
      serviceName: 'cms',
      action: 'editPost',
      data: { ...args.input, _id: args._id },
      isRPC: true,
      defaultValue: null,
    });

    return result.data;
  },

  clientPortalUserRemovePost: async (
    _root,
    args: { _id: string },
    { subdomain, cpUser }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    await checkUserOwnsPost(subdomain, cpUser._id, args._id);

    const result = await sendCommonMessage({
      subdomain,
      serviceName: 'cms',
      action: 'removePost',
      data: { _id: args._id },
      isRPC: true,
      defaultValue: null,
    });

    return result.data;
  },

  clientPortalUserChangeStatus: async (
    _root,
    args: { _id: string; status: string },
    { subdomain, cpUser }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    await checkUserOwnsPost(subdomain, cpUser._id, args._id);

    const result = await sendCommonMessage({
      subdomain,
      serviceName: 'cms',
      action: 'editPost',
      data: { _id: args._id, status: args.status },
      isRPC: true,
      defaultValue: null,
    });

    return result.data;
  },

  clientPortalUserToggleFeatured: async (
    _root,
    args: { _id: string },
    { subdomain, cpUser }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const post = await checkUserOwnsPost(subdomain, cpUser._id, args._id);

    const result = await sendCommonMessage({
      subdomain,
      serviceName: 'cms',
      action: 'editPost',
      data: { _id: args._id, featured: !post.featured },
      isRPC: true,
      defaultValue: null,
    });

    return result.data;
  },
};

export default postMutations;
