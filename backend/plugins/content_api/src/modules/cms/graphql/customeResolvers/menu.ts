import { IContext } from '~/connectionResolvers';

const MenuItem = {
  async parent(menuItem: any, _params, { models }: IContext) {
    if (!menuItem.parentId) {
      return null;
    }
    return models.MenuItems.findOne({ _id: menuItem.parentId });
  },
};

export { MenuItem };
