import { escapeRegExp, paginate } from '@erxes/api-utils/src/core';
import { IContext } from '../../types';
import { IModels } from '../../../connectionResolver';
import { IProductCategoryDocument } from '../../../models/definitions/products';
import { PRODUCT_STATUSES } from '../../../models/definitions/constants';
import {
  sendInventoriesMessage,
  sendPricingMessage
} from '../../../messageBroker';
import { sendRequest } from '@erxes/api-utils/src/requests';
import { debugError } from '@erxes/api-utils/src/debuggers';
import { Builder } from '../../../utils';

interface IProductParams {
  ids?: string[];
  excludeIds?: boolean;
  type?: string;
  categoryId?: string;
  searchValue?: string;
  branchId?: string;
  tag?: string;
  pipelineId?: string;
  boardId?: string;
  segment?: string;
  segmentData?: string;
  sortField?: string;
  sortDirection?: number;
  page?: number;
  perPage?: number;
}

interface ICategoryParams {
  parentId: string;
  searchValue: string;
  excludeEmpty?: boolean;
}

const generateFilter = async (
  subdomain: string,
  models: IModels,
  token: string,
  {
    type,
    categoryId,
    searchValue,
    tag,
    ids,
    excludeIds,
    segment,
    segmentData,
    ...paginationArgs
  }: IProductParams
) => {
  const filter: any = {
    status: { $ne: PRODUCT_STATUSES.DELETED },
    tokens: { $in: [token] }
  };

  if (type) {
    filter.type = type;
  }

  if (categoryId) {
    const category = await models.ProductCategories.getProductCategory({
      _id: categoryId
    });

    const relatedCategoryIds = await models.ProductCategories.find(
      { order: { $regex: new RegExp(category.order) } },
      { _id: 1 }
    );

    filter.categoryId = { $in: relatedCategoryIds };
  }

  if (ids && ids.length > 0) {
    filter._id = { [excludeIds ? '$nin' : '$in']: ids };
    if (!paginationArgs.page && !paginationArgs.perPage) {
      paginationArgs.page = 1;
      paginationArgs.perPage = 100;
    }
  }

  if (tag) {
    filter.tagIds = { $in: [tag] };
  }

  // search =========
  if (searchValue) {
    const regex = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');

    filter.$or = [
      { name: { $in: [regex] } },
      { code: { $in: [regex] } },
      { barcodes: { $in: [searchValue] } }
    ];
  }

  if (segment || segmentData) {
    const qb = new Builder(models, subdomain, { segment, segmentData }, {});

    await qb.buildAllQueries();

    const { list } = await qb.runQueries();

    filter._id = { $in: list.map(l => l._id) };
  }

  return filter;
};

