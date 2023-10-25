import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';

const queries = {
  insuranceProductsPaginated: async (
    _root,
    {
      page,
      perPage,
      sortField,
      sortDirection,
      searchValue
    }: {
      page: number;
      perPage: number;
      sortField: string;
      sortDirection: 'ASC' | 'DESC';
      searchValue: string;
    },
    { models }: IContext
  ) => {
    const qry: any = {};

    if (searchValue) {
      qry.searchText = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
    }

    let sortOrder = 1;

    if (sortDirection === 'DESC') {
      sortOrder = -1;
    }

    return {
      products: paginate(
        models.Products.find(qry).sort({ [sortField]: sortOrder }),
        {
          page,
          perPage
        }
      ),
      count: models.Products.find(qry).count()
    };
  },

  insuranceProducts: async (
    _root,
    {
      searchValue,
      page,
      perPage
    }: { searchValue: string; page: number; perPage: number },
    { models }: IContext
  ) => {
    const qry: any = {};

    if (searchValue) {
      qry.searchText = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
    }

    return paginate(models.Products.find(qry), {
      page,
      perPage
    });
  },

  insuranceProduct: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.Products.findOne({ _id }).lean();
  },

  insuranceProductsOfVendor: async (
    _root,
    _args,
    { models, subdomain, cpUser }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const user = await sendCommonMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      serviceName: 'clientportal',
      isRPC: true,
      defaultValue: undefined,
      data: {
        _id: cpUser.userId
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const clientportal = await sendCommonMessage({
      subdomain,
      action: 'clientPortals.findOne',
      serviceName: 'clientportal',
      isRPC: true,
      defaultValue: undefined,
      data: {
        _id: user.clientPortalId
      }
    });

    if (!clientportal) {
      throw new Error("User's clientportal not found");
    }

    if (clientportal.kind !== 'vendor') {
      throw new Error('User is not vendor');
    }

    if (!user.erxesCompanyId) {
      throw new Error('User does not assigned to any company');
    }

    const company = await sendCommonMessage({
      subdomain,
      action: 'companies.findOne',
      serviceName: 'contacts',
      isRPC: true,
      data: {
        _id: user.erxesCompanyId
      }
    });

    if (!company) {
      throw new Error("User's company not found");
    }

    const products = await models.Products.aggregate([
      {
        $match: {
          'companyProductConfigs.companyId': company._id // Filter by companyId
        }
      },
      {
        $unwind: '$companyProductConfigs' // Unwind the companyConfigs array
      },
      {
        $addFields: {
          price: '$companyProductConfigs.specificPrice' // Set the price from companyConfigs.specificPrice
        }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          code: { $first: '$code' },
          description: { $first: '$description' },
          price: { $first: '$price' },
          riskIds: { $first: '$riskIds' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          lastModifiedBy: { $first: '$lastModifiedBy' },
          searchText: { $first: '$searchText' },
          companyConfigs: { $push: '$companyConfigs' }
        }
      }
    ]);

    return products;
  }
};

export default queries;
