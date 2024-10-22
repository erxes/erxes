import { skip } from 'node:test';
import { IContext, IModels } from '../../../connectionResolver';
import {
  IElement,
  IElementCategory,
} from '../../../models/definitions/element';

const checkDefaults = async (models: IModels, name: string) => {
  const one = await models.Elements.findOne({ name, itineraryId: null });

  if (!one) {
    let element: IElement = { name: name, content: '' };
    await models.Elements.createElement(element, null);
  }
};

const insertCategoryDefaults = async (
  models: IModels,
  name: string,
  parentId
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
  async bmCategoryInit(_root, {}, { models }: IContext) {
    let one: any = null;

    for (const x of LIST_CATEGORIES) {
      one = await insertCategoryDefaults(models, x.name, null);
      if (x.children.length > 0) {
        for (const child of x.children) {
          const childOne: any = await insertCategoryDefaults(
            models,
            child.name,
            one._id
          );
          for (const grandChild of child?.children || []) {
            const t1 = await insertCategoryDefaults(
              models,
              grandChild.name,
              childOne?._id || ''
            );
          }
        }
      }
    }

    return 'ok';
  },
};

export default elementQueries;
