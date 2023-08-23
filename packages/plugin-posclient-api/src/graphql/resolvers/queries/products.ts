import { escapeRegExp, paginate } from '@erxes/api-utils/src/core';
import { IContext } from '../../types';
import { IModels } from '../../../connectionResolver';
import { IProductCategoryDocument } from '../../../models/definitions/products';
import { PRODUCT_STATUSES } from '../../../models/definitions/constants';
import { sendPricingMessage } from '../../../messageBroker';
import { Builder } from '../../../utils';
import { checkRemainders } from '../../utils/products';

interface ICommonParams {
  sortField?: string;
  sortDirection?: number;
  page?: number;
  perPage?: number;
}
interface IProductParams extends ICommonParams {
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
}

interface ICategoryParams extends ICommonParams {
  parentId: string;
  searchValue: string;
  excludeEmpty?: boolean;
  meta?: string;
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
      { order: { $regex: new RegExp(`^${category.order}`) } },
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
    const codeRegex = new RegExp(
      `^${searchValue
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.')
        .replace(/_/g, '.')
        .replace(/  /g, '.')}.*`,
      'igu'
    );

    filter.$or = [
      {
        $or: [{ code: { $in: [regex] } }, { code: { $in: [codeRegex] } }]
      },
      { name: { $in: [regex] } },
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

const generateFilterCat = ({ token, parentId, searchValue, meta }) => {
  const filter: any = { tokens: { $in: [token] } };
  filter.status = { $nin: ['disabled', 'archived'] };

  if (parentId) {
    filter.parentId = parentId;
  }

  if (meta) {
    if (!isNaN(meta)) {
      filter.meta = { $lte: Number(meta) };
    } else {
      filter.meta = meta;
    }
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
      branchId,
      searchValue,
      tag,
      ids,
      excludeIds,
      pipelineId,
      boardId,
      segment,
      segmentData
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

    return checkRemainders(
      subdomain,
      config,
      paginatedProducts,
      branchId || ''
    );
  },

  /**
   * Get all products count. We will use it in pager
   */
  async poscProductsTotalCount(
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
      segmentData
    }: IProductParams,
    { models, config, subdomain }: IContext
  ) {
    const filter = await generateFilter(subdomain, models, config.token, {
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
      segmentData
    });

    return models.Products.find(filter).countDocuments();
  },

  async poscProductCategories(
    _root,
    {
      parentId,
      searchValue,
      excludeEmpty,
      meta,
      sortDirection,
      sortField
    }: ICategoryParams,
    { models, config }: IContext
  ) {
    const filter = generateFilterCat({
      token: config.token,
      parentId,
      searchValue,
      meta
    });

    let sortParams: any = { order: 1 };

    if (sortField) {
      sortParams = { [sortField]: sortDirection };
    }

    const categories = await models.ProductCategories.find(filter)
      .sort(sortParams)
      .lean();

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
    {
      parentId,
      searchValue,
      meta
    }: { parentId: string; searchValue: string; meta: string },
    { models, config }: IContext
  ) {
    const filter = await generateFilterCat({
      token: config.token,
      parentId,
      searchValue,
      meta
    });
    return models.ProductCategories.find(filter).countDocuments();
  },

  async poscProductDetail(
    _root,
    { _id, branchId }: { _id: string; branchId?: string },
    { subdomain, models, config }: IContext
  ) {
    const product = await models.Products.getProduct({ _id });

    const result = await checkRemainders(
      subdomain,
      config,
      [product],
      branchId
    );

    return result[0];
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
