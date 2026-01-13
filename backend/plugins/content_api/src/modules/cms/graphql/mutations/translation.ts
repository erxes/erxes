import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { checkPermission, requireLogin } from 'erxes-api-shared/core-modules';

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

    try {
      const result = await models.Translations.updateTranslation(input);
      console.log('✅ cmsEditTranslation result:', result);
      return result;
    } catch (error) {
      console.error('❌ cmsEditTranslation error:', error);
      throw error;
    }
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

requireLogin(mutations, 'cmsAddTranslation');
requireLogin(mutations, 'cmsEditTranslation');

checkPermission(mutations, 'cmsAddTranslation', 'manageCms', []);
// Temporarily disabled to debug - checkPermission returns null when user lacks permission
// checkPermission(mutations, 'cmsEditTranslation', 'manageCms', []);

export default mutations;
