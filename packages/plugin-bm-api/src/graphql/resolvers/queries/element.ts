import { skip } from 'node:test';
import { IContext, IModels } from '../../../connectionResolver';
import {
  IElement,
  IElementCategory,
} from '../../../models/definitions/element';

const checkDefaults = async (models: IModels, name: string, icon: string) => {
  const one = await models.Elements.findOne({ name, itineraryId: null });

  if (!one) {
    let element: IElement = { name: name, content: '', quick: true, icon };
    await models.Elements.createElement(element, null);
  } else {
    const abc = await models.Elements.updateElement(one._id, {
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
    let category: IElementCategory = { name: name, parentId };
    return await models.ElementCategories.create(category, null);
  }
  return one;
};
const LIST_CATEGORIES = [
  {
    name: 'Accommodation',
    children: [
      { name: 'Hotel', children: [] },
      { name: 'Resort' },
      { name: 'Guesthouse' },
      { name: 'Vacation Rental' },
      { name: 'Hostel' },
      { name: 'Camping' },
      { name: 'Lodge' },
      { name: 'Motel' },
      { name: 'Villa' },
    ],
  },
  {
    name: 'Places',
    children: [
      {
        name: 'Natural Attractions',
        children: [
          { name: 'Beaches' },
          { name: 'Mountains' },
          { name: 'Deserts' },
          { name: 'Forests & Jungles' },
          { name: 'Lakes & Rivers' },
          { name: 'Waterfalls' },
          { name: 'Islands' },
        ],
      },
      {
        name: 'Cultural & Historical Sites',
        children: [
          { name: 'Ancient Ruins' },
          { name: 'Temples & Monasteries' },
          { name: 'Museums & Art Galleries' },
          { name: 'Historical Cities' },
          { name: 'Castles & Palaces' },
        ],
      },
      {
        name: 'Urban Destinations',
        children: [
          { name: 'Metropolitan Cities' },
          { name: 'Skyscraper Cities' },
          { name: 'Old Towns & Quarters' },
          { name: 'Technology Hubs' },
        ],
      },
      {
        name: 'Adventure & Outdoor Recreation',
        children: [
          { name: 'National Parks' },
          { name: 'Hiking Trails' },
          { name: 'Ski Resorts' },
          { name: 'Diving & Snorkeling Spots' },
          { name: 'Rock Climbing Destinations' },
        ],
      },
      {
        name: 'Relaxation & Wellness',
        children: [
          { name: 'Spa Towns' },
          { name: 'Yoga Retreats' },
          { name: 'Hot Springs' },
          { name: 'Quiet Countryside' },
        ],
      },
      {
        name: 'Relaxation & Wellness',
        children: [
          { name: 'Spa Towns' },
          { name: 'Yoga Retreats' },
          { name: 'Hot Springs' },
          { name: 'Quiet Countryside' },
        ],
      },
    ],
  },
  {
    name: 'Activity',
    children: [
      { name: 'Sightseeing' },
      { name: 'Hiking' },
      { name: 'Camping' },
      { name: 'Shopping' },
      { name: 'Cultural Tours' },
      { name: 'Food Tours' },
      { name: 'Adventure Sports' },
      { name: 'Water Sports' },
      { name: 'Wildlife Safaris' },
      { name: 'Skiing/Snowboarding' },
      { name: 'Beach Activities' },
      { name: 'City Tours' },
      { name: 'Boat Tours/Cruises' },
      { name: 'Photography' },
    ],
  },
  {
    name: 'Food & Drink',
    children: [
      { name: 'Street Food' },
      { name: 'Local Cuisine' },
      { name: 'Fine Dining' },
      { name: 'Café' },
      { name: 'Beverages' },
      { name: 'Desserts and Sweets' },
      { name: 'Vegetarian/Vegan Options' },
      { name: 'Food Markets' },
      { name: 'Picnics and Outdoor Dining' },
      { name: 'Fast Food' },
    ],
  },

  {
    name: 'Location',
    children: [
      {
        name: 'Mongolia',
        children: [
          { name: 'Arkhangai' },
          { name: 'Bayan-Ölgii' },
          { name: 'Bayankhongor' },
          { name: 'Bulgan' },
          { name: 'Darkhan-Uul' },
          { name: 'Dornod' },
          { name: 'Dornogovi' },
          { name: 'Dundgovi' },
          { name: 'Govi-Altai' },
          { name: 'Ulaanbaatar' },
        ],
      },
    ],
  },
];
const elementQueries = {
  async bmElements(
    _root,
    {
      categories,
      name,
      page = 1,
      perPage = 10,
      quick,
      sortField,
      sortDirection,
    },
    { models }: IContext,
  ) {
    const selector: any = {};

    const skip = Math.max(0, page - 1) * perPage;
    if (categories) {
      let allSubcategories: string[] = categories;
      let ids: string[] = categories || [];
      while (ids.length > 0) {
        const newIds = (
          await models.ElementCategories.find({ parentId: { $in: ids } })
        ).map(x => x._id);
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
    if (quick) {
      selector.quick = quick;
    }

    let sort: any = { number: 1 };
    if (sortField && sortDirection) {
      sort = {
        [sortField]: sortDirection,
      };
    }

    const list = await models.Elements.find(selector)
      .sort({ ...sort })
      .limit(perPage)
      .skip(skip);
    const total = await models.Elements.find(selector).countDocuments();
    return {
      list,
      total,
    };
  },

  async bmElementCategoryies(_root, { parentId }, { models }: IContext) {
    const selector: any = {};

    if (parentId) {
      selector.parentId = parentId;
    } else if (parentId === null) {
      selector.parentId = null;
    }

    return await models.ElementCategories.find(selector);
  },
  async bmElementDetail(_root, { _id }, { models }: IContext) {
    return await models.Elements.findById(_id);
  },

  async bmElementsInit(_root, {}, { models }: IContext) {
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
  async bmCategoryInit(_root, {}, { models }: IContext) {
    let one: any = null;

    for (const x of LIST_CATEGORIES) {
      one = await insertCategoryDefaults(models, x.name, null);
      if (x.children.length > 0) {
        for (const child of x.children) {
          const childOne: any = await insertCategoryDefaults(
            models,
            child.name,
            one._id,
          );
          for (const grandChild of child?.children || []) {
            const t1 = await insertCategoryDefaults(
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
