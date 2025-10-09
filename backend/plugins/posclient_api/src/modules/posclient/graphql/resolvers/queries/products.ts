import { IProductCategoryDocument } from 'erxes-api-shared/core-types';
import {
  escapeRegExp,
  paginate,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IConfigDocument } from '~/modules/posclient/@types/configs';
import { IContext } from '~/modules/posclient/@types/types';
import { PRODUCT_STATUSES } from '~/modules/posclient/db/definitions/constants';
import {
  getSimilaritiesProducts,
  getSimilaritiesProductsCount,
} from '~/modules/posclient/maskUtils';
import { Builder } from '~/modules/posclient/utils';
import { checkRemainders } from '~/modules/posclient/utils/products';

export interface ICommonParams {
  sortField?: string;
  sortDirection?: number;
  page?: number;
  perPage?: number;
}
export interface IProductParams extends ICommonParams {
  ids?: string[];
  excludeIds?: boolean;
  type?: string;
  categoryId?: string;
  searchValue?: string;
  vendorId?: string;
  branchId?: string;
  tag?: string;
  tags?: string[];
  excludeTags?: string[];
  tagWithRelated?: boolean;
  pipelineId?: string;
  boardId?: string;
  segment?: string;
  segmentData?: string;
  isKiosk?: boolean;
  groupedSimilarity?: string;
  categoryMeta?: string;
  image?: string;
}

