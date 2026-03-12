import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

const getDefaultLanguage = async (
  models: IContext['models'],
  clientPortalId: string,
): Promise<string | undefined> => {
  const cms = await models.CMS.findOne({ clientPortalId }).lean();
  return cms?.language;
};

const saveTranslations = async (
  models: IContext['models'],
  postId: string,
  translations: any[],
) => {
  if (!Array.isArray(translations) || translations.length === 0) return;

  await Promise.all(
    translations.map((t) =>
      models.Translations.upsertTranslation({
        ...t,
        postId,
        type: t.type || 'post',
      }),
    ),
  );
};

export const postMutations: Record<string, Resolver> = {
  cmsPostsAdd: async (_parent, args, context: IContext) => {
    const { models, user } = context;
    const { input } = args;
    const { translations, language, ...postInput } = input;

    postInput.authorId = user._id;

    if (
      (!postInput.title || !String(postInput.title).trim()) &&
      Array.isArray(translations) &&
      translations.length > 0
    ) {
      const defaultLanguage = await getDefaultLanguage(models, postInput.clientPortalId);

      const fallback =
        (defaultLanguage && translations.find((t: any) => t?.language === defaultLanguage)) ||
        translations[0];

      if (fallback) {
        postInput.title = fallback.title || postInput.title;
        postInput.content = fallback.content || postInput.content;
        postInput.excerpt = fallback.excerpt || postInput.excerpt;
        postInput.customFieldsData = fallback.customFieldsData || postInput.customFieldsData;
      }
    }

    const post = await models.Posts.createPost(postInput);

    await saveTranslations(models, post._id, translations || []);

    return post;
  },

  cmsPostsEdit: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { _id, input } = args;
    const { translations, language, ...postInput } = input;

    if (language && postInput.clientPortalId) {
      const rawDefault = await getDefaultLanguage(models, postInput.clientPortalId);

      const defaultLanguage = rawDefault || 'en';

      if (language !== defaultLanguage) {
        const translationDoc: any = { objectId: _id, language, type: 'post' };

        if (postInput.title !== undefined) translationDoc.title = postInput.title;
        if (postInput.content !== undefined) translationDoc.content = postInput.content;
        if (postInput.excerpt !== undefined) translationDoc.excerpt = postInput.excerpt;
        if (postInput.customFieldsData !== undefined)
          translationDoc.customFieldsData = postInput.customFieldsData;

        await models.Translations.upsertTranslation(translationDoc);

        const { title, content, excerpt, customFieldsData, ...safePostInput } = postInput;

        const post = await models.Posts.updatePost(_id, safePostInput);

        const remainingTranslations = (translations || []).filter(
          (t: any) => t?.language !== language,
        );
        await saveTranslations(models, _id, remainingTranslations);

        return post;
      }
    }

    const post = await models.Posts.updatePost(_id, postInput);

    await saveTranslations(models, _id, translations || []);

    return post;
  },

  cmsPostsRemove: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { _id } = args;

    await models.Translations.deleteMany({ postId: _id });
    return models.Posts.deleteOne({ _id });
  },

  cmsPostsRemoveMany: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { _ids } = args;

    await models.Translations.deleteMany({ postId: { $in: _ids } });
    const result = await models.Posts.deleteMany({ _id: { $in: _ids } });
    return { deletedCount: result.deletedCount };
  },

  cmsPostsChangeStatus: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { _id, status } = args;
    return models.Posts.changeStatus(_id, status);
  },

  cmsPostsToggleFeatured: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { _id } = args;
    return models.Posts.toggleFeatured(_id);
  },

  cmsAddTranslation: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { input } = args;
    const { type } = input;

    const modelMap: Record<string, any> = {
      post: models.Posts,
      page: models.Pages,
      category: models.Categories,
      tag: models.PostTags,
      menu: models.MenuItems,
    };

    const model = modelMap[type];
    if (!model) throw new Error(`Invalid type: ${type}`);

    const object = await model.findOne({ _id: input.postId });
    if (!object) throw new Error('Object not found');

    return models.Translations.upsertTranslation(input);
  },

  cmsEditTranslation: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { input } = args;
    return models.Translations.upsertTranslation(input);
  },

  cmsDeleteTranslation: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { _id } = args;
    return models.Translations.deleteTranslation(_id);
  },

  cpPostsIncrementViewCount: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { _id } = args;
    return models.Posts.increaseViewCount(_id);
  },
};