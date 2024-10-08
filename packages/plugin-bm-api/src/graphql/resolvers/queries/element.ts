import { skip } from 'node:test';
import { IContext } from '../../../connectionResolver';

const elementQueries = {
  async bmElements(
    _root,
    { categories, page, perPage = 10 },
    { models }: IContext
  ) {
    const selector: any = {};

    const skip = Math.max(0, page) * perPage;
    if (categories) {
      selector.categories = { $in: categories };
    }

    return await models.Elements.find(selector).limit(perPage).skip(skip);
  },

  async bmElementCategoryies(_root, { parentId }, { models }: IContext) {
    const selector: any = {};

    if (parentId) {
      selector.parentId = parentId;
    }

    return await models.ElementCategories.find(selector);
  },
};

export default elementQueries;
