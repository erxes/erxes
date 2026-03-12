import { IContext } from '~/connectionResolvers';

const MenuItem = {
  async parent(menuItem: any, _params: any, { models }: IContext) {
    if (!menuItem.parentId) return null;
    return models.MenuItems.findOne({ _id: menuItem.parentId });
  },

  async translations(menuItem: any, _params: any, { models }: IContext) {
    return models.Translations.find({
      objectId: menuItem._id,
      type: 'menu',
    }).lean();
  },
};

export { MenuItem };