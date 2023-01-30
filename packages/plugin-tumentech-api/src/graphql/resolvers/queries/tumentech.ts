import { checkPermission } from '@erxes/api-utils/src';
import { paginate } from 'erxes-api-utils';

import { countByCars } from '../../../carUtils';
import { IContext } from '../../../connectionResolver';
import {
  sendClientPortalMessage,
  sendCommonMessage,
  sendCoreMessage,
  sendProductsMessage
} from '../../../messageBroker';
import { generateRandomString, getFullDate, getTomorrow } from '../../../utils';
import { Builder, IListArgs } from './carQueryBuilder';

const generateFilter = async (params, commonQuerySelector, subdomain) => {
  const filter: any = commonQuerySelector;

  filter.status = { $ne: 'Deleted' };

  if (params.carCategoryId) {
    filter.carCategoryId = params.carCategoryId;
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

  if (params.plateNumber) {
    filter.plateNumber = params.plateNumber;
  }

  if (params.vinNumber) {
    filter.vinNumber = params.vinNumber;
  }

  if (params.vintageYear) {
    filter.vintageYear = params.vintageYear;
  }

  if (params.importYear) {
    filter.importYear = params.importYear;
  }

  if (params.drivingClassification) {
    filter.drivingClassification = params.drivingClassification;
  }

  if (params.manufacture) {
    filter.manufacture = params.manufacture;
  }

  if (params.trailerType) {
    filter.trailerType = params.trailerType;
  }

  if (params.brakeType) {
    filter.brakeType = params.brakeType;
  }

  if (params.bowType) {
    filter.bowType = params.bowType;
  }

  if (params.tireLoadType) {
    filter.tireLoadType = params.tireLoadType;
  }

  if (params.diagnosisDate) {
    filter.diagnosisDate = params.diagnosisDate;
  }

  if (params.taxDate) {
    filter.taxDate = params.taxDate;
  }

  const createdQry: any = {};
  if (params.createdStartDate) {
    createdQry.$gte = new Date(params.createdStartDate);
  }
  if (params.createdEndDate) {
    createdQry.$lte = new Date(params.createdEndDate);
  }
  if (Object.keys(createdQry).length) {
    filter.createdAt = createdQry;
  }

  if (params.paidDate === 'today') {
    const now = new Date();

    const startDate = getFullDate(now);
    const endDate = getTomorrow(now);
    filter.createdAt = { $gte: startDate, $lte: endDate };
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

  /**
   * Group car counts by segments
   */
  async carCounts(_root, params: IListArgs, { models, subdomain }: IContext) {
    const counts = {
      bySegment: {}
    };

    counts.bySegment = await countByCars(models, subdomain, params);

    return counts;
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

  getAccount: async (_root, {}, { models, cpUser, subdomain }: IContext) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const user = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        _id: cpUser.userId
      },
      isRPC: true,
      defaultValue: null
    });

    if (!user) {
      throw new Error('user not found');
    }

    let account = await models.CustomerAccounts.findOne({
      customerId: user.erxesCustomerId
    });

    if (!account) {
      account = await models.CustomerAccounts.create({
        customerId: user.erxesCustomerId,
        balance: 200000
      });
    }

    return account;
  },

  topupHistory: async (
    _root,
    { customerId, page, perPage },
    { models }: IContext
  ) => {
    const query = { customerId };

    const totalCount = await models.Topups.find(query).countDocuments();

    const list = await paginate(
      models.Topups.find(query).sort({ createdAt: -1 }),
      { page, perPage }
    );

    return { list, totalCount };
  },

  getEbarimt: async (
    _root,
    { topupId, companyRegNumber, companyName },
    { models, cpUser, subdomain }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const user = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        _id: cpUser.userId
      },
      isRPC: true,
      defaultValue: null
    });

    if (!user) {
      throw new Error('user not found');
    }

    let account = await models.CustomerAccounts.findOne({
      customerId: user.erxesCustomerId
    });

    if (!account) {
      account = await models.CustomerAccounts.create({
        customerId: user.erxesCustomerId,
        balance: 200000
      });
    }

    const topup = await models.Topups.findOne({ _id: topupId });

    if (!topup) {
      throw new Error('topup history not found');
    }

    if (topup.customerId !== user.erxesCustomerId) {
      throw new Error('topup history not found');
    }

    const product = await sendCommonMessage({
      serviceName: 'products',
      subdomain,
      action: 'findOne',
      data: {
        code: 'TT0001'
      },
      isRPC: true,
      defaultValue: null
    });

    if (!product) {
      throw new Error('product not configured');
    }

    const date = new Date(topup.createdAt);

    const orderInfo = {
      number: topup._id,
      date:
        date.toISOString().split('T')[0] +
        ' ' +
        date.toTimeString().split(' ')[0],
      orderId: topup._id,
      hasVat: true,
      hasCityTax: false,
      billType: companyRegNumber ? '3' : '1',
      customerCode: companyRegNumber,
      customerName: companyName,
      description: '',
      details: [
        {
          productId: product._id,
          amount: topup.amount,
          count: 1,
          inventoryCode: product.code,
          discount: 0
        }
      ]
    };

    const productsById: any = {};

    productsById[product._id] = product;

    const config = {
      districtName: 'Сүхбаатар',
      vatPercent: 10,
      cityTaxPercent: 0,
      defaultGSCode: '6601200',
      // companyRD: string 6906192   0000038 0000040 0000039
      companyRD: '0000038'
    };

    const ebarimtData = await sendCommonMessage({
      serviceName: 'ebarimt',
      subdomain,
      action: 'putresponses.putData',
      data: {
        orderInfo: { ...orderInfo },
        productsById,
        contentType: 'tumentech_topups',
        contentId: topup._id,
        config
      },
      isRPC: true,
      defaultValue: null
    });

    if (!ebarimtData) {
      throw new Error('ebarimt data not found');
    }

    await models.Topups.updateOne(
      { _id: topup._id },
      { $set: { ebarimtData } }
    );

    return ebarimtData;
  }
};

checkPermission(carQueries, 'carsMain', 'showCars');
checkPermission(carQueries, 'carDetail', 'showCars');
checkPermission(carQueries, 'carCategories', 'showCars');
checkPermission(carQueries, 'carCategoriesTotalCount', 'showCars');
checkPermission(carQueries, 'carCategoryDetail', 'showCars');

export default carQueries;