export interface ICategoryParams extends ICommonParams {
  parentId: string;
  withChild: boolean;
  searchValue: string;
  status: string;
  excludeEmpty?: boolean;
  meta?: string;
  isKiosk: boolean;
  ids?: string[];
  excludeIds?: boolean;
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
    tags,
    excludeTags,
    tagWithRelated,
    ids,
    excludeIds,
    segment,
    segmentData,
    categoryMeta,
    isKiosk,
    image,
    ...paginationArgs
  }: IProductParams,
) => {
  const { token } = config;
  const $and: any[] = [{}];

  const filter: any = {
    status: { $ne: PRODUCT_STATUSES.DELETED },
    tokens: { $in: [token] },
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

  if (tags?.length) {
    let tagIds: string[] = tags;

    if (tagWithRelated) {
      // const tagObjs = await sendCoreMessage({
      //   subdomain,
      //   action: 'core:tagWithChilds',
      //   data: { query: { _id: { $in: tagIds } } },
      //   isRPC: true,
      //   defaultValue: [],
      // });
      const tagObjs = await sendTRPCMessage({
        method: 'query',
        pluginName: 'core',
        module: 'tags',
        action: 'findWithChild',
        input: { query: { _id: { $in: tagIds } } },
        defaultValue: [],
      });
      tagIds = tagObjs.map((t) => t._id);
    }

    $and.push({ tagIds: { $in: tagIds } });
  }

  if (excludeTags?.length) {
    let tagIds: string[] = excludeTags;

    if (tagWithRelated) {
      // const tagObjs = await sendCoreMessage({
      //   subdomain,
      //   action: 'core:tagWithChilds',
      //   data: { query: { _id: { $in: tagIds } } },
      //   isRPC: true,
      //   defaultValue: [],
      // });
      const tagObjs = await sendTRPCMessage({
        method: 'query',
        pluginName: 'core',
        module: 'tags',
        action: 'findWithChild',
        input: { query: { _id: { $in: tagIds } } },
        defaultValue: [],
      });

      tagIds = tagObjs.map((t) => t._id);
    }

    $and.push({ tagIds: { $nin: tagIds } });
  }

  // search =========
  if (searchValue) {
    const regex = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');

    let codeFilter = { code: { $in: [regex] } };
    if (
      searchValue.includes('.') ||
      searchValue.includes('_') ||
      searchValue.includes('*')
    ) {
      const codeRegex = new RegExp(
        `^${searchValue.replace(/\*/g, '.').replace(/_/g, '.')}$`,
        'igu',
      );
      codeFilter = { code: { $in: [codeRegex] } };
    }

    filter.$or = [
      codeFilter,
      { name: { $in: [regex] } },
      { barcodes: { $in: [searchValue] } },
    ];
  }

  if (segment || segmentData) {
    const qb = new Builder(models, subdomain, { segment, segmentData }, {});

    await qb.buildAllQueries();

    const { list } = await qb.runQueries();

    filter._id = { $in: list.map((l) => l._id) };
  }

  if (vendorId) {
    filter.vendorId = vendorId;
  }

  if (image) {
    filter['attachment.url'] =
      image === 'hasImage' ? { $exists: true } : { $exists: false };
  }

  if (categoryId) {
    const category = await models.ProductCategories.getProductCategory({
      _id: categoryId,
    });

    const relatedCategoryIds = (
      await models.ProductCategories.find(
        { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
        { _id: 1 },
      ).lean()
    ).map((c) => c._id);

    $and.push({ categoryId: { $in: relatedCategoryIds } });
  }

  if (categoryMeta) {
    let categoryFilter: any[] = [];

    if (!Number.isNaN(Number(categoryMeta))) {
      categoryFilter = [
        {
          $project: {
            _id: 1,
            meta: 1,
            intMeta: {
              $convert: { input: '$meta', to: 'int', onError: '', onNull: '' },
            },
          },
        },
        { $match: { intMeta: { $lte: Number(categoryMeta) } } },
      ];
    } else {
      categoryFilter = [
        { $project: { _id: 1, meta: 1 } },
        { $match: { meta: { $eq: categoryMeta } } },
      ];
    }

    const categories = await models.ProductCategories.aggregate([
      { $match: { tokens: { $in: [token] }, meta: { $exists: true } } },
      ...categoryFilter,
    ]);

    $and.push({ categoryId: { $in: categories.map((c) => c._id) } });
  }

  const lastFilter = { ...filter, $and };

  if (isKiosk) {
    return {
      $and: [
        lastFilter,
        { categoryId: { $nin: config.kioskExcludeCategoryIds } },
        { _id: { $nin: config.kioskExcludeProductIds } },
      ],
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
  isKiosk,
  ids,
  excludeIds,
}) => {
  const { token } = config;

  const filter: any = { tokens: { $in: [token] } };
  filter.status = { $nin: ['disabled', 'archived'] };

  if (status && status !== 'active') {
    filter.status = status;
  }

  if (parentId) {
    if (withChild) {
      const category = await (
        models as IModels
      ).ProductCategories.getProductCategory({
        _id: parentId,
      });

      const relatedCategoryIds = (
        await models.ProductCategories.find(
          { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
          { _id: 1 },
        ).lean()
      ).map((c) => c._id);

      filter.parentId = { $in: relatedCategoryIds };
    } else {
      filter.parentId = parentId;
    }
  }

  if (meta) {
    if (!Number.isNaN(meta)) {
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

  if (ids && ids.length > 0) {
    filter._id = { [excludeIds ? '$nin' : '$in']: ids };
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
      tags,
      excludeTags,
      tagWithRelated,
      ids,
      excludeIds,
      pipelineId,
      boardId,
      segment,
      segmentData,
      isKiosk,
      categoryMeta,
      groupedSimilarity,
      image,
      sortField,
      sortDirection,
      ...paginationArgs
    }: IProductParams,
    { models, subdomain, config }: IContext,
  ) {
    let filter = await generateFilter(subdomain, models, config, {
      type,
      categoryId,
      branchId,
      searchValue,
      vendorId,
      tag,
      tags,
      excludeTags,
      tagWithRelated,
      ids,
      excludeIds,
      pipelineId,
      boardId,
      segment,
      segmentData,
      categoryMeta,
      image,
      isKiosk,
    });

    let sortParams: any = { code: 1 };

    if (sortField) {
      if (sortField === 'unitPrice') {
        sortParams = { [`prices.${config.token}`]: sortDirection || 1 };
      } else {
        sortParams = { [sortField]: sortDirection || 1 };
      }
    }

    if (groupedSimilarity) {
      return await getSimilaritiesProducts(models, filter, sortParams, {
        groupedSimilarity,
        ...paginationArgs,
      });
    }

    const paginatedProducts = await paginate(
      models.Products.find(filter).sort(sortParams).lean(),
      paginationArgs,
    );

    return checkRemainders(
      subdomain,
      config,
      paginatedProducts,
      branchId || '',
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
      tags,
      excludeTags,
      tagWithRelated,
      ids,
      excludeIds,
      pipelineId,
      boardId,
      segment,
      segmentData,
      categoryMeta,
      groupedSimilarity,
      image,
      isKiosk,
    }: IProductParams,
    { models, config, subdomain }: IContext,
  ) {
    const filter = await generateFilter(subdomain, models, config, {
      type,
      categoryId,
      branchId,
      searchValue,
      vendorId,
      tag,
      tags,
      excludeTags,
      tagWithRelated,
      ids,
      excludeIds,
      pipelineId,
      boardId,
      segment,
      segmentData,
      categoryMeta,
      image,
      isKiosk,
    });

    if (groupedSimilarity) {
      return await getSimilaritiesProductsCount(models, filter, {
        groupedSimilarity,
      });
    }

    return models.Products.find(filter).countDocuments();
  },

  async poscProductSimilarities(
    _root,
    {
      _id,
      groupedSimilarity,
      branchId,
    }: { _id: string; groupedSimilarity: string; branchId?: string },
    { models, subdomain, config }: IContext,
  ) {
    const product = await models.Products.getProduct({ _id });

    if (groupedSimilarity === 'config') {
      const getRegex = (str) => {
        return ['*', '.', '_'].includes(str)
          ? new RegExp(
              `^${str
                .replace(/\./g, '\\.')
                .replace(/\*/g, '.')
                .replace(/_/g, '.')}.*`,
              'igu',
            )
          : new RegExp(`.*${escapeRegExp(str)}.*`, 'igu');
      };

      const similarityGroups = await models.ProductsConfigs.getConfig(
        'similarityGroup',
      );

      const codeMasks = Object.keys(similarityGroups);
      const customFieldIds = (product.customFieldsData || []).map(
        (cf) => cf.field,
      );

      const matchedMasks = codeMasks.filter((cm) => {
        const mask = similarityGroups[cm];
        const filterFieldDef = mask.filterField || 'code';
        const regexer = getRegex(cm);

        if (filterFieldDef.includes('customFieldsData.')) {
          if (
            !(product.customFieldsData || []).find(
              (cfd) =>
                cfd.field === filterFieldDef.replace('customFieldsData.', '') &&
                cfd.stringValue?.match(regexer),
            )
          ) {
            return false;
          }
        } else {
          if (!product[filterFieldDef]?.match(regexer)) {
            return false;
          }
        }

        return (
          (similarityGroups[cm].rules || [])
            .map((sg) => sg.fieldId)
            .filter((sgf) => customFieldIds.includes(sgf)).length ===
          (similarityGroups[cm].rules || []).length
        );
      });

      if (!matchedMasks.length) {
        return {
          products: await checkRemainders(
            subdomain,
            config,
            await models.Products.find({ _id }),
            branchId || '',
          ),
        };
      }

      const codeRegexs: any[] = [];
      const fieldIds: string[] = [];
      const groups: { title: string; fieldId: string }[] = [];
      for (const matchedMask of matchedMasks) {
        const matched = similarityGroups[matchedMask];
        const filterFieldDef = matched.filterField || 'code';

        if (filterFieldDef.includes('customFieldsData.')) {
          codeRegexs.push({
            $and: [
              {
                'customFieldsData.field': filterFieldDef.replace(
                  'customFieldsData.',
                  '',
                ),
              },
              {
                'customFieldsData.stringValue': {
                  $in: [getRegex(matchedMask)],
                },
              },
            ],
          });
        } else {
          codeRegexs.push({
            [filterFieldDef]: { $in: [getRegex(matchedMask)] },
          });
        }

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
          },
          {
            'customFieldsData.field': { $in: fieldIds },
          },
        ],
      };

      let products = await models.Products.find(filters).sort({ code: 1 });
      if (!products.length) {
        products = await checkRemainders(
          subdomain,
          config,
          [product],
          branchId || '',
        );
      }
      return {
        products,
        groups,
      };
    }

    const category = await models.ProductCategories.getProductCategory({
      _id: product.categoryId,
    });
    if (!category.isSimilarity || !category.similarities.length) {
      return {
        products: await checkRemainders(
          subdomain,
          config,
          await models.Products.find({ _id }),
          branchId || '',
        ),
      };
    }

    const fieldIds = category.similarities.map((r) => r.fieldId);
    const filters: any = {
      $and: [
        {
          categoryId: category._id,
          'customFieldsData.field': { $in: fieldIds },
        },
      ],
    };

    const groups: {
      title: string;
      fieldId: string;
    }[] = category.similarities.map((r) => ({ ...r }));

    return {
      products: await checkRemainders(
        subdomain,
        config,
        await models.Products.find(filters).sort({ code: 1 }),
        branchId || '',
      ),
      groups,
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
      ids,
      excludeIds,
      ...paginationArgs
    }: ICategoryParams,
    { models, config }: IContext,
  ) {
    const filter = await generateFilterCat({
      models,
      config,
      parentId,
      withChild,
      searchValue,
      status,
      meta,
      isKiosk,
      ids,
      excludeIds,
    });

    let sortParams: any = { order: 1 };

    if (sortField) {
      sortParams = { [sortField]: sortDirection };
    }

    let categories;
    if (paginationArgs.page || paginationArgs.perPage) {
      categories = await paginate(
        models.ProductCategories.find(filter).sort(sortParams).lean(),
        paginationArgs,
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
          status: { $ne: PRODUCT_STATUSES.DELETED },
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
      withChild,
      searchValue,
      status,
      meta,
      isKiosk,
      ids,
      excludeIds,
    },
    { models, config }: IContext,
  ) {
    const filter = await generateFilterCat({
      models,
      config,
      parentId,
      withChild,
      searchValue,
      status,
      meta,
      isKiosk,
      ids,
      excludeIds,
    });
    return models.ProductCategories.find(filter).countDocuments();
  },

  async poscProductDetail(
    _root,
    { _id, branchId }: { _id: string; branchId?: string },
    { subdomain, models, config }: IContext,
  ) {
    const product = await models.Products.getProduct({ _id });

    const result = await checkRemainders(
      subdomain,
      config,
      [product],
      branchId,
    );

    return result[0];
  },

  async poscProductCategoryDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.ProductCategories.findOne({ _id }).lean();
  },

  async getPriceInfo(
    _root,
    { productId }: { productId: string },
    { models, subdomain, config }: IContext,
  ) {
    const product = await models.Products.getProduct({ _id: productId });
    const d = {};
    // const d = await sendPricingMessage({
    //   subdomain,
    //   action: 'getQuantityRules',
    //   data: {
    //     departmentId: config.departmentId,
    //     branchId: config.branchId,
    //     products: [
    //       { ...product, unitPrice: (product.prices || {})[config.token] },
    //     ],
    //   },
    //   isRPC: true,
    //   defaultValue: {},
    // });

    return JSON.stringify(d);
  },
};

export default productQueries;
