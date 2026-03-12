import { IContext } from '~/connectionResolvers';

import { Resolver } from 'erxes-api-shared/core-types';

const mutations: Record<string, Resolver> = {
  async cmsAddMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { input } = args;
    const { translations, ...menuInput } = input;

    if (
      (!menuInput.label || !String(menuInput.label).trim()) &&
      Array.isArray(translations) &&
      translations.length > 0
    ) {
      const cms = await models.CMS.findOne({
        clientPortalId: menuInput.clientPortalId,
      }).lean();

      const defaultLanguage = cms?.language;
      const fallbackTranslation =
        (defaultLanguage &&
          translations.find((t: any) => t?.language === defaultLanguage)) ||
        translations[0];

      if (fallbackTranslation) {
        menuInput.label = fallbackTranslation.title || menuInput.label;
      }
    }

    const menu = await models.MenuItems.createMenuItem(menuInput);

    if (Array.isArray(translations) && translations.length > 0) {
      const docs = translations.map((translation: any) => ({
        ...translation,
        postId: menu._id,
        type: translation.type || 'menu',
      }));

      await models.Translations.insertMany(docs);
    }

    return menu;
  },
  cmsEditMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id, input } = args;
    const { translations, ...menuInput } = input;

    return models.MenuItems.updateMenuItem(_id, menuInput).then(
      async (menu) => {
        if (Array.isArray(translations) && translations.length > 0) {
          await Promise.all(
            translations.map((translation: any) =>
              models.Translations.updateTranslation({
                ...translation,
                postId: _id,
                type: translation.type || 'menu',
              }),
            ),
          );
        }

        return menu;
      },
    );
  },

  cmsRemoveMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;

    const result = models.MenuItems.deleteMenuItem(_id);

    // Best-effort cleanup of related translations
    models.Translations.deleteMany({ postId: _id }).catch(() => {});

    return result;
  },

  async cpCmsAddMenu(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { input } = args;
    const { translations, ...rawInput } = input;

    const { clientPortalId: _ignoredClientPortalId, ...restInput } = rawInput;

    if (
      (!restInput.label || !String(restInput.label).trim()) &&
      Array.isArray(translations) &&
      translations.length > 0
    ) {
      const cms = await models.CMS.findOne({
        clientPortalId: clientPortal?._id,
      }).lean();

      const defaultLanguage = cms?.language;
      const fallbackTranslation =
        (defaultLanguage &&
          translations.find((t: any) => t?.language === defaultLanguage)) ||
        translations[0];

      if (fallbackTranslation) {
        restInput.label = fallbackTranslation.title || restInput.label;
      }
    }

    const menu = await models.MenuItems.createMenuItem({
      ...restInput,
      clientPortalId: clientPortal?._id,
    });

    if (Array.isArray(translations) && translations.length > 0) {
      const docs = translations.map((translation: any) => ({
        ...translation,
        postId: menu._id,
        type: translation.type || 'menu',
      }));

      await models.Translations.insertMany(docs);
    }

    return menu;
  },

  cpCmsEditMenu(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { _id, input } = args;
    const { translations, ...rawInput } = input;

    const { clientPortalId: _ignoredClientPortalId, ...restInput } = rawInput;

    return models.MenuItems.updateMenuItem(_id, {
      ...restInput,
      clientPortalId: clientPortal?._id,
    }).then(async (menu) => {
      if (Array.isArray(translations) && translations.length > 0) {
        await Promise.all(
          translations.map((translation: any) =>
            models.Translations.updateTranslation({
              ...translation,
              postId: _id,
              type: translation.type || 'menu',
            }),
          ),
        );
      }

      return menu;
    });
  },

  cpCmsRemoveMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;

    const result = models.MenuItems.deleteMenuItem(_id);

    // Best-effort cleanup of related translations
    models.Translations.deleteMany({ postId: _id }).catch(() => {});

    return result;
  },
};

export default mutations;

mutations.cpCmsAddMenu.wrapperConfig = {
  forClientPortal: true,
};
mutations.cpCmsEditMenu.wrapperConfig = {
  forClientPortal: true,
};
mutations.cpCmsRemoveMenu.wrapperConfig = {
  forClientPortal: true,
};
