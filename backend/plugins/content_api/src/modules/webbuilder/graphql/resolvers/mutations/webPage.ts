import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

const getDefaultLanguage = async (
  models: IContext['models'],
  clientPortalId: string,
): Promise<string> => {
  const cms = await models.CMS.findOne({ clientPortalId }).lean();
  return cms?.language || 'en';
};

const saveWebPageTranslations = async (
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
        type: t.type || 'webPage',
      }),
    ),
  );
};

export const webPageMutations: Record<string, Resolver> = {
  async cpWebPagesAdd(
    _parent: unknown,
    args: any,
    context: IContext,
  ): Promise<any> {
    const { models, clientPortal } = context;
    const { input } = args;
    const {
      translations,
      language,
      clientPortalId: _ignored,
      ...restInput
    } = input;

    if (!restInput.webId) throw new Error('webId is required');

    if (!clientPortal?._id) {
      throw new Error('Client portal context is required');
    }
    const clientPortalId = clientPortal._id;

    // If name is empty, derive from default-language translation
    if (
      (!restInput.name || !String(restInput.name).trim()) &&
      Array.isArray(translations) &&
      translations.length > 0
    ) {
      const defaultLanguage = await getDefaultLanguage(models, clientPortalId);

      const fallback =
        translations.find((t: any) => t?.language === defaultLanguage) ||
        translations[0];

      if (fallback) {
        restInput.name = fallback.title || restInput.name;
        restInput.description = fallback.content || restInput.description;
        restInput.customFieldsData =
          fallback.customFieldsData || restInput.customFieldsData;
      }
    }

    const page = await models.WebPages.createPage({
      ...restInput,
      clientPortalId,
    });

    await saveWebPageTranslations(models, page._id, translations || []);

    return page;
  },

  async cpWebPagesEdit(
    _parent: unknown,
    args: any,
    context: IContext,
  ): Promise<any> {
    const { models, clientPortal } = context;
    const { _id, input } = args;
    const {
      translations,
      language,
      clientPortalId: _ignored,
      ...restInput
    } = input;

    if (!clientPortal?._id) {
      throw new Error('Client portal context is required');
    }
    const clientPortalId = clientPortal._id;

    if (language && clientPortalId) {
      const defaultLanguage = await getDefaultLanguage(models, clientPortalId);

      if (language !== defaultLanguage) {
        const translationDoc: any = {
          objectId: _id,
          language,
          type: 'webPage',
        };

        // translatable fields: name → title, description → content
        if (restInput.name !== undefined) translationDoc.title = restInput.name;
        if (restInput.description !== undefined)
          translationDoc.content = restInput.description;
        if (restInput.customFieldsData !== undefined)
          translationDoc.customFieldsData = restInput.customFieldsData;

        await models.Translations.upsertTranslation(translationDoc);

        // Strip translatable fields — only update shared fields on the doc
        const { name, description, customFieldsData, ...safeInput } = restInput;

        const page = await models.WebPages.updatePage(_id, {
          ...safeInput,
          clientPortalId,
        });

        await saveWebPageTranslations(
          models,
          _id,
          translations || [],
          language,
        );

        return page;
      }
    }

    // Default language — update everything
    const page = await models.WebPages.updatePage(_id, {
      ...restInput,
      clientPortalId,
    });

    await saveWebPageTranslations(models, _id, translations || []);

    return page;
  },

  async cpWebPagesRemove(
    _parent: unknown,
    args: any,
    { models }: IContext,
  ): Promise<any> {
    const { _id } = args;

    await models.Translations.deleteMany({ objectId: _id, type: 'webPage' });

    return models.WebPages.deletePage(_id);
  },
};

webPageMutations.cpWebPagesAdd.wrapperConfig = { forClientPortal: true };
webPageMutations.cpWebPagesEdit.wrapperConfig = { forClientPortal: true };
webPageMutations.cpWebPagesRemove.wrapperConfig = { forClientPortal: true };
