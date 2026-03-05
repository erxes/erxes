import { Resolver } from 'erxes-api-shared/core-types';

import { IContext } from '~/connectionResolvers';

export const webPostMutations: Record<string, Resolver> = {
  cpWebPostsAdd: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models, user } = context;
    const { input } = args;

    if (!input.webId) throw new Error('webId is required');

    input.authorId = user?._id;

    return models.WebPosts.createPost(input);
  },

  cpWebPostsEdit: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id, input } = args;

    if (!input.webId) throw new Error('webId is required');

    return models.WebPosts.updatePost(_id, input);
  },

  cpWebPostsRemove: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.WebPosts.deletePost(_id);
  },

  cpWebPostsChangeStatus: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id, status } = args;

    return models.WebPosts.changeStatus(_id, status);
  },

  cpWebPostsToggleFeatured: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.WebPosts.toggleFeatured(_id);
  },

  cpWebAddTranslation: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { input } = args;

    const object = await models.WebPosts.findOne({ _id: input.postId });
    if (!object) {
      throw new Error('Object not found');
    }

    return models.Translations.createTranslation(input);
  },

  cpWebEditTranslation: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { input } = args;

    const translation = await models.Translations.findOne({
      language: input.language,
      postId: input.postId,
    });

    if (!translation) {
      return models.Translations.createTranslation(input);
    }

    return models.Translations.updateTranslation({
      ...translation.toObject(),
      ...input,
    });
  },
};

webPostMutations.cpWebPostsAdd.wrapperConfig = {
  forClientPortal: true,
};

webPostMutations.cpWebPostsEdit.wrapperConfig = {
  forClientPortal: true,
};

webPostMutations.cpWebPostsRemove.wrapperConfig = {
  forClientPortal: true,
};

webPostMutations.cpWebPostsChangeStatus.wrapperConfig = {
  forClientPortal: true,
};

webPostMutations.cpWebPostsToggleFeatured.wrapperConfig = {
  forClientPortal: true,
};

webPostMutations.cpWebAddTranslation.wrapperConfig = {
  forClientPortal: true,
};

webPostMutations.cpWebEditTranslation.wrapperConfig = {
  forClientPortal: true,
};
