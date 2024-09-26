import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';
import slugify from 'slugify';

const mutations = {
  /**
   * Cms category add
   */
  cmsCategoriesAdd: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { input } = args;
    const doc: any = input

    if (!input.slug) {
      doc.slug = slugify(doc.name, { lower: true });
    }

    const category = new models.Categories(doc);
    console.log(category, 'category');
    return category.save();
  },

  /**
   * Cms category edit
   */
  cmsCategoriesEdit: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { _id, input } = args;
    const category = await models.Categories.findById(_id);

    if (!category) {
      throw new Error('Category not found');
    }

    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        category[key] = input[key];
      }
    }

    return category.save();
  },

  /**
   * Cms category remove
   */
  cmsCategoriesRemove: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.Categories.deleteOne({ _id });
  },
};

requireLogin(mutations, 'cmsCategories');
checkPermission(mutations, 'cmsCategories', 'manageCmsCategories', []);

export default mutations;

