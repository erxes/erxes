import _ from 'lodash';
import { paginate } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";
import { moduleRequireLogin } from "@erxes/api-utils/src/permissions";
import { sendMessageBroker } from "../../../messageBroker";

const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.searchValue) {
    filter.$or = [
      { name: { $in: [new RegExp(`.*${params.searchValue}.*`, "i")] } },
      { code: { $in: [new RegExp(`.*${params.searchValue}.*`, "i")] } },
      { number: { $in: [new RegExp(`.*${params.searchValue}.*`, "i")] } }
    ];
  }

  if (params.productId) {
    filter.productId = params.productId;
  }

  if (params.productType) {
    filter.productType = params.productType;
  }

  if (params.leaseType) {
    filter.leaseType = params.leaseType;
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

const contractTypeQueries = {
  /**
   * ContractTypes list
   */
  contractTypes: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    return await paginate(
      models.ContractTypes.find(
        await generateFilter(params, commonQuerySelector)
      ),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },

  /**
   * ContractTypes for only main list
   */

  contractTypesMain: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);

    return {
      list: await paginate(
        models.ContractTypes.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),
      totalCount: await models.ContractTypes.find(filter).countDocuments()
    };
  },

  /**
   * Get one contractType
   */

  contractTypeDetail: async (_root, { _id }, { models }: IContext) => {
    return models.ContractTypes.getContractType({ _id });
  },

  loanContractCategories: async (_root, params: { productCategoryIds?: string[], productIds?: string[], step?: number }, { models, subdomain, }: IContext) => {
    const { productCategoryIds, productIds } = params;
    const contractTypeFilter: any = { productType: 'public' };
    if (productIds?.length) {
      contractTypeFilter.productId = { $in: productIds };
    }
    const contractTypes = await models.ContractTypes.find(contractTypeFilter);
    let savedProductIds = contractTypes.map(ct => ct.productId).filter(pId => pId);
    if (productIds?.length) {
      savedProductIds = _.intersection(savedProductIds, productIds)
    }

    const productQuery: any = { _id: { $in: savedProductIds } };
    if (productCategoryIds?.length) {
      productQuery.categoryId = { $in: productCategoryIds }
    }
    const products = await sendMessageBroker(
      {
        subdomain,
        action: 'products.find',
        data: { query: productQuery },
        isRPC: true,
        defaultValue: []
      },
      'core'
    );

    const latestCategoryIds = products.map(p => p.categoryId);
    const categories = await sendMessageBroker(
      {
        subdomain,
        action: 'categories.find',
        data: { query: { _id: { $in: latestCategoryIds } } },
        isRPC: true,
        defaultValue: []
      },
      'core'
    )
    return {
      categories,
      products: products.map(p => ({ ...p, contractType: contractTypes.find(ct => ct.productId === p._id) }))
    }
  }
};

moduleRequireLogin(contractTypeQueries);

export default contractTypeQueries;
