import { IContext } from '~/connectionResolvers';

const getDefaultLanguage = async (
  models: IContext['models'],
  clientPortalId: string,
): Promise<string> => {
  const cms = await models.CMS.findOne({ clientPortalId }).lean();
  return cms?.language || 'en';
};

const saveTagTranslations = async (
  models: IContext['models'],
  objectId: string,
  translations: any[],
  excludeLanguage?: string,
) => {
  if (!Array.isArray(translations) || translations.length === 0) return;

  const filtered = excludeLanguage
    ? translations.filter(
        (translation: any) => translation?.language !== excludeLanguage,
      )
    : translations;

  if (filtered.length === 0) return;

  await Promise.all(
    filtered.map((translation: any) =>
      models.Translations.upsertTranslation({
        ...translation,
        objectId,
        type: translation.type || 'tag',
      }),
    ),
  );
};

export const contentCmsTagMutations = {
  /**
   * Cms tag add
   */
  cmsTagsAdd: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { input } = args;
    const { translations, ...tagInput } = input;
    delete tagInput.language;

    if (
      (!tagInput.name || !String(tagInput.name).trim()) &&
      Array.isArray(translations) &&
      translations.length > 0
    ) {
      const defaultLanguage = await getDefaultLanguage(
        models,
        tagInput.clientPortalId,
      );

      const fallback =
        translations.find(
          (translation: any) => translation?.language === defaultLanguage,
        ) || translations[0];

      if (fallback) {
        tagInput.name = fallback.title || tagInput.name;
      }
    }

    const tag = await models.PostTags.createTag(tagInput);

    await saveTagTranslations(models, tag._id, translations || []);

    return tag;
  },

  /**
   * Cms tag edit
   */
  cmsTagsEdit: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id, input } = args;
    const { translations, language, ...tagInput } = input;

    const clientPortalId =
      tagInput.clientPortalId ||
      (
        await models.PostTags.findOne({ _id })
          .select({ clientPortalId: 1 })
          .lean()
      )?.clientPortalId;

    if (language && clientPortalId) {
      const defaultLanguage = await getDefaultLanguage(models, clientPortalId);

      if (language !== defaultLanguage) {
        const translationDoc: any = {
          objectId: _id,
          language,
          type: 'tag',
        };

        if (tagInput.name !== undefined) {
          translationDoc.title = tagInput.name;
        }

        await models.Translations.upsertTranslation(translationDoc);

        const { name, ...safeTagInput } = tagInput;

        safeTagInput.clientPortalId = clientPortalId;

        const tag = await models.PostTags.updateTag(_id, safeTagInput);

        await saveTagTranslations(models, _id, translations || [], language);

        return tag;
      }
    }

    const tag = await models.PostTags.updateTag(_id, tagInput);

    await saveTagTranslations(models, _id, translations || []);

    return tag;
  },

  /**
   * Cms tag remove
   */
  cmsTagsRemove: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    await models.Translations.deleteMany({ objectId: _id, type: 'tag' });

    return models.PostTags.deleteOne({ _id });
  },

  /**
   * Cms tag toggle status
   */
  cmsTagsToggleStatus: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.PostTags.toggleStatus(_id);
  },
};
