import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const webMenuMutations: Record<string, Resolver> = {
  cpWebAddMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { input } = args;

    if (!input.webId) throw new Error('webId is required');

    return models.WebMenuItems.createMenuItem(input);
  },
  cpWebEditMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id, input } = args;

    if (input.webId == null) {
      throw new Error('webId is required');
    }

    return models.WebMenuItems.updateMenuItem(_id, input);
  },

  cpWebRemoveMenu(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;

    return models.WebMenuItems.deleteMenuItem(_id);
  },
};

webMenuMutations.cpWebAddMenu.wrapperConfig = {
  forClientPortal: true,
};

webMenuMutations.cpWebEditMenu.wrapperConfig = {
  forClientPortal: true,
};

webMenuMutations.cpWebRemoveMenu.wrapperConfig = {
  forClientPortal: true,
};
