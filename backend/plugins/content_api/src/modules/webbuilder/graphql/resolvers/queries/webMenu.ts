import { IContext } from '~/connectionResolvers';
import { BaseQueryResolver, FIELD_MAPPINGS } from '@/cms/utils/base-resolvers';
import { Resolver } from 'erxes-api-shared/core-types';

class WebMenuQueryResolver extends BaseQueryResolver {
  async webMenuList(_parent: any, args: any, context: IContext) {
    const { language, webId, kind } = args;
    const { models } = context;

    if (!webId) {
      throw new Error('webId is required');
    }

    const query: any = { webId };
    if (kind) {
      query.kind = kind;
    }

    const { list } = await this.getListWithTranslations(
      models.WebMenuItems,
      query,
      { ...args, clientPortalId: null, language },
      FIELD_MAPPINGS.MENU,
    );

    return list;
  }

  async webMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id, language, webId } = args;

    if (!_id) {
      return null;
    }

    if (!webId) throw new Error('webId is required');

    const query: any = { _id, webId };

    return this.getItemWithTranslation(
      models.WebMenuItems,
      query,
      language,
      FIELD_MAPPINGS.MENU,
    );
  }

  async cpWebMenus(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { language, kind } = args;

    if (!clientPortal) {
      throw new Error('Client portal required');
    }

    const web = await models.Web.findOne({ clientPortalId: clientPortal._id });

    if (!web) {
      throw new Error('Web not found for this client portal');
    }

    const query: any = {
      webId: web._id,
      isActive: true,
    };

    if (kind) {
      query.kind = kind;
    }

    const { list } = await this.getListWithTranslations(
      models.WebMenuItems,
      query,
      { ...args, clientPortalId: clientPortal._id, language },
      FIELD_MAPPINGS.MENU,
    );

    return list;
  }
}

export const webMenuQueries: Record<string, Resolver> = {
  cpWebMenus: (_parent: any, args: any, context: IContext) =>
    new WebMenuQueryResolver(context).cpWebMenus(_parent, args, context),
  cpWebMenuList: (_parent: any, args: any, context: IContext) =>
    new WebMenuQueryResolver(context).webMenuList(_parent, args, context),
  cpWebMenu: (_parent: any, args: any, context: IContext) =>
    new WebMenuQueryResolver(context).webMenu(_parent, args, context),
};

webMenuQueries.cpWebMenus.wrapperConfig = {
  forClientPortal: true,
};

webMenuQueries.cpWebMenuList.wrapperConfig = {
  forClientPortal: true,
};

webMenuQueries.cpWebMenu.wrapperConfig = {
  forClientPortal: true,
};
