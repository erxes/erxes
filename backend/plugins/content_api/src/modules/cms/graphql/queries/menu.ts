import { IContext } from '~/connectionResolvers';
import { BaseQueryResolver, FIELD_MAPPINGS } from '@/cms/utils/base-resolvers';
import { Resolver } from 'erxes-api-shared/core-types';

class MenuQueryResolver extends BaseQueryResolver {
  async cmsMenus(_parent: any, args: any, context: IContext) {
    const { language, clientPortalId, kind } = args;
    const { models } = context;

    if (!clientPortalId) throw new Error('clientPortalId is required');

    const query: any = { clientPortalId };
    if (kind) query.kind = kind;

    const { list } = await this.getListWithTranslations(
      models.MenuItems,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.MENU,
      'menu',
    );

    return list;
  }

  async cmsMenuList(_parent: any, args: any, context: IContext) {
    const { language, clientPortalId, kind } = args;
    const { models } = context;

    if (!clientPortalId) throw new Error('clientPortalId is required');

    const query: any = { clientPortalId };
    if (kind) query.kind = kind;

    const { list } = await this.getListWithTranslations(
      models.MenuItems,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.MENU,
      'menu',
    );

    return list;
  }

  async cmsMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id, slug, language, clientPortalId } = args;

    if (!_id && !slug) return null;

    if (!clientPortalId) throw new Error('clientPortalId is required');
    const query = slug ? { slug, clientPortalId } : { _id, clientPortalId };

    return this.getItemWithTranslation(
      models.MenuItems,
      query,
      language,
      FIELD_MAPPINGS.MENU,
      clientPortalId,
      'menu',
    );
  }

  async cpMenus(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { language, kind, webId } = args;
    const clientPortalId = clientPortal._id;

    const query: any = { clientPortalId };
    if (webId) query.webId = webId;
    if (kind) query.kind = kind;

    const { list } = await this.getListWithTranslations(
      models.MenuItems,
      query,
      { ...args, clientPortalId, language },
      FIELD_MAPPINGS.MENU,
      'menu',
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

queries.cpMenus.wrapperConfig = { forClientPortal: true };

export default queries;
