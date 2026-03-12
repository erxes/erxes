import { IContext } from '~/connectionResolvers';
import { requireLogin } from 'erxes-api-shared/core-modules';

const mutations = {
  async cmsPagesAdd(_parent: any, args: any, context: IContext): Promise<any> {
    const { user, models } = context;
    const { input } = args;
    const { translations, ...pageInput } = input;

    pageInput.createdUserId = user._id;

    if (
      (!pageInput.name || !String(pageInput.name).trim()) &&
      Array.isArray(translations) &&
      translations.length > 0
    ) {
      const cms = await models.CMS.findOne({
        clientPortalId: pageInput.clientPortalId,
      }).lean();

      const defaultLanguage = cms?.language;
      const fallbackTranslation =
        (defaultLanguage &&
          translations.find((t: any) => t?.language === defaultLanguage)) ||
        translations[0];

      if (fallbackTranslation) {
        pageInput.name = fallbackTranslation.title || pageInput.name;
        pageInput.description =
          fallbackTranslation.content || pageInput.description;
        pageInput.customFieldsData =
          fallbackTranslation.customFieldsData || pageInput.customFieldsData;
      }
    }

    const page = await models.Pages.create(pageInput);

    if (Array.isArray(translations) && translations.length > 0) {
      const docs = translations.map((translation: any) => ({
        ...translation,
        postId: page._id,
        type: translation.type || 'page',
      }));

      await models.Translations.insertMany(docs);
    }

    return page;
  },

  /**
   * Cms page edit
   */
  async cmsPagesEdit(
    _parent: any,
    args: any,
    { models }: IContext,
  ): Promise<any> {
    const { _id, input } = args;
    const { translations, ...pageInput } = input;

    const page = await models.Pages.updatePage(_id, pageInput);

    if (Array.isArray(translations) && translations.length > 0) {
      await Promise.all(
        translations.map((translation: any) =>
          models.Translations.updateTranslation({
            ...translation,
            postId: _id,
            type: translation.type || 'page',
          }),
        ),
      );
    }

    return page;
  },

  /**
   * Cms page delete
   */
  async cmsPagesRemove(
    _parent: any,
    args: any,
    { models }: IContext,
  ): Promise<any> {
    const { _id } = args;
    const result = await models.Pages.deleteOne({ _id });

    await models.Translations.deleteMany({ postId: _id });

    return result;
  },
};

requireLogin(mutations, 'cmsPagesAdd');
requireLogin(mutations, 'cmsPagesEdit');
requireLogin(mutations, 'cmsPagesRemove');

export default mutations;
