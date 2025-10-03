import { IContext, IModels } from '~/connectionResolvers';
import { IElement, IElementCategory } from '@/bms/@types/element';
import { CATEGORIES } from '@/bms/constants';
import { cursorPaginate } from 'erxes-api-shared/utils';

const checkDefaults = async (models: IModels, name: string, icon: string) => {
  const one = await models.Elements.findOne({ name, itineraryId: null });

  if (!one) {
    const element: IElement = { name: name, content: '', quick: true, icon };
    await models.Elements.createElement(element, null);
  } else {
    await models.Elements.updateElement(one._id, {
      quick: true,
      icon: icon,
      name: one?.name,
      content: one?.content,
    });
  }
};

const insertCategoryDefaults = async (
  models: IModels,
  name: string,
  parentId,
) => {
  const one = await models.ElementCategories.findOne({
    name,
    parentId,
  });

  if (!one) {
    const category: IElementCategory = { name: name, parentId };
    return await models.ElementCategories.create(category, null);
  }
  return one;
};

const elementQueries = {
  async bmsElements(
    _root,
    { categories, branchId, name, quick, ...params },
    { models }: IContext,
  ) {
    const selector: any = {};

    if (categories) {
      let allSubcategories: string[] = categories;
      let ids: string[] = categories || [];
      while (ids.length > 0) {
        const newIds = (
          await models.ElementCategories.find({ parentId: { $in: ids } })
        ).map((x) => x._id);
        allSubcategories = [...newIds, ...allSubcategories];
        ids = newIds;
      }

      selector.categories = { $in: allSubcategories };
    }

    if (name) {
      selector.$or = [
        { name: { $regex: name, $options: 'i' } },
        { 'location.name': { $regex: name, $options: 'i' } },
      ];
    }
    if (typeof quick === 'boolean') {
      selector.quick = quick;
    }
    if (branchId) {
      selector.branchId = branchId;
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Elements,
      params,
      query: selector,
    });

    return { list, totalCount, pageInfo };
  },

  async bmsElementCategories(_root, { parentId }, { models }: IContext) {
    const selector: any = {};

    if (parentId) {
      selector.parentId = parentId;
    } else if (parentId === null) {
      selector.parentId = null;
    }

    return await models.ElementCategories.find(selector);
  },
  async bmsElementDetail(_root, { _id }, { models }: IContext) {
    return await models.Elements.findById(_id);
  },

  async bmsElementsInit(_root, _args, { models }: IContext) {
    await checkDefaults(models, 'Breakfast', 'soup');
    await checkDefaults(models, 'Lunch', 'utensils');
    await checkDefaults(models, 'Dinner', 'utensils');
    await checkDefaults(models, 'Snack', 'donut');
    await checkDefaults(models, 'Check-in', 'door-open');
    await checkDefaults(models, 'Check-out', 'door-closed');
    await checkDefaults(models, 'Overnight', 'moon');

    await checkDefaults(models, 'Hot shower', 'moon');
    await checkDefaults(models, 'unable to shower', 'moon');
    await checkDefaults(models, 'pick-up service', 'moon');
    await checkDefaults(models, 'electricity', 'moon');
    await checkDefaults(models, 'no electricity', 'moon');
    await checkDefaults(models, 'horse & camel', 'moon');

    return 'ok';
  },
  async bmsCategoryInit(_root, _args, { models }: IContext) {
    let one: any = null;

    for (const x of CATEGORIES) {
      one = await insertCategoryDefaults(models, x.name, null);
      if (x.children.length > 0) {
        for (const child of x.children) {
          const childOne: any = await insertCategoryDefaults(
            models,
            child.name,
            one._id,
          );
          for (const grandChild of child?.children || []) {
            await insertCategoryDefaults(
              models,
              grandChild.name,
              childOne?._id || '',
            );
          }
        }
      }
    }

    return 'ok';
  },
};

export default elementQueries;
