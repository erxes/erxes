import { IProductDocument, Resolver } from 'erxes-api-shared/core-types';
import {
  cursorPaginate,
  cursorPaginateAggregation,
  defaultPaginate,
  escapeRegExp,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { FilterQuery, PipelineStage, SortOrder } from 'mongoose';
import { IContext, IModels } from '~/connectionResolvers';

import { IProductParams } from '@/products/@types/product';
import {
  PRODUCT_SIMILARITY_STATUSES,
  PRODUCT_STATUSES,
} from '@/products/constants';
import { fetchSegment } from '@/segments/utils/fetchSegment';
import {
  getSimilaritiesProducts,
  getSimilaritiesProductsCount,
} from '@/products/utils';

const inventoryKey = (id?: string) => id || '_';
type DiscountField = 'discount' | 'discountPercent';
type DiscountRangeOperator = '$gte' | '$lte';
type DiscountConditions = Record<string, unknown>;

const isDiscountSortField = (sortField?: string) =>
  sortField === 'discount' || sortField === 'discountPercent';

const hasRangeValue = (value?: number | null): value is number =>
  value !== undefined && value !== null;

const compactDiscountConditions = (conditions: DiscountConditions = {}) =>
  Object.entries(conditions).reduce<DiscountConditions>(
    (result, [key, value]) => {
      if (value === undefined || value === null || value === '') {
        return result;
      }

      result[key] = value;
      return result;
    },
    {},
  );

const getDiscountConditions = (params: IProductParams): DiscountConditions =>
  compactDiscountConditions({
    ...params.discountConditions,
    branchId: params.branchId,
    departmentId: params.departmentId,
    pipelineId: params.pipelineId,
  });

const getSortField = (params: IProductParams) => {
  return params.sortField;
};

const getConditionValueExpression = (conditionsExpression, prefixExpression) => ({
  $first: {
    $map: {
      input: {
        $filter: {
          input: { $objectToArray: conditionsExpression },
          as: 'condition',
          cond: { $eq: ['$$condition.k', prefixExpression] },
        },
      },
      as: 'condition',
      in: '$$condition.v',
    },
  },
});

const getRuleConditionMatchExpression = (requestConditions: DiscountConditions) => {
  const requestConditionsExpression = { $literal: requestConditions };

  return {
    $allElementsTrue: {
      $map: {
        input: { $ifNull: ['$$discount.prefixes', []] },
        as: 'prefix',
        in: {
          $let: {
            vars: {
              requestValue: getConditionValueExpression(
                requestConditionsExpression,
                '$$prefix',
              ),
              ruleValue: getConditionValueExpression(
                { $ifNull: ['$$discount.conditions', {}] },
                '$$prefix',
              ),
            },
            in: {
              $and: [
                { $ne: ['$$requestValue', null] },
                {
                  $cond: [
                    { $isArray: '$$ruleValue' },
                    { $in: ['$$requestValue', '$$ruleValue'] },
                    {
                      $cond: [
                        { $eq: [{ $type: '$$ruleValue' }, 'object'] },
                        {
                          $and: [
                            {
                              $or: [
                                { $eq: ['$$ruleValue.start', null] },
                                { $gte: ['$$requestValue', '$$ruleValue.start'] },
                              ],
                            },
                            {
                              $or: [
                                { $eq: ['$$ruleValue.end', null] },
                                { $lte: ['$$requestValue', '$$ruleValue.end'] },
                              ],
                            },
                          ],
                        },
                        {
                          $cond: [
                            {
                              $in: [
                                { $type: '$$ruleValue' },
                                ['int', 'long', 'double', 'decimal'],
                              ],
                            },
                            { $gte: ['$$requestValue', '$$ruleValue'] },
                            { $eq: ['$$ruleValue', '$$requestValue'] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
  };
};

const getMatchingDiscountsExpression = (conditions: DiscountConditions) => ({
  $filter: {
    input: { $ifNull: ['$discounts', []] },
    as: 'discount',
    cond: getRuleConditionMatchExpression(conditions),
  },
});

const getDiscountValueExpression = (
  field: DiscountField,
  conditions: DiscountConditions,
) => ({
  $ifNull: [
    {
      $max: {
        $map: {
          input: getMatchingDiscountsExpression(conditions),
          as: 'discount',
          in: `$$discount.${field}`,
        },
      },
    },
    0,
  ],
});

const buildScopedDiscountRangeFilter = (
  field: DiscountField,
  operator: DiscountRangeOperator,
  value: number,
  conditions: DiscountConditions,
) => ({
  $expr: {
    [operator]: [getDiscountValueExpression(field, conditions), value],
  },
});

const pushScopedDiscountRangeFilter = (
  filters: FilterQuery<IProductDocument>[],
  field: DiscountField,
  operator: DiscountRangeOperator,
  value: number | undefined,
  conditions: DiscountConditions,
) => {
  if (!hasRangeValue(value)) {
    return;
  }

  filters.push(
    buildScopedDiscountRangeFilter(
      field,
      operator,
      value,
      conditions,
    ),
  );
};

const buildDiscountSortPipeline = (
  filter: FilterQuery<IProductDocument>,
  params: IProductParams,
): PipelineStage[] => {
  const discountField =
    params.sortField === 'discountPercent' ? 'discountPercent' : 'discount';
  const conditions = getDiscountConditions(params);

  return [
    { $match: filter },
    {
      $addFields: {
        discountSortValue: getDiscountValueExpression(discountField, conditions),
      },
    },
  ];
};

const paginateDiscountSortedProducts = async (
  models: IModels,
  filter: FilterQuery<IProductDocument>,
  params: IProductParams,
) => {
  const pipeline = buildDiscountSortPipeline(filter, params);
  const sortDirection = params.sortDirection === -1 ? -1 : 1;
  const paginationParams = params as IProductParams & {
    page?: number;
    perPage?: number;
  };
  const page = Number(paginationParams.page || 1);
  const perPage = Number(paginationParams.perPage || params.limit || 20);

  pipeline.push(
    { $sort: { discountSortValue: sortDirection, code: 1, _id: 1 } },
    { $skip: (page - 1) * perPage },
    { $limit: perPage },
  );

  return models.Products.aggregate(pipeline);
};

const generateFilter = async (
  models: IModels,
  subdomain: string,
  commonQuerySelector: any,
  params: IProductParams,
) => {
  const {
    type,
    categoryIds,
    searchValue,
    vendorId,
    brandIds,
    tagIds,
    excludeTagIds,
    tagWithRelated,
    ids,
    excludeIds,
    image,
    pipelineId,
    segment,
    segmentData,
    branchId,
    departmentId,
    minRemainder,
    maxRemainder,
    minPrice,
    maxPrice,
    minDiscountValue,
    maxDiscountValue,
    minDiscountPercent,
    maxDiscountPercent,
  } = params;

  const filter: FilterQuery<IProductParams> = { ...commonQuerySelector };

  const andFilters: FilterQuery<IProductDocument>[] = [];

  filter.status = { $ne: PRODUCT_STATUSES.DELETED };

  // one card per similarity group: standalone products + each group's star
  if (params.similarity) {
    const starProductIds = await models.ProductSimilarities.distinct(
      'starProductId',
      { status: { $ne: PRODUCT_SIMILARITY_STATUSES.DELETED } },
    );

    andFilters.push({
      $or: [{ similarityId: null }, { _id: { $in: starProductIds } }],
    });
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (type) {
    filter.type = type;
  }

  if (categoryIds) {
    const categories =
      await models.ProductCategories.getChildCategories(categoryIds);

    const catIds = categories.map((c) => c._id);
    andFilters.push({ categoryId: { $in: catIds } });
  } else {
    const notActiveCategories = await models.ProductCategories.find({
      status: { $nin: [null, 'active'] },
    });

    andFilters.push({
      categoryId: { $nin: notActiveCategories.map((e) => e._id) },
    });
  }

  if (ids && ids.length > 0) {
    filter._id = { [excludeIds ? '$nin' : '$in']: ids };
  }

  if (tagIds) {
    const baseTagIds: Set<string> = new Set(tagIds);

    if (tagWithRelated) {
      const tagObjs = await models.Tags.find({ _id: { $in: tagIds } }).lean();

      for (const tag of tagObjs) {
        (tag.relatedIds || []).forEach((id) => baseTagIds.add(id));
      }
    }

    andFilters.push({ tagIds: { $in: Array.from(baseTagIds) } });
  }

  if (excludeTagIds?.length) {
    const baseTagIds: Set<string> = new Set(excludeTagIds);

    if (tagWithRelated) {
      const tagObjs = await models.Tags.find({
        _id: { $in: excludeTagIds },
      }).lean();

      for (const tag of tagObjs) {
        (tag.relatedIds || []).forEach((id) => baseTagIds.add(id));
      }
    }

    andFilters.push({ tagIds: { $nin: Array.from(baseTagIds) } });
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

  if (pipelineId) {
    const pipeline = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      method: 'query',
      module: 'pipeline',
      action: 'findOne',
      input: {
        query: { _id: pipelineId },
        fields: {
          initialCategoryIds: 1,
          excludeCategoryIds: 1,
          excludeProductIds: 1,
        },
      },
      defaultValue: {},
    });

    if (pipeline?.initialCategoryIds?.length) {
      let incCategories = await models.ProductCategories.getChildCategories(
        pipeline.initialCategoryIds,
      );

      if (pipeline?.excludeCategoryIds?.length) {
        const excCategories = await models.ProductCategories.getChildCategories(
          pipeline.excludeCategoryIds,
        );
        const excCatIds = excCategories.map((c) => c._id);
        incCategories = incCategories.filter((c) => !excCatIds.includes(c._id));
      }

      andFilters.push({ categoryId: { $in: incCategories.map((c) => c._id) } });

      if (pipeline?.excludeProductIds?.length) {
        andFilters.push({ _id: { $nin: pipeline.excludeProductIds } });
      }
    }
  }

  if (branchId || departmentId) {
    const branchKey = inventoryKey(branchId);
    const departmentKey = inventoryKey(departmentId);

    if (minRemainder || minRemainder === 0) {
      andFilters.push({
        [`inventories.${branchKey}.${departmentKey}.remainder`]: {
          $exists: true,
          $gte: minRemainder,
        },
      });
    }
    if (maxRemainder || maxRemainder === 0) {
      andFilters.push({
        [`inventories.${branchKey}.${departmentKey}.remainder`]: {
          $exists: true,
          $lte: maxRemainder,
        },
      });
    }

  } else {
    if (minRemainder || minRemainder === 0) {
      andFilters.push({
        $expr: {
          $gte: [
            {
              $sum: {
                $map: {
                  input: { $objectToArray: { $ifNull: ['$inventories', {}] } },
                  as: 'branch',
                  in: {
                    $sum: {
                      $map: {
                        input: { $objectToArray: '$$branch.v' },
                        as: 'dept',
                        in: { $ifNull: ['$$dept.v.remainder', 0] },
                      },
                    },
                  },
                },
              },
            },
            minRemainder,
          ],
        },
      });
    }
    if (maxRemainder || maxRemainder === 0) {
      andFilters.push({
        $expr: {
          $lte: [
            {
              $sum: {
                $map: {
                  input: { $objectToArray: { $ifNull: ['$inventories', {}] } },
                  as: 'branch',
                  in: {
                    $sum: {
                      $map: {
                        input: { $objectToArray: '$$branch.v' },
                        as: 'dept',
                        in: { $ifNull: ['$$dept.v.remainder', 0] },
                      },
                    },
                  },
                },
              },
            },
            maxRemainder,
          ],
        },
      });
    }

  }

  const discountConditions = getDiscountConditions(params);

  pushScopedDiscountRangeFilter(
    andFilters,
    'discount',
    '$gte',
    minDiscountValue,
    discountConditions,
  );
  pushScopedDiscountRangeFilter(
    andFilters,
    'discount',
    '$lte',
    maxDiscountValue,
    discountConditions,
  );
  pushScopedDiscountRangeFilter(
    andFilters,
    'discountPercent',
    '$gte',
    minDiscountPercent,
    discountConditions,
  );
  pushScopedDiscountRangeFilter(
    andFilters,
    'discountPercent',
    '$lte',
    maxDiscountPercent,
    discountConditions,
  );

  if (vendorId) {
    filter.vendorId = vendorId;
  }

  if (brandIds) {
    filter.scopeBrandIds = { $in: brandIds };
  }

  if (image) {
    filter['attachment.url'] =
      image === 'hasImage' ? { $exists: true } : { $exists: false };
  }

  if (minPrice || minPrice === 0) {
    andFilters.push({ unitPrice: { $exists: true, $gte: minPrice } });
  }
  if (maxPrice || maxPrice === 0) {
    andFilters.push({ unitPrice: { $exists: true, $lte: maxPrice } });
  }

  if (segment || segmentData) {
    const segmentObj = segmentData
      ? JSON.parse(segmentData)
      : await models.Segments.findOne({ _id: segment }).lean();

    if (segmentObj) {
      const segmentProductIds = await fetchSegment(
        models,
        subdomain,
        segmentObj,
      );

      andFilters.push({ _id: { $in: segmentProductIds } });
    }
  }

  return { ...filter, ...(andFilters.length ? { $and: andFilters } : {}) };
};

export const productQueries: Record<string, Resolver<any, any, IContext>> = {
  /**
   * Products list
   */
  async productsMain(
    _parent: undefined,
    params: IProductParams,
    { commonQuerySelector, models, subdomain }: IContext,
  ) {
    const filter = await generateFilter(
      models,
      subdomain,
      commonQuerySelector,
      params,
    );

    const sortField = getSortField(params);

    if (isDiscountSortField(params.sortField)) {
      return await cursorPaginateAggregation({
        model: models.Products,
        pipeline: buildDiscountSortPipeline(filter, params),
        params: {
          ...params,
          orderBy: {
            discountSortValue: (params.sortDirection || 1) as SortOrder,
            _id: 1,
          },
        },
      });
    }

    if (sortField) {
      params.orderBy = {
        [sortField]: (params.sortDirection || 1) as SortOrder,
      };
    }

    if (!params.orderBy) {
      params.orderBy = { code: 1 };
    }

    return await cursorPaginate({
      model: models.Products,
      params,
      query: filter,
    });
  },

  async products(
    _parent: undefined,
    params: IProductParams,
    { commonQuerySelector, models, subdomain }: IContext,
  ) {
    const filter = await generateFilter(
      models,
      subdomain,
      commonQuerySelector,
      params,
    );

    const { sortDirection } = params;
    const sortField = getSortField(params);

    let sort: { [key: string]: SortOrder } = { code: 1 };

    if (sortField) {
      sort = { [sortField]: (sortDirection || 1) as SortOrder };
    }

    if (params.groupedSimilarity) {
      return await getSimilaritiesProducts(models, filter, sort, {
        groupedSimilarity: params.groupedSimilarity,
      });
    }

    if (isDiscountSortField(params.sortField)) {
      return await paginateDiscountSortedProducts(models, filter, params);
    }

    return await defaultPaginate(models.Products.find(filter).sort(sort), {
      ...params,
    });
  },

  async cpProducts(
    _parent: undefined,
    params: IProductParams,
    { commonQuerySelector, models, subdomain }: IContext,
  ) {
    const filter = await generateFilter(
      models,
      subdomain,
      commonQuerySelector,
      params,
    );

    const { sortDirection } = params;
    const sortField = getSortField(params);

    let sort: { [key: string]: SortOrder } = { code: 1 };

    if (sortField) {
      sort = { [sortField]: (sortDirection || 1) as SortOrder };
    }

    if (params.groupedSimilarity) {
      return await getSimilaritiesProducts(models, filter, sort, {
        groupedSimilarity: params.groupedSimilarity,
      });
    }

    if (isDiscountSortField(params.sortField)) {
      return await paginateDiscountSortedProducts(models, filter, params);
    }

    return await defaultPaginate(models.Products.find(filter).sort(sort), {
      ...params,
    });
  },

  async productDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return await models.Products.findOne({ _id }).lean();
  },

  async cpProductDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return await models.Products.findOne({ _id }).lean();
  },

  async productsTotalCount(
    _parent: undefined,
    params: IProductParams,
    { commonQuerySelector, models, subdomain }: IContext,
  ) {
    const filter = await generateFilter(
      models,
      subdomain,
      commonQuerySelector,
      params,
    );

    if (params.groupedSimilarity) {
      return await getSimilaritiesProductsCount(models, filter, {
        groupedSimilarity: params.groupedSimilarity,
      });
    }

    return await models.Products.countDocuments(filter);
  },

  async productSimilarities(
    _parent: undefined,
    { _id, groupedSimilarity },
    { models }: IContext,
  ) {
    const product: IProductDocument = await models.Products.getProduct({ _id });

    if (groupedSimilarity === 'config') {
      /**
       * Converts a similarity mask character into a matching regex.
       * Single wildcard chars (*, _) become "any single char" anchored at start.
       * Literal '.' matches strings starting with a dot.
       * All other strings become unanchored escaped-substring matchers.
       */
      const WILDCARD_REGEX: Record<string, RegExp> = {
        '*': /^..*/giu,
        '.': /^\..*/giu,
        _: /^..*/giu,
      };
      const getRegex = (str: string): RegExp => {
        return (
          WILDCARD_REGEX[str] ?? new RegExp(`.*${escapeRegExp(str)}.*`, 'igu')
        );
      };

      const similarityGroups =
        await models.ProductsConfigs.getConfig('similarityGroup');

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
          products: await models.Products.find({ _id }),
        };
      }

      const codeRegexes: FilterQuery<IProductDocument>[] = [];
      const fieldIds: string[] = [];
      const groups: { title: string; fieldId: string }[] = [];

      for (const matchedMask of matchedMasks) {
        const matched = similarityGroups[matchedMask];
        const filterFieldDef = matched.filterField || 'code';

        if (filterFieldDef.includes('customFieldsData.')) {
          codeRegexes.push({
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
          codeRegexes.push({
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

      const filters: FilterQuery<IProductDocument> = {
        $and: [
          {
            $or: codeRegexes,
          },
          {
            'customFieldsData.field': { $in: fieldIds },
          },
        ],
      };

      let products: IProductDocument[] = await models.Products.find(
        filters,
      ).sort({ code: 1 });

      if (!products.length) {
        products = [product];
      }

      return {
        products,
        groups,
      };
    }

    const category = await models.ProductCategories.getProductCategory({
      _id: product.categoryId,
    });

    if (!category.isSimilarity || !category.similarities?.length) {
      return {
        products: await models.Products.find({ _id }),
      };
    }

    const fieldIds = category.similarities.map((r) => r.fieldId);

    const filters: FilterQuery<IProductDocument> = {
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
      products: await models.Products.find(filters).sort({ code: 1 }),
      groups,
    };
  },

  async productCountByTags(_root, _params, { models }: IContext) {
    const counts = {};

    const tags = await models.Tags.find({ type: 'core:product' }).lean();

    for (const tag of tags) {
      counts[tag._id] = await models.Products.find({
        tagIds: tag._id,
        status: { $ne: PRODUCT_STATUSES.DELETED },
      }).countDocuments();
    }

    return counts;
  },
};

productQueries.cpProducts.wrapperConfig = {
  forClientPortal: true,
};

productQueries.cpProductDetail.wrapperConfig = {
  forClientPortal: true,
};
