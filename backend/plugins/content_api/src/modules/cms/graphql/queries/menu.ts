import { IContext } from '~/connectionResolvers';
import { BaseQueryResolver, FIELD_MAPPINGS } from '@/cms/utils/base-resolvers';
import { Resolver } from 'erxes-api-shared/core-types';

class MenuQueryResolver extends BaseQueryResolver {
  async cmsMenus(_parent: any, args: any, context: IContext) {
    const { language, clientPortalId, kind } = args;
    const { models } = context;

    if (!clientPortalId) {
      throw new Error('clientPortalId is required');
    }

    const query: any = { clientPortalId };
    if (kind) {
      query.kind = kind;
    }

    const { list } = await this.getListWithTranslations(
      models.MenuItems,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.MENU,
    );

    return list;
  }

  async cmsMenuList(_parent: any, args: any, context: IContext) {
    const { language, clientPortalId, kind } = args;
    const { models } = context;

    if (!clientPortalId) {
      throw new Error('clientPortalId is required');
    }

    const query: any = { clientPortalId };
    if (kind) {
      query.kind = kind;
    }

    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.MenuItems,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.MENU,
    );

    return { menus: list, totalCount, pageInfo };
  }

  async cmsMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id, slug, language, clientPortalId } = args;

    if (!_id && !slug) {
      return null;
    }

    let query: any = {};
    if (slug) {
      query = { slug, clientPortalId };
    } else {
      query = { _id };
    }

    return this.getItemWithTranslation(
      models.MenuItems,
      query,
      language,
      FIELD_MAPPINGS.MENU,
    );
  }

  async cpMenus(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { language } = args;

    const query: any = {
      clientPortalId: clientPortal._id,
      isActive: true,
    };

    const { list } = await this.getListWithTranslations(
      models.MenuItems,
      query,
      { ...args, clientPortalId: clientPortal._id, language },
      FIELD_MAPPINGS.MENU,
    );

    return list;
  }
}

const queries: Record<string, Resolver> = {
  cmsMenus: (_parent: any, args: any, context: IContext) =>
    new MenuQueryResolver(context).cmsMenus(_parent, args, context),
  cmsMenuList: (_parent: any, args: any, context: IContext) =>
    new MenuQueryResolver(context).cmsMenuList(_parent, args, context),
  cmsMenu: (_parent: any, args: any, context: IContext) =>
    new MenuQueryResolver(context).cmsMenu(_parent, args, context),
  cpMenus: (_parent: any, args: any, context: IContext) =>
    new MenuQueryResolver(context).cpMenus(_parent, args, context),
};

queries.cpMenus.wrapperConfig = {
  forClientPortal: true,
};

export default queries;