const generateFilterCat = ({ token, parentId, searchValue }) => {
  const filter: any = { tokens: { $in: [token] } };
  filter.status = { $nin: ['disabled', 'archived'] };

  if (parentId) {
    filter.parentId = parentId;
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  return filter;
};

const productQueries = {
  async poscProducts(
    _root,
    {
      type,
      categoryId,
      branchId,
      searchValue,
      tag,
      ids,
      excludeIds,
      pipelineId,
      boardId,
      segment,
      segmentData,
      sortField,
      sortDirection,
      ...paginationArgs
    }: IProductParams,
    { models, subdomain, config }: IContext
  ) {
    let filter = await generateFilter(subdomain, models, config.token, {
      type,
      categoryId,
      searchValue
    });

    let sortParams: any = { code: 1 };

    if (sortField) {
      sortParams = { [sortField]: sortDirection };
    }

    const paginatedProducts = await paginate(
      models.Products.find(filter)
        .sort(sortParams)
        .lean(),
      paginationArgs
    );

    const latestBranchId = config.isOnline ? branchId : config.branchId;
    if (latestBranchId) {
      if (config.checkRemainder) {
        try {
          const productIds = paginatedProducts.map(p => p._id);

          const inventoryResponse = await sendInventoriesMessage({
            subdomain,
            action: 'remainders',
            data: {
              productIds,
              departmentId: config.departmentId,
              branchId: latestBranchId
            },
            isRPC: true,
            defaultValue: []
          });

          const remainderByProductId = {};
          for (const rem of inventoryResponse) {
            remainderByProductId[rem.productId] = rem;
          }

          paginatedProducts.map((item: any) => {
            item.remainder = remainderByProductId[item._id]
              ? remainderByProductId[item._id].count
              : undefined;
            return item;
          });
        } catch (e) {
          debugError(`fetch remainder from inventories, Error: ${e.message}`);
        }
      }

      if (config.erkhetConfig && config.erkhetConfig.getRemainder) {
        const configs = config.erkhetConfig;
        if (
          configs &&
          configs.getRemainderApiUrl &&
          configs.apiKey &&
          configs.apiSecret
        ) {
          try {
            let account = configs.account;
            let location = configs.location;

            if (config.isOnline && branchId) {
              const accLocConf = configs[branchId];

              if (accLocConf) {
                account = accLocConf.account;
                location = accLocConf.location;
              }
            }

            if (account && location) {
              const response = await sendRequest({
                url: configs.getRemainderApiUrl,
                method: 'GET',
                params: {
                  kind: 'remainder',
                  api_key: configs.apiKey,
                  api_secret: configs.apiSecret,
                  check_relate: paginatedProducts.length < 4 ? '1' : '',
                  accounts: account,
                  locations: location,
                  inventories: paginatedProducts.map(p => p.code).join(',')
                }
              });

              const jsonRes = JSON.parse(response);

              let responseByCode = jsonRes;

              responseByCode =
                (jsonRes[account] && jsonRes[account][location]) || {};

              paginatedProducts.map((item: any) => {
                item.remainder = responseByCode[item.code]
                  ? responseByCode[item.code]
                  : undefined;
                return item;
              });
            }
          } catch (e) {
            debugError(`fetch remainder from erkhet, Error: ${e.message}`);
          }
        }
      }
    }

    return paginatedProducts;
  },

  /**
   * Get all products count. We will use it in pager
   */
  async poscProductsTotalCount(
    _root,
    { type, categoryId, searchValue }: IProductParams,
    { models, config, subdomain }: IContext
  ) {
    const filter = await generateFilter(subdomain, models, config.token, {
      type,
      categoryId,
      searchValue
    });

    return models.Products.find(filter).countDocuments();
  },

  async poscProductCategories(
    _root,
    { parentId, searchValue, excludeEmpty }: ICategoryParams,
    { models, config }: IContext
  ) {
    const filter = generateFilterCat({
      token: config.token,
      parentId,
      searchValue
    });

    const categories = await models.ProductCategories.find(filter).sort({
      order: 1
    });
    const list: IProductCategoryDocument[] = [];

    if (excludeEmpty) {
      for (const cat of categories) {
        const product = await models.Products.findOne({
          categoryId: cat._id,
          status: { $ne: PRODUCT_STATUSES.DELETED }
        });

        if (product) {
          list.push(cat);
        }
      }

      return list;
    }

    return categories;
  },

  async poscProductCategoriesTotalCount(
    _root,
    { parentId, searchValue }: { parentId: string; searchValue: string },
    { models, config }: IContext
  ) {
    const filter = await generateFilterCat({
      token: config.token,
      parentId,
      searchValue
    });
    return models.ProductCategories.find(filter).countDocuments();
  },

  poscProductDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Products.findOne({ _id }).lean();
  },

  poscProductCategoryDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ProductCategories.findOne({ _id }).lean();
  },

  async getPriceInfo(
    _root,
    { productId }: { productId: string },
    { models, subdomain, config }: IContext
  ) {
    const product = await models.Products.getProduct({ _id: productId });

    const d = await sendPricingMessage({
      subdomain,
      action: 'getQuanityRules',
      data: {
        departmentId: config.departmentId,
        branchId: config.branchId,
        products: [
          { ...product, unitPrice: (product.prices || {})[config.token] }
        ]
      },
      isRPC: true,
      defaultValue: {}
    });

    return JSON.stringify(d);
  }
};

export default productQueries;
