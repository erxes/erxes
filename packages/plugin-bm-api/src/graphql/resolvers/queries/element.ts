import { skip } from 'node:test';
import { IContext, IModels } from '../../../connectionResolver';
import { IElement } from '../../../models/definitions/element';

const checkDefaults = async (models: IModels, name: string) => {
  const one = await models.Elements.findOne({ name, itineraryId: null });

  if (!one) {
    let element: IElement = { name: name, content: '' };
    await models.Elements.createElement(element, null);
  }
};
const elementQueries = {
  async bmElements(
    _root,
    { categories, page = 1, perPage = 10 },
    { models }: IContext
  ) {
    const selector: any = {};

    const skip = Math.max(0, page - 1) * perPage;
    if (categories) {
      selector.categories = { $in: categories };
    }

    const list = await models.Elements.find(selector).limit(perPage).skip(skip);
    const total = await models.Elements.countDocuments();
    return {
      list,
      total,
    };
  },

  async bmElementCategoryies(_root, { parentId }, { models }: IContext) {
    const selector: any = {};

    if (parentId) {
      selector.parentId = parentId;
    }

    return await models.ElementCategories.find(selector);
  },

  async bmElementsInit(_root, {}, { models }: IContext) {
    await checkDefaults(models, 'Breakfast');
    await checkDefaults(models, 'Lunch');
    await checkDefaults(models, 'Dinner');
    await checkDefaults(models, 'Snack');
    await checkDefaults(models, 'Check-in');
    await checkDefaults(models, 'Check-out');
    await checkDefaults(models, 'Overnight');

    return 'ok';
  },
};

export default elementQueries;
