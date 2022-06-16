import { paginate } from 'erxes-api-utils';
import { checkPermission } from '@erxes/api-utils/src';
import { sendCoreMessage, sendProductsMessage } from '../../../messageBroker';
import { Builder } from './carQueryBuilder';
import { generateRandomString } from '../../../utils';

const generateFilter = async (params, commonQuerySelector, subdomain) => {
  const filter: any = commonQuerySelector;

  filter.status = { $ne: 'Deleted' };

  if (params.categoryId) {
    filter.categoryId = params.categoryId;
  }

  if (params.searchValue) {
    filter.searchText = { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] };
  }

  if (params.ids) {
    filter._id = { $in: params.ids };
  }

  if (
    params.conformityMainTypeId &&
    params.conformityMainType &&
    params.conformityIsSaved
  ) {
    filter._id = {
      $in: await sendCoreMessage({
        subdomain,
        action: 'conformities.savedConformity',
        data: {
          mainType: params.conformityMainType,
          mainTypeId: params.conformityMainTypeId,
          relTypes: ['car']
        },
        isRPC: true,
        defaultValue: []
      })
    };
  }
  if (
    params.conformityMainTypeId &&
    params.conformityMainType &&
    params.conformityIsRelated
  ) {
    filter._id = {
      $in: await sendCoreMessage({
        subdomain,
        action: 'conformities.relatedConformity',
        data: {
          mainType: params.conformityMainType,
          mainTypeId: params.conformityMainTypeId,
          relTypes: ['car']
        },
        isRPC: true,
        defaultValue: []
      })
    };
  }

  return filter;
};

export const sortBuilder = params => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const carQueries = {
  /**
   * Cars list
   */
  cars: async (_root, params, { commonQuerySelector, models, subdomain }) => {
    return paginate(
      models.Cars.find(
        await generateFilter(params, commonQuerySelector, subdomain)
      ),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },

  /**
   * Cars for only main list
   */
  carsMain: async (
    _root,
    params,
    { commonQuerySelector, models, subdomain }
  ) => {
    const filter = await generateFilter(params, commonQuerySelector, subdomain);

    const qb = new Builder(models, subdomain, params);

    await qb.buildAllQueries();

    const mainQuery = { ...qb.mainQuery(), ...filter };

    const response = {
      list: await paginate(
        models.Cars.find(mainQuery).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),

      totalCount: await models.Cars.find(mainQuery).count()
    };

    return response;
  },

  carCategoryMatchProducts: async (
    _root,
    { carCategoryId },
    { models, subdomain }
  ) => {
    const productCategoryIds = (
      (await models.ProductCarCategories.find({ carCategoryId }).lean()) || []
    ).map(i => i.productCategoryId);

    const productCategories = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: {
          _id: { $in: productCategoryIds }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    return {
      carCategoryId,
      productCategoryIds,
      productCategories
    };
  },

  productMatchCarCategories: async (
    _root,
    { productCategoryId },
    { models }
  ) => {
    const carCategoryIds = (
      (await models.ProductCarCategories.find({ productCategoryId }).lean()) ||
      []
    ).map(i => i.carCategoryId);

    return {
      productCategoryId,
      carCategoryIds,
      carCategories: await models.CarCategories.find({
        _id: { $in: carCategoryIds }
      })
    };
  },

  /**
   * Get one car
   */
  carDetail: async (_root, { _id }, { models }) => {
    return models.Cars.getCar(_id);
  },

  carCategories: async (
    _root,
    { parentId, searchValue },
    { commonQuerySelector, models }
  ) => {
    const filter: any = commonQuerySelector;

    if (parentId) {
      filter.parentId = parentId;
    }

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return models.CarCategories.find(filter).sort({ order: 1 });
  },

  carCategoriesTotalCount: async (_root, _param, { models }) => {
    return models.CarCategories.find().countDocuments();
  },

  carCategoryDetail: async (_root, { _id }, { models }) => {
    return models.CarCategories.findOne({ _id });
  },

  // clientPortal ================

  /**
   * Get one car
   */
  cpCarDetail: async (_root, { _id }, { models }) => {
    return models.Cars.getCar(models, _id);
  },

  cpCarCategories: async (
    _root,
    { parentId, searchValue },
    { commonQuerySelector, models }
  ) => {
    const filter: any = commonQuerySelector;

    if (parentId) {
      filter.parentId = parentId;
    }

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return models.CarCategories.find(filter).sort({ order: 1 });
  },

  cpCarCategoriesTotalCount: async (_root, _param, { models }) => {
    return models.CarCategories.find().countDocuments();
  },

  cpCarCategoryDetail: async (_root, { _id }, { models }) => {
    return models.CarCategories.findOne({ _id });
  },

  gererateRandomName: async (
    _root,
    { modelName, prefix, numberOfDigits },
    { subdomain }
  ) => {
    return generateRandomString(subdomain, modelName, prefix, numberOfDigits);
  }
};

checkPermission(carQueries, 'carsMain', 'showCars');
checkPermission(carQueries, 'carDetail', 'showCars');
checkPermission(carQueries, 'carCategories', 'showCars');
checkPermission(carQueries, 'carCategoriesTotalCount', 'showCars');
checkPermission(carQueries, 'carCategoryDetail', 'showCars');

export default carQueries;
