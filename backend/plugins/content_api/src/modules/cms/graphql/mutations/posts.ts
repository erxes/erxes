import { Resolver } from 'erxes-api-shared/core-types';
import { POST_REACTION_TYPES, PostReactionType } from '@/cms/@types/posts';
import { IContext } from '~/connectionResolvers';
import {
  assertOwnedDocument,
  assertOwnedDocuments,
  requireClientPortalId,
} from '@/cms/graphql/utils/clientPortal';
import {
  assertCmsDocumentAccess,
  assertCmsLanguageAccess,
  hasCmsPermission,
  requireCmsPermission,
} from '@/cms/utils/permissions';
import { CMS_POST_ACTIONS } from '~/meta/permissions';
import { preparePdfAttachmentPages } from '@/cms/utils/pdfAttachments';

const getDefaultLanguage = async (
  models: IContext['models'],
  clientPortalId: string,
): Promise<string | undefined> => {
  const cms = await models.CMS.findOne({ clientPortalId }).lean();
  return cms?.language;
};

const saveTranslations = async (
  models: IContext['models'],
  objectId: string,
  translations: any[],
) => {
  if (!Array.isArray(translations) || translations.length === 0) return;

  await Promise.all(
    translations.map((t) =>
      models.Translations.upsertTranslation({
        ...t,
        objectId,
        type: t.type || 'post',
      }),
    ),
  );
};

