import { paginate } from '@erxes/api-utils/src/core';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext, IModels } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';

const generateFilter = async (
  subdomain: string,
  params,
  commonQuerySelector
) => {
  const filter: any = commonQuerySelector;

  // filter.status = { $ne: "Deleted" };

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
          relType: 'car'
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
  cars: async (
    _root,
    params,
    { subdomain, commonQuerySelector, models }: IContext
  ) => {
    return paginate(
      models.Cars.find(
        await generateFilter(subdomain, params, commonQuerySelector)
      ),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },

  carsMain: async (
    _root,
    params,
    { subdomain, commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(subdomain, params, commonQuerySelector);

    return {
      list: paginate(models.Cars.find(filter).sort(sortBuilder(params)), {
        page: params.page,
        perPage: params.perPage
      }),
      totalCount: models.Cars.find(filter).count()
    };
  },

  carDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Cars.getCar(_id);
  },

  carCategories: async (
    _root,
    { parentId, searchValue },
    { commonQuerySelector, models }: IContext
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

  carCategoriesTotalCount: async (_root, _param, { models }: IContext) => {
    return models.CarCategories.find().countDocuments();
  },

  carCategoryDetail: async (_root, { _id }, { models }: IContext) => {
    return models.CarCategories.findOne({ _id });
  },

  cpCarDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Cars.getCar(_id);
  },

  cpCarCategories: async (
    _root,
    { parentId, searchValue },
    { commonQuerySelector, models }: IContext
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

  cpCarCategoriesTotalCount: async (_root, _param, { models }: IContext) => {
    return models.CarCategories.find().countDocuments();
  },

  cpCarCategoryDetail: async (_root, { _id }, { models }: IContext) => {
    return models.CarCategories.findOne({ _id });
  }
};

requireLogin(carQueries, 'carDetail');

checkPermission(carQueries, 'carsMain', 'showCars');
checkPermission(carQueries, 'carDetail', 'showCars');
checkPermission(carQueries, 'carCategories', 'showCars');
checkPermission(carQueries, 'carCategoriesTotalCount', 'showCars');
checkPermission(carQueries, 'carCategoryDetail', 'showCars');

export default carQueries;
