import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';

const queries: Record<string, Resolver> = {
  cmsMenuList: async (_parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { kind, language, clientPortalId } = args;

    if (!clientPortalId) {
      throw new Error('clientPortalId is required');
    }

    const query: any = {
      clientPortalId,
    };

    if (kind) {
      query.kind = kind;
    }

    const menus = await models.MenuItems.find(query).sort({ order: 1 });

    if (!language) {
      return menus;
    }

    const menuIds = menus.map((menu) => menu._id);

    const translations = await models.Translations.find({
      postId: { $in: menuIds },
      language,
    }).lean();

    // ✅ Build a translation map for O(1) lookup
    const translationMap = translations.reduce((acc, t) => {
      acc[t.postId.toString()] = t;
      return acc;
    }, {} as Record<string, any>);

    const menusWithTranslations = menus.map((menu) => {
      const translation = translationMap[menu._id.toString()];
      return {
        ...menu,
        ...(translation && {
          label: translation.title || menu.label,
        }),
      };
    });

    return menusWithTranslations;
  },

  cmsMenu: async (_parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { _id, language } = args;

    const menu = await models.MenuItems.findOne({ _id });

    if (!menu) {
      return null;
    }

    if (!language) {
      return menu;
    }

    const translation = await models.Translations.findOne({
      postId: menu._id,
      language,
      type: 'menu',
    });

    return {
      ...menu,
      ...(translation && {
        label: translation.title || menu.label,
      }),
    };
  },

  cpMenus: async (_parent: any, args: any, context: IContext) => {
    const { models, clientPortal } = context;
    const { language } = args;

    const query: any = {
      clientPortalId: clientPortal._id,
      isActive: true,
    };

    const menus = await models.MenuItems.find(query).sort({ order: 1 });

    if (!language) {
      return menus;
    }

    const menuIds = menus.map((menu) => menu._id);

    const translations = await models.Translations.find({
      postId: { $in: menuIds },
      language,
    }).lean();

    // ✅ Build a translation map for O(1) lookup
    const translationMap = translations.reduce((acc, t) => {
      acc[t.postId.toString()] = t;
      return acc;
    }, {} as Record<string, any>);

    const menusWithTranslations = menus.map((menu) => {
      const translation = translationMap[menu._id.toString()];
      return {
        ...menu,
        ...(translation && {
          label: translation.title || menu.label,
        }),
      };
    });

    return menusWithTranslations;
  },
};

queries.cpMenus.wrapperConfig = {
  forClientPortal: true,
};

export default queries;
