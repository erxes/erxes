import { escapeRegExp, paginate } from '@erxes/api-utils/src/core';
import { IContext } from '../../types';
import { IModels } from '../../../connectionResolver';
import { IProductCategoryDocument } from '../../../models/definitions/products';
import { PRODUCT_STATUSES } from '../../../models/definitions/constants';
import { sendPricingMessage } from '../../../messageBroker';
import { Builder } from '../../../utils';
import { checkRemainders } from '../../utils/products';
import { IConfigDocument } from '../../../models/definitions/configs';
import { getSimilaritiesProducts } from '../../../maskUtils';

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
  vendorId?: string;
  branchId?: string;
  tag?: string;
  pipelineId?: string;
  boardId?: string;
  segment?: string;
  segmentData?: string;
  isKiosk?: boolean;
  groupedSimilarity?: string;
  categoryMeta?: string;
}

interface ICategoryParams extends ICommonParams {
  parentId: string;
  withChild: boolean;
  searchValue: string;
  status: string;
  excludeEmpty?: boolean;
  meta?: string;
  isKiosk: Boolean;
}

const generateFilter = async (
  subdomain: string,
  models: IModels,
  config: IConfigDocument,
  {
    type,
    categoryId,
    searchValue,
    vendorId,
    tag,
    ids,
    excludeIds,
    segment,
    segmentData,
    categoryMeta,
    isKiosk,
    ...paginationArgs
  }: IProductParams
) => {
  const { token } = config;
  const filter: any = {
    status: { $ne: PRODUCT_STATUSES.DELETED },
    tokens: { $in: [token] }
  };

  if (type) {
    filter.type = type;
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

  if (vendorId) {
    filter.vendorId = vendorId;
  }

  const $and: any[] = [{}];

  if (categoryId) {
    const category = await models.ProductCategories.getProductCategory({
      _id: categoryId
    });

    const relatedCategoryIds = (
      await models.ProductCategories.find(
        { order: { $regex: new RegExp(`^${category.order}`) } },
        { _id: 1 }
      ).lean()
    ).map(c => c._id);

    $and.push({ categoryId: { $in: relatedCategoryIds } });
  }

  if (categoryMeta) {
    const categoryFilter: any = {};
    if (!isNaN(Number(categoryMeta))) {
      categoryFilter.meta = { $lte: Number(categoryMeta) };
    } else {
      categoryFilter.meta = categoryMeta;
    }

    const categories = await models.ProductCategories.find(
      { categoryFilter },
      { _id: 1 }
    ).lean();

    $and.push({ categoryId: { $in: categories.map(c => c._id) } });
  }

  const lastFilter = { ...filter, $and };

  if (isKiosk) {
    return {
      $and: [
        lastFilter,
        { categoryId: { $nin: config.kioskExcludeCategoryIds } },
        { _id: { $nin: config.kioskExcludeProductIds } }
      ]
    };
  }

  return lastFilter;
};

const generateFilterCat = async ({
  models,
  config,
  parentId,
  withChild,
  searchValue,
  status,
  meta,
  isKiosk
}) => {
  const { token } = config;

  const filter: any = { tokens: { $in: [token] } };
  filter.status = { $nin: ['disabled', 'archived'] };

  if (status && status !== 'active') {
    filter.status = status;
  }

  if (parentId) {
    if (withChild) {
      const category = await (models as IModels).ProductCategories.getProductCategory(
        {
          _id: parentId
        }
      );

      const relatedCategoryIds = (
        await models.ProductCategories.find(
          { order: { $regex: new RegExp(`^${category.order}`) } },
          { _id: 1 }
        ).lean()
      ).map(c => c._id);

      filter.parentId = { $in: relatedCategoryIds };
    } else {
      filter.parentId = parentId;
    }
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

  if (isKiosk) {
    filter._id = { $nin: config.kioskExcludeCategoryIds };
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
      vendorId,
      tag,
      ids,
      excludeIds,
      pipelineId,
      boardId,
      segment,
      segmentData,
      isKiosk,
      categoryMeta,
      groupedSimilarity,
      sortField,
      sortDirection,
      ...paginationArgs
    }: IProductParams,
    { models, subdomain, config }: IContext
  ) {
    let filter = await generateFilter(subdomain, models, config, {
      type,
      categoryId,
      branchId,
      searchValue,
      vendorId,
      tag,
      ids,
      excludeIds,
      pipelineId,
      boardId,
      segment,
      segmentData,
      categoryMeta,
      isKiosk
    });

    let sortParams: any = { code: 1 };

    if (sortField) {
      sortParams = { [sortField]: sortDirection };
    }

    if (groupedSimilarity) {
      return await getSimilaritiesProducts(models, filter, {
        groupedSimilarity,
        ...paginationArgs
      });
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
      vendorId,
      tag,
      ids,
      excludeIds,
      pipelineId,
      boardId,
      segment,
      segmentData,
      categoryMeta,
      isKiosk
    }: IProductParams,
    { models, config, subdomain }: IContext
  ) {
    const filter = await generateFilter(subdomain, models, config, {
      type,
      categoryId,
      branchId,
      searchValue,
      vendorId,
      tag,
      ids,
      excludeIds,
      pipelineId,
      boardId,
      segment,
      segmentData,
      categoryMeta,
      isKiosk
    });

    return models.Products.find(filter).countDocuments();
  },

  async poscProductSimilarities(
    _root,
    { _id, groupedSimilarity },
    { models }: IContext
  ) {
    const product = await models.Products.getProduct({ _id });

    if (groupedSimilarity === 'config') {
      const getRegex = str => {
        return new RegExp(
          `^${str
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.')
            .replace(/_/g, '.')}.*`,
          'igu'
        );
      };

      const similarityGroups = await models.ProductsConfigs.getConfig(
        'similarityGroup'
      );

      const codeMasks = Object.keys(similarityGroups);
      const customFieldIds = (product.customFieldsData || []).map(
        cf => cf.field
      );

      const matchedMasks = codeMasks.filter(
        cm =>
          product.code.match(getRegex(cm)) &&
          (similarityGroups[cm].rules || [])
            .map(sg => sg.fieldId)
            .filter(sgf => customFieldIds.includes(sgf)).length ===
            (similarityGroups[cm].rules || []).length
      );

      if (!matchedMasks.length) {
        return {
          products: await models.Products.find({ _id })
        };
      }

      const codeRegexs: any[] = [];
      const fieldIds: string[] = [];
      const groups: { title: string; fieldId: string }[] = [];
      for (const matchedMask of matchedMasks) {
        codeRegexs.push({ code: { $in: [getRegex(matchedMask)] } });

        for (const rule of similarityGroups[matchedMask].rules || []) {
          const { fieldId, title } = rule;
          if (!fieldIds.includes(fieldId)) {
            fieldIds.push(fieldId);
            groups.push({ title, fieldId });
          }
        }
      }

      const filters: any = {
        $and: [
          {
            $or: codeRegexs,
            'customFieldsData.field': { $in: fieldIds }
          }
        ]
      };

      return {
        products: await models.Products.find(filters).sort({ code: 1 }),
        groups
      };
    }

    const category = await models.ProductCategories.getProductCategory({
      _id: product.categoryId
    });
    if (!category.isSimilarity || !category.similarities.length) {
      return {
        products: await models.Products.find({ _id })
      };
    }

    const fieldIds = category.similarities.map(r => r.fieldId);
    const filters: any = {
      $and: [
        {
          categoryId: category._id,
          'customFieldsData.field': { $in: fieldIds }
        }
      ]
    };

    const groups: {
      title: string;
      fieldId: string;
    }[] = category.similarities.map(r => ({ ...r }));

    return {
      products: await models.Products.find(filters).sort({ code: 1 }),
      groups
    };
  },

  async poscProductCategories(
    _root,
    {
      parentId,
      withChild,
      searchValue,
      status,
      excludeEmpty,
      meta,
      isKiosk,
      sortDirection,
      sortField,
      ...paginationArgs
    }: ICategoryParams,
    { models, config }: IContext
  ) {
    const filter = await generateFilterCat({
      models,
      config,
      parentId,
      withChild,
      searchValue,
      status,
      meta,
      isKiosk
    });

    let sortParams: any = { order: 1 };

    if (sortField) {
      sortParams = { [sortField]: sortDirection };
    }

    let categories;
    if (paginationArgs.page || paginationArgs.perPage) {
      categories = await paginate(
        models.ProductCategories.find(filter)
          .sort(sortParams)
          .lean(),
        paginationArgs
      );
    } else {
      categories = await models.ProductCategories.find(filter)
        .sort(sortParams)
        .lean();
    }

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
    { parentId, withChild, searchValue, status, meta, isKiosk },
    { models, config }: IContext
  ) {
    const filter = await generateFilterCat({
      models,
      config,
      parentId,
      withChild,
      searchValue,
      status,
      meta,
      isKiosk
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
