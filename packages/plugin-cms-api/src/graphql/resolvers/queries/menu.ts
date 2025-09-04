
import { IContext } from '../../../connectionResolver';

const queries = {
  cmsMenuList: async (_parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { kind, language } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;

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

    const translations = await models.PostTranslations.find({
      postId: { $in: menuIds },
      language,
    }).lean();

    const translationsMap = translations.reduce((acc, translation) => {
      acc[translation.postId.toString()] = translation;
      return acc;
    }, {});

    const menusWithTranslations = menus.map((menu) => {
      const translation = translationsMap[menu._id.toString()];
      menu.label = translation?.title || menu.label;

      return menu;
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

    const translation = await models.PostTranslations.findOne({
      postId: _id,
      language,
    }).lean();

    menu.label = translation?.title || menu.label;

    return menu;
  },
};

export default queries;