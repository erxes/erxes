import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';

const getDefaultLanguage = async (
  models: IContext['models'],
  clientPortalId: string,
): Promise<string | undefined> => {
  const cms = await models.CMS.findOne({ clientPortalId }).lean();
  return cms?.language;
};

const saveMenuTranslations = async (
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
        type: t.type || 'menu',
      }),
    ),
  );
};

const mutations: Record<string, Resolver> = {
  async cmsAddMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { input } = args;
    const { translations, language, ...menuInput } = input;

    if (
      (!menuInput.label || !String(menuInput.label).trim()) &&
      Array.isArray(translations) &&
      translations.length > 0
    ) {
      const defaultLanguage =
        (await getDefaultLanguage(models, menuInput.clientPortalId)) || 'en';

      const fallback =
        (defaultLanguage &&
          translations.find((t: any) => t?.language === defaultLanguage)) ||
        translations[0];

      if (fallback) {
        menuInput.label = fallback.title || menuInput.label;
      }
    }

    const menu = await models.MenuItems.createMenuItem(menuInput);

    await saveMenuTranslations(models, menu._id, translations || []);

    return menu;
  },

  async cmsEditMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id, input } = args;
    const { translations, language, ...menuInput } = input;

    if (language && menuInput.clientPortalId) {
      const rawDefault = await getDefaultLanguage(
        models,
        menuInput.clientPortalId,
      );
      const defaultLanguage = rawDefault || 'en';

      if (language !== defaultLanguage) {
        const translationDoc: any = { objectId: _id, language, type: 'menu' };

        if (menuInput.label !== undefined)
          translationDoc.title = menuInput.label;

        await models.Translations.upsertTranslation(translationDoc);

        const { label, ...safeMenuInput } = menuInput;

        const menu = await models.MenuItems.updateMenuItem(_id, safeMenuInput);

        await saveMenuTranslations(models, _id, translations || [], language);

        return menu;
      }
    }

    const menu = await models.MenuItems.updateMenuItem(_id, menuInput);

    await saveMenuTranslations(models, _id, translations || []);

    return menu;
  },

  async cmsRemoveMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;

    await models.Translations.deleteMany({ objectId: _id, type: 'menu' });

    return models.MenuItems.deleteMenuItem(_id);
  },

  async cpCmsAddMenu(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { input } = args;
    const {
      translations,
      language,
      clientPortalId: _ignored,
      ...restInput
    } = input;

    const clientPortalId = clientPortal?._id;

    if (
      (!restInput.label || !String(restInput.label).trim()) &&
      Array.isArray(translations) &&
      translations.length > 0
    ) {
      const defaultLanguage =
        (await getDefaultLanguage(models, clientPortalId)) || 'en';

      const fallback =
        (defaultLanguage &&
          translations.find((t: any) => t?.language === defaultLanguage)) ||
        translations[0];

      if (fallback) {
        restInput.label = fallback.title || restInput.label;
      }
    }

    const menu = await models.MenuItems.createMenuItem({
      ...restInput,
      clientPortalId,
    });

    await saveMenuTranslations(models, menu._id, translations || []);

    return menu;
  },

  async cpCmsEditMenu(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { _id, input } = args;
    const {
      translations,
      language,
      clientPortalId: _ignored,
      ...restInput
    } = input;

    const clientPortalId = clientPortal?._id;

    if (language && clientPortalId) {
      const rawDefault = await getDefaultLanguage(models, clientPortalId);
      const defaultLanguage = rawDefault || 'en';

      if (language !== defaultLanguage) {
        const translationDoc: any = { objectId: _id, language, type: 'menu' };

        if (restInput.label !== undefined)
          translationDoc.title = restInput.label;

        await models.Translations.upsertTranslation(translationDoc);

        const { label, ...safeRestInput } = restInput;

        const menu = await models.MenuItems.updateMenuItem(_id, {
          ...safeRestInput,
          clientPortalId,
        });

        await saveMenuTranslations(models, _id, translations || [], language);

        return menu;
      }
    }

    const menu = await models.MenuItems.updateMenuItem(_id, {
      ...restInput,
      clientPortalId,
    });

    await saveMenuTranslations(models, _id, translations || []);

    return menu;
  },

  async cpCmsRemoveMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;

    await models.Translations.deleteMany({ objectId: _id, type: 'menu' });

    return models.MenuItems.deleteMenuItem(_id);
  },
};

export default mutations;

mutations.cpCmsAddMenu.wrapperConfig = { forClientPortal: true };
mutations.cpCmsEditMenu.wrapperConfig = { forClientPortal: true };
mutations.cpCmsRemoveMenu.wrapperConfig = { forClientPortal: true };