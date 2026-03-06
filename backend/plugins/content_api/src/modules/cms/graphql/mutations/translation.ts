import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

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

    console.log('🌐 cmsEditTranslation mutation called with input:', input);

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
    const { models } = context;
    const { _id } = args;

    return models.Posts.increaseViewCount(_id);
  },
};

export default mutations;
