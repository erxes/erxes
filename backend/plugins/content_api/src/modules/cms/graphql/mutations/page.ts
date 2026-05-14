import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import {
  assertOwnedDocument,
  requireClientPortalId,
} from '@/cms/graphql/utils/clientPortal';

const getDefaultLanguage = async (
  models: IContext['models'],
  clientPortalId: string,
): Promise<string> => {
  const cms = await models.CMS.findOne({ clientPortalId }).lean();
  return cms?.language || 'en';
};

const savePageTranslations = async (
  models: IContext['models'],
  objectId: string,
  translations: any[],
  excludeLanguage?: string,
) => {
  if (!Array.isArray(translations) || translations.length === 0) return;

  const filtered = excludeLanguage
    ? translations.filter((t: any) => t?.language !== excludeLanguage)
    : translations;

  if (filtered.length === 0) return;

  await Promise.all(
    filtered.map((t) =>
      models.Translations.upsertTranslation({
        ...t,
        objectId,
        type: t.type || 'page',
      }),
    ),
  );
};

const mutations : Record<string, Resolver> = {
  async cmsPagesAdd(_parent: any, args: any, context: IContext): Promise<any> {
    const { user, models } = context;
    const { input } = args;
    const { translations, language, ...pageInput } = input;

    pageInput.createdUserId = user._id;

    // If name is empty, derive from default-language translation
    if (
      (!pageInput.name || !String(pageInput.name).trim()) &&
      Array.isArray(translations) &&
      translations.length > 0
    ) {
      const defaultLanguage = await getDefaultLanguage(
        models,
        pageInput.clientPortalId,
      );

      const fallback =
        (defaultLanguage &&
          translations.find((t: any) => t?.language === defaultLanguage)) ||
        translations[0];

      if (fallback) {
        pageInput.name = fallback.title || pageInput.name;
        pageInput.description = fallback.content || pageInput.description;
        pageInput.customFieldsData =
          fallback.customFieldsData || pageInput.customFieldsData;
      }
    }

    const page = await models.Pages.createPage(pageInput);

    await savePageTranslations(models, page._id, translations || []);

    return page;
  },

  async cpCmsPagesAdd(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const clientPortalId = requireClientPortalId(context);
    const { input } = args;
    const { translations, language, clientPortalId: _ignored, ...pageInput } =
      input;

    pageInput.clientPortalId = clientPortalId;

    if (pageInput.parentId) {
      await assertOwnedDocument(
        models.Pages,
        pageInput.parentId,
        clientPortalId,
        'Parent page not found',
      );
    }

    // If name is empty, derive from default-language translation
    if (
      (!pageInput.name || !String(pageInput.name).trim()) &&
      Array.isArray(translations) &&
      translations.length > 0
    ) {
      const defaultLanguage = await getDefaultLanguage(
        models,
        clientPortalId,
      );

      const fallback =
        (defaultLanguage &&
          translations.find((t: any) => t?.language === defaultLanguage)) ||
        translations[0];

      if (fallback) {
        pageInput.name = fallback.title || pageInput.name;
        pageInput.description = fallback.content || pageInput.description;
        pageInput.customFieldsData =
          fallback.customFieldsData || pageInput.customFieldsData;
      }
    }

    const page = await models.Pages.createPage(pageInput);

    await savePageTranslations(models, page._id, translations || []);

    return page;
  },

  async cmsPagesEdit(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const { _id, input } = args;
    const { translations, language, ...pageInput } = input;

    if (language && pageInput.clientPortalId) {
      const defaultLanguage = await getDefaultLanguage(
        models,
        pageInput.clientPortalId,
      );

      if (language !== defaultLanguage) {
        const translationDoc: any = { objectId: _id, language, type: 'page' };

        // PAGE translatable fields: name → title, description → content
        if (pageInput.name !== undefined) translationDoc.title = pageInput.name;
        if (pageInput.description !== undefined)
          translationDoc.content = pageInput.description;
        if (pageInput.customFieldsData !== undefined)
          translationDoc.customFieldsData = pageInput.customFieldsData;

        await models.Translations.upsertTranslation(translationDoc);

        // Strip translatable fields — only update shared fields on the page
        const { name, description, customFieldsData, ...safePageInput } =
          pageInput;

        const page = await models.Pages.updatePage(_id, safePageInput);

        await savePageTranslations(models, _id, translations || [], language);

        return page;
      }
    }

    // Default language edit — update everything on the page document
    const page = await models.Pages.updatePage(_id, pageInput);

    await savePageTranslations(models, _id, translations || []);

    return page;
  },

  async cmsPagesRemove(
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> {
    const { models } = context;
    const { _id } = args;

    await models.Translations.deleteMany({ objectId: _id, type: 'page' });

    return models.Pages.deletePage(_id);
  },
};

export default mutations;

mutations.cpCmsPagesAdd.wrapperConfig={
  forClientPortal:true,
}
