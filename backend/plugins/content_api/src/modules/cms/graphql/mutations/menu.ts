import { IContext } from '~/connectionResolvers';

const mutations: Record<string, Resolver> = {
  cmsAddMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { input } = args;

    return models.MenuItems.createMenuItem(input);
  },
  cmsEditMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id, input } = args;

    return models.MenuItems.updateMenuItem(_id, input);
  },

  cmsRemoveMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;

    return models.MenuItems.deleteMenuItem(_id);
  },

  cpCmsAddMenu(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { input } = args;

    const { clientPortalId: _ignoredClientPortalId, ...restInput } = input;

    return models.MenuItems.createMenuItem({
      ...restInput,
      clientPortalId: clientPortal?._id,
    });
  },

  cpCmsEditMenu(_parent: any, args: any, context: IContext) {
    const { models, clientPortal } = context;
    const { _id, input } = args;

    const { clientPortalId: _ignoredClientPortalId, ...restInput } = input;

    return models.MenuItems.updateMenuItem(_id, {
      ...restInput,
      clientPortalId: clientPortal?._id,
    });
  },

  cpCmsRemoveMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;

    return models.MenuItems.deleteMenuItem(_id);
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
