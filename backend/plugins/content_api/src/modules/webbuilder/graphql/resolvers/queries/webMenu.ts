import { IContext } from '~/connectionResolvers';
import { BaseQueryResolver, FIELD_MAPPINGS } from '~/modules/webbuilder/utils/base-resolvers';
import { Resolver } from 'erxes-api-shared/core-types';

class WebMenuQueryResolver extends BaseQueryResolver {
  async cpWebMenuList(_parent: any, args: any, context: IContext) {
    const { language, webId, kind } = args;
    const { models } = context;

    if (!webId) throw new Error('webId is required');

    const query: any = { webId };
    if (kind) query.kind = kind;

    const { list } = await this.getListWithTranslations(
      models.WebMenuItems,
      query,
      { ...args, clientPortalId: null, language },
      FIELD_MAPPINGS.MENU,
    );

    return list;
  }

  async cpWebMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id, language } = args;

    if (!_id) return null;

    return this.getItemWithTranslation(
      models.WebMenuItems,
      { _id },
      language,
      FIELD_MAPPINGS.MENU,
    );
  }

  async cpWebMenus(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { language, kind, webId } = args;

    if (!webId) throw new Error('webId is required');

    const query: any = { webId, isActive: true };
    if (kind) query.kind = kind;

    const { list } = await this.getListWithTranslations(
      models.WebMenuItems,
      query,
      { ...args, clientPortalId: null, language },
      FIELD_MAPPINGS.MENU,
    );

    return list;
  }
}

export const webMenuQueries: Record<string, Resolver> = {
  cpWebMenus: (_parent: any, args: any, context: IContext) =>
    new WebMenuQueryResolver(context).cpWebMenus(_parent, args, context),
  cpWebMenuList: (_parent: any, args: any, context: IContext) =>
    new WebMenuQueryResolver(context).cpWebMenuList(_parent, args, context),
  cpWebMenu: (_parent: any, args: any, context: IContext) =>
    new WebMenuQueryResolver(context).cpWebMenu(_parent, args, context),
};

webMenuQueries.cpWebMenus.wrapperConfig = { forClientPortal: true };
webMenuQueries.cpWebMenuList.wrapperConfig = { forClientPortal: true };
webMenuQueries.cpWebMenu.wrapperConfig = { forClientPortal: true };