export const postMutations: Record<string, Resolver> = {
  cmsPostsAdd: async (_parent, args, context: IContext) => {
    const { models, user, subdomain } = context;
    const { input } = args;
    const { translations, language, ...postInput } = input;

    await requireCmsPermission(context, [
      CMS_POST_ACTIONS.createPublished,
      CMS_POST_ACTIONS.createReview,
    ]);
    await assertCmsLanguageAccess({
      context,
      clientPortalId: postInput.clientPortalId,
      language,
      translations,
    });

    postInput.authorId = user._id;

    const canApprove = await hasCmsPermission(
      context,
      CMS_POST_ACTIONS.approve,
    );
    const canCreatePublished = await hasCmsPermission(
      context,
      CMS_POST_ACTIONS.createPublished,
    );

    if (canCreatePublished && !canApprove) {
      postInput.status = 'published';
    } else if (canCreatePublished) {
      postInput.status = postInput.status || 'published';
    } else {
      postInput.status = 'draft';
    }

    if (
      (!postInput.title || !String(postInput.title).trim()) &&
      Array.isArray(translations) &&
      translations.length > 0
    ) {
      const defaultLanguage = await getDefaultLanguage(
        models,
        postInput.clientPortalId,
      );

      const fallback =
        (defaultLanguage &&
          translations.find((t: any) => t?.language === defaultLanguage)) ||
        translations[0];

      if (fallback) {
        postInput.title = fallback.title || postInput.title;
        postInput.content = fallback.content || postInput.content;
        postInput.excerpt = fallback.excerpt || postInput.excerpt;
        postInput.customFieldsData =
          fallback.customFieldsData || postInput.customFieldsData;
      }
    }

    postInput.pdfAttachment = await preparePdfAttachmentPages({
      subdomain,
      pdfAttachment: postInput.pdfAttachment,
    });

    const post = await models.Posts.createPost(postInput);

    await saveTranslations(models, post._id, translations || []);

    return post;
  },

  cpCmsPostsAdd: async (_parent, args, context: IContext) => {
    const { models, subdomain } = context;
    const clientPortalId = requireClientPortalId(context);
    const { input } = args;
    const {
      translations,
      language,
      clientPortalId: _ignored,
      ...postInput
    } = input;

    postInput.clientPortalId = clientPortalId;

    if (Array.isArray(postInput.categoryIds) && postInput.categoryIds.length) {
      await assertOwnedDocuments(
        models.Categories,
        postInput.categoryIds,
        clientPortalId,
        'Category not found',
      );
    }

    if (Array.isArray(postInput.tagIds) && postInput.tagIds.length) {
      await assertOwnedDocuments(
        models.PostTags,
        postInput.tagIds,
        clientPortalId,
        'Tag not found',
      );
    }

    if (postInput.webId) {
      await assertOwnedDocument(
        models.Web,
        postInput.webId,
        clientPortalId,
        'Web not found',
      );
    }

    if (
      (!postInput.title || !String(postInput.title).trim()) &&
      Array.isArray(translations) &&
      translations.length > 0
    ) {
      const defaultLanguage = await getDefaultLanguage(models, clientPortalId);

      const fallback =
        (defaultLanguage &&
          translations.find((t: any) => t?.language === defaultLanguage)) ||
        translations[0];

      if (fallback) {
        postInput.title = fallback.title || postInput.title;
        postInput.content = fallback.content || postInput.content;
        postInput.excerpt = fallback.excerpt || postInput.excerpt;
        postInput.customFieldsData =
          fallback.customFieldsData || postInput.customFieldsData;
      }
    }

    postInput.pdfAttachment = await preparePdfAttachmentPages({
      subdomain,
      pdfAttachment: postInput.pdfAttachment,
    });

    const post = await models.Posts.createPost(postInput);

    await saveTranslations(models, post._id, translations || []);

    return post;
  },

  cmsPostsEdit: async (_parent, args, context: IContext) => {
    const { models, subdomain } = context;
    const { _id, input } = args;
    const { translations, language, ...postInput } = input;
    const existingPost = await models.Posts.findOne({ _id }).lean();

    if (!existingPost) {
      throw new Error('Post not found');
    }

    await assertCmsDocumentAccess({
      context,
      actions:
        postInput.status === 'published'
          ? CMS_POST_ACTIONS.approve
          : CMS_POST_ACTIONS.update,
      document: existingPost,
    });

    await assertCmsLanguageAccess({
      context,
      clientPortalId: postInput.clientPortalId || existingPost.clientPortalId,
      language,
      translations,
    });

    const clientPortalId =
      postInput.clientPortalId || existingPost.clientPortalId;

    if (language && clientPortalId) {
      const rawDefault = await getDefaultLanguage(models, clientPortalId);

      const defaultLanguage = rawDefault || 'en';

      if (language !== defaultLanguage) {
        const translationDoc: any = { objectId: _id, language, type: 'post' };

        if (postInput.title !== undefined)
          translationDoc.title = postInput.title;
        if (postInput.content !== undefined)
          translationDoc.content = postInput.content;
        if (postInput.excerpt !== undefined)
          translationDoc.excerpt = postInput.excerpt;
        if (postInput.customFieldsData !== undefined)
          translationDoc.customFieldsData = postInput.customFieldsData;

        await models.Translations.upsertTranslation(translationDoc);

        const { title, content, excerpt, customFieldsData, ...safePostInput } =
          postInput;

        if (safePostInput.pdfAttachment !== undefined) {
          safePostInput.pdfAttachment = await preparePdfAttachmentPages({
            subdomain,
            pdfAttachment: safePostInput.pdfAttachment,
            previousPdfAttachment: existingPost.pdfAttachment,
          });
        }

        const post = await models.Posts.updatePost(_id, safePostInput);

        const remainingTranslations = (translations || []).filter(
          (t: any) => t?.language !== language,
        );
        await saveTranslations(models, _id, remainingTranslations);

        return post;
      }
    }

    if (postInput.pdfAttachment !== undefined) {
      postInput.pdfAttachment = await preparePdfAttachmentPages({
        subdomain,
        pdfAttachment: postInput.pdfAttachment,
        previousPdfAttachment: existingPost.pdfAttachment,
      });
    }

    const post = await models.Posts.updatePost(_id, postInput);

    await saveTranslations(models, _id, translations || []);

    return post;
  },

  cmsPostsRemove: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { _id } = args;
    const post = await models.Posts.findOne({ _id }).lean();

    if (!post) {
      throw new Error('Post not found');
    }

    await assertCmsDocumentAccess({
      context,
      actions: CMS_POST_ACTIONS.remove,
      document: post,
    });

    await models.Translations.deleteMany({
      $or: [{ objectId: _id }, { postId: _id }],
    });
    return models.Posts.deleteOne({ _id });
  },

  cmsPostsRemoveMany: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { _ids } = args;
    const uniqueIds = [
      ...new Set((_ids || []).map((id: string) => String(id))),
    ];

    await requireCmsPermission(context, CMS_POST_ACTIONS.remove);

    const posts = await models.Posts.find({ _id: { $in: uniqueIds } }).lean();

    if (posts.length !== uniqueIds.length) {
      throw new Error('Post not found');
    }

    for (const post of posts) {
      await assertCmsDocumentAccess({
        context,
        actions: CMS_POST_ACTIONS.remove,
        document: post,
      });
    }

    await models.Translations.deleteMany({
      $or: [{ objectId: { $in: uniqueIds } }, { postId: { $in: uniqueIds } }],
    });
    const result = await models.Posts.deleteMany({ _id: { $in: uniqueIds } });
    return { deletedCount: result.deletedCount };
  },

  cmsPostsChangeStatus: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { _id, status } = args;
    const post = await models.Posts.findOne({ _id }).lean();

    if (!post) {
      throw new Error('Post not found');
    }

    await assertCmsDocumentAccess({
      context,
      actions:
        status === 'published'
          ? CMS_POST_ACTIONS.approve
          : CMS_POST_ACTIONS.update,
      document: post,
    });

    await assertCmsLanguageAccess({
      context,
      clientPortalId: post.clientPortalId,
    });

    return models.Posts.changeStatus(_id, status);
  },

  cmsPostsToggleFeatured: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { _id } = args;
    const post = await models.Posts.findOne({ _id }).lean();

    if (!post) {
      throw new Error('Post not found');
    }

    await assertCmsDocumentAccess({
      context,
      actions: CMS_POST_ACTIONS.update,
      document: post,
    });
    await assertCmsLanguageAccess({
      context,
      clientPortalId: post.clientPortalId,
    });

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

    const targetId = input.objectId || input.postId;
    const object = await model.findOne({ _id: targetId });
    if (!object) throw new Error('Object not found');

    if (type === 'post') {
      await assertCmsDocumentAccess({
        context,
        actions: CMS_POST_ACTIONS.update,
        document: object,
      });
      await assertCmsLanguageAccess({
        context,
        clientPortalId: object.clientPortalId,
        language: input.language,
      });
    }

    return models.Translations.upsertTranslation(input);
  },

  cmsEditTranslation: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { input } = args;
    const type = input.type || 'post';

    if (type === 'post') {
      const targetId = input.objectId || input.postId;
      const post = await models.Posts.findOne({ _id: targetId }).lean();

      if (!post) {
        throw new Error('Post not found');
      }

      await assertCmsDocumentAccess({
        context,
        actions: CMS_POST_ACTIONS.update,
        document: post,
      });
      await assertCmsLanguageAccess({
        context,
        clientPortalId: post.clientPortalId,
        language: input.language,
      });
    }

    return models.Translations.upsertTranslation(input);
  },

  cmsDeleteTranslation: async (_parent, args, context: IContext) => {
    const { models } = context;
    const { _id } = args;
    const translation = await models.Translations.findOne({ _id }).lean();

    if (!translation) {
      throw new Error('Translation not found');
    }

    if (!translation.type || translation.type === 'post') {
      const post = await models.Posts.findOne({
        _id: translation.objectId,
      }).lean();

      if (!post) {
        throw new Error('Post not found');
      }

      await assertCmsDocumentAccess({
        context,
        actions: CMS_POST_ACTIONS.update,
        document: post,
      });
      await assertCmsLanguageAccess({
        context,
        clientPortalId: post.clientPortalId,
        language: translation.language,
      });
    } else {
      await requireCmsPermission(context, CMS_POST_ACTIONS.update);
      await assertCmsLanguageAccess({
        context,
        language: translation?.language,
      });
    }

    return models.Translations.deleteTranslation(_id);
  },

  cpPostsIncrementViewCount: async (_parent, args, context: IContext) => {
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

  cpPostsReact: async (_parent, args, context: IContext) => {
    const { models, clientPortal } = context;
    const { _id, reaction, action } = args as {
      _id: string;
      reaction: PostReactionType;
      action: 'inc' | 'dec';
    };

    if (!POST_REACTION_TYPES.includes(reaction)) {
      throw new Error('Invalid reaction type');
    }

    const post = await models.Posts.findOne({
      _id,
      clientPortalId: clientPortal._id,
    }).lean();

    if (!post) {
      throw new Error('Post not found');
    }

    return models.Posts.updateReactionCount(_id, reaction, action);
  },
};

postMutations.cpPostsReact.wrapperConfig = {
  forClientPortal: true,
};
postMutations.cpCmsPostsAdd.wrapperConfig = {
  forClientPortal: true,
};
