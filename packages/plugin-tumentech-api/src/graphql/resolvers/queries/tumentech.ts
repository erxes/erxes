import { paginate } from 'erxes-api-utils';
import { checkPermission } from '@erxes/api-utils/src';
import { sendProductsMessage } from '../../../messageBroker';

const generateFilter = async (models, params, commonQuerySelector) => {
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
      $in: await models.Conformities.savedConformity({
        mainType: params.conformityMainType,
        mainTypeId: params.conformityMainTypeId,
        relTypes: ['car']
      })
    };
  }
  if (
    params.conformityMainTypeId &&
    params.conformityMainType &&
    params.conformityIsRelated
  ) {
    filter._id = {
      $in: await models.Conformities.relatedConformity({
        mainType: params.conformityMainType,
        mainTypeId: params.conformityMainTypeId,
        relType: 'car'
      })
    };
  }

  return filter;
};

export const sortBuilder = (params) => {
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
  cars: async (_root, params, { commonQuerySelector, models }) => {
    return paginate(
      models.Cars.find(
        await generateFilter(models, params, commonQuerySelector)
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
  carsMain: async (_root, params, { commonQuerySelector, models }) => {
    const filter = await generateFilter(models, params, commonQuerySelector);

    return {
      list: paginate(models.Cars.find(filter).sort(sortBuilder(params)), {
        page: params.page,
        perPage: params.perPage
      }),
      totalCount: models.Cars.find(filter).count()
    };
  },

  carCategoryMatchProducts: async (
    _root,
    { carCategoryId },
    { models, subdomain }
  ) => {
    const productCategoryIds = (
      (await models.ProductCarCategories.find({ carCategoryId }).lean()) || []
    ).map((i) => i.productCategoryId);

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
    ).map((i) => i.carCategoryId);

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
  }
};

checkPermission(carQueries, 'carsMain', 'showCars');
checkPermission(carQueries, 'carDetail', 'showCars');
checkPermission(carQueries, 'carCategories', 'showCars');
checkPermission(carQueries, 'carCategoriesTotalCount', 'showCars');
checkPermission(carQueries, 'carCategoryDetail', 'showCars');

export default carQueries;
