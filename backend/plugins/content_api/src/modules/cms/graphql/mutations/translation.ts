import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import {
  assertOwnedDocument,
  requireClientPortalId,
} from '@/cms/graphql/utils/clientPortal';

const getTranslationTargetModel = (
  models: IContext['models'],
  type = 'post',
) => {
  const modelMap: Record<string, any> = {
    post: models.Posts,
    page: models.Pages,
    category: models.Categories,
    tag: models.PostTags,
    menu: models.MenuItems,
  };

  const model = modelMap[type];

  if (!model) {
    throw new Error(`Invalid type: ${type}`);
  }

  return model;
};

const mutations: Record<string, Resolver> = {
  /**
   * Add translation for a post
   */
  cmsAddTranslation: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { input } = args;

    return models.Translations.createTranslation(input);
  },

  cpCmsAddTranslation: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const clientPortalId = requireClientPortalId(context);
    const { input } = args;
    const type = input.type || 'post';
    const objectId = input.objectId || input.postId;

    if (!objectId) {
      throw new Error('objectId is required');
    }

    await assertOwnedDocument(
      getTranslationTargetModel(models, type),
      objectId,
      clientPortalId,
      'Object not found',
    );

    return models.Translations.createTranslation({
      ...input,
      objectId,
      type,
    });
  },

  /**
   * Edit translation for a post
   */
  cmsEditTranslation: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { input } = args;

    return models.Translations.updateTranslation(input);
  },

  /**
   * Increment view count for client portal post
   */
  cpPostsIncrementViewCount: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models, clientPortal } = context;
    const { _id } = args;

    const post = await models.Posts.findOne({
      _id,
      clientPortalId: clientPortal._id,
    }).lean();

    if (!post) {
      throw new Error('Post not found');
    }

    return models.Posts.increaseViewCount(_id);
  },
};

export default mutations;

mutations.cpPostsIncrementViewCount.wrapperConfig = {
  forClientPortal: true,
};
mutations.cpCmsAddTranslation.wrapperConfig = {
  forClientPortal: true,
};
