import { buildPropertyFilter } from 'erxes-api-shared/core-modules';
import { IProductDocument, Resolver } from 'erxes-api-shared/core-types';
import {
  cursorPaginate,
  cursorPaginateAggregation,
  defaultPaginate,
  escapeRegExp,
} from 'erxes-api-shared/utils';
import { FilterQuery, PipelineStage, SortOrder } from 'mongoose';
import { IContext } from '~/connectionResolvers';

import { IProductParams } from '@/products/@types/product';
import {
  PRODUCT_SIMILARITY_STATUSES,
  PRODUCT_STATUSES,
} from '@/products/constants';
import {
  getSimilaritiesProducts,
  getSimilaritiesProductsCount,
} from '@/products/utils';
import {
  getDiscountConditions,
  getMatchingBaseDiscount,
  getPipelineInventoryScope,
  RequestDiscountConditions,
} from '@/products/graphql/resolvers/customResolvers/product';

type DiscountField = 'discount' | 'discountPercent';
type BasePricedProduct = Record<string, unknown> & {
  unitPrice?: number;
  discounts?: unknown[];
};

const isDiscountSortField = (sortField?: string) =>
  sortField === 'discount' || sortField === 'discountPercent';

const hasRangeValue = (value?: number | null): value is number =>
  value !== undefined && value !== null;

const getSortField = (params: IProductParams) => {
  return params.sortField;
};

const getBasePrice = (
  product: BasePricedProduct,
  conditions: RequestDiscountConditions,
) => {
  const discount = getMatchingBaseDiscount(product.discounts, conditions);

  return discount?.discount !== undefined &&
    typeof product.unitPrice === 'number'
    ? Math.max(product.unitPrice - discount.discount, 0)
    : undefined;
};

const applyBasePrice = <T extends BasePricedProduct>(
  product: T,
  conditions: RequestDiscountConditions,
): T => {
  const price = getBasePrice(product, conditions);

  if (price === undefined) {
    return product;
  }

  return { ...product, unitPrice: price };
};

const applyBasePrices = async <T>(
  context: IContext,
  result: T,
  params: IProductParams,
): Promise<T> => {
  if (!params.placeEntityId && !params.pipelineId) {
    return result;
  }

  const conditions = await getDiscountConditions(context, params);

  if (Array.isArray(result)) {
    return (result as BasePricedProduct[]).map((product) =>
      applyBasePrice(product, conditions),
    ) as T;
  }

  if (
    result &&
    typeof result === 'object' &&
    Array.isArray((result as { list?: unknown[] }).list)
  ) {
    const pagedResult = result as unknown as {
      list: BasePricedProduct[];
    };

    return {
      ...(result as Record<string, unknown>),
      list: pagedResult.list.map((product) =>
        applyBasePrice(product, conditions),
      ),
    } as T;
  }

  return result;
};

const getConditionValueExpression = (
  conditionsExpression,
  prefixExpression,
) => ({
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

const getValueMatchExpression = (requestValue: unknown, ruleValue: string) => ({
  $and: [
    { $ne: [requestValue, null] },
    {
      $cond: [
        { $isArray: ruleValue },
        { $in: [requestValue, ruleValue] },
        {
          $cond: [
            { $eq: [{ $type: ruleValue }, 'object'] },
            {
              $and: [
                {
                  $or: [
                    { $eq: [`${ruleValue}.start`, null] },
                    { $gte: [requestValue, `${ruleValue}.start`] },
                  ],
                },
                {
                  $or: [
                    { $eq: [`${ruleValue}.end`, null] },
                    { $lte: [requestValue, `${ruleValue}.end`] },
                  ],
                },
              ],
            },
            {
              $cond: [
                {
                  $in: [
                    { $type: ruleValue },
                    ['int', 'long', 'double', 'decimal'],
                  ],
                },
                { $gte: [requestValue, ruleValue] },
                { $eq: [ruleValue, requestValue] },
              ],
            },
          ],
        },
      ],
    },
  ],
});

const getRuleConditionMatchExpression = (
  requestConditions: RequestDiscountConditions,
) => {
  const requestConditionsExpression = {
    $literal: Object.fromEntries(
      Object.entries(requestConditions).map(([key, value]) => [
        key,
        Array.isArray(value) ? value : [value],
      ]),
    ),
  };

  return {
    $allElementsTrue: {
      $map: {
        input: { $ifNull: ['$$discount.prefixes', []] },
        as: 'prefix',
        in: {
          $let: {
            vars: {
              requestValues: {
                $ifNull: [
                  getConditionValueExpression(
                    requestConditionsExpression,
                    '$$prefix',
                  ),
                  [],
                ],
              },
              ruleValue: getConditionValueExpression(
                { $ifNull: ['$$discount.conditions', {}] },
                '$$prefix',
              ),
            },
            in: {
              $anyElementTrue: {
                $map: {
                  input: '$$requestValues',
                  as: 'requestValue',
                  in: getValueMatchExpression('$$requestValue', '$$ruleValue'),
                },
              },
            },
          },
        },
      },
    },
  };
};

const getMatchingDiscountsExpression = (
  conditions: RequestDiscountConditions,
) => ({
  $filter: {
    input: { $ifNull: ['$discounts', []] },
    as: 'discount',
    cond: {
      $and: [
        { $ne: ['$$discount.base', true] },
        getRuleConditionMatchExpression(conditions),
      ],
    },
  },
});

const getPlaceDepthExpression = ({
  placeEntityId: placePathIds = [],
}: RequestDiscountConditions) => ({
  $max: [
    0,
    ...placePathIds.map((placeId, index) => ({
      $cond: [
        getValueMatchExpression(
          { $literal: placeId },
          '$$discount.conditions.placeEntityId',
        ),
        index,
        0,
      ],
    })),
  ],
});

const getEffectiveDiscountExpression = (
  conditions: RequestDiscountConditions,
) => ({
  $let: {
    vars: {
      closest: {
        $reduce: {
          input: {
            $map: {
              input: getMatchingDiscountsExpression(conditions),
              as: 'discount',
              in: {
                depth: getPlaceDepthExpression(conditions),
                rule: '$$discount',
              },
            },
          },
          initialValue: null,
          in: {
            $cond: [
              {
                $or: [
                  { $eq: ['$$value', null] },
                  { $gt: ['$$this.depth', '$$value.depth'] },
                  {
                    $and: [
                      { $eq: ['$$this.depth', '$$value.depth'] },
                      {
                        $gt: ['$$this.rule.discount', '$$value.rule.discount'],
                      },
                    ],
                  },
                ],
              },
              '$$this',
              '$$value',
            ],
          },
        },
      },
    },
    in: '$$closest.rule',
  },
});

const discountValueOf = (field: DiscountField) => ({
  $ifNull: [`$$effectiveDiscount.${field}`, 0],
});

const withEffectiveDiscount = (
  conditions: RequestDiscountConditions,
  expression: Record<string, unknown>,
) => ({
  $let: {
    vars: { effectiveDiscount: getEffectiveDiscountExpression(conditions) },
    in: expression,
  },
});

const buildDiscountSortPipeline = async (
  context: IContext,
  filter: FilterQuery<IProductDocument>,
  params: IProductParams,
): Promise<PipelineStage[]> => {
  const discountField =
    params.sortField === 'discountPercent' ? 'discountPercent' : 'discount';
  const conditions = await getDiscountConditions(context, params);

  return [
    { $match: filter },
    {
      $addFields: {
        discountSortValue: withEffectiveDiscount(
          conditions,
          discountValueOf(discountField),
        ),
      },
    },
  ];
};

/**
 * Categories configured as a pipeline's initial ones, expanded with their
 * descendants. Products of these categories are listed before the rest.
 */
const getPipelineInitialCategoryIds = async (
  context: IContext,
  pipelineId?: string,
): Promise<string[]> => {
  if (!pipelineId) {
    return [];
  }

  const pipeline = await getPipelineInventoryScope(context, pipelineId);

  if (!pipeline?.initialCategoryIds?.length) {
    return [];
  }

  const categories = await context.models.ProductCategories.getChildCategories(
    pipeline.initialCategoryIds,
  );

  return categories.map((category) => category._id);
};

const withInitialCategoryPriority = (
  pipeline: PipelineStage[],
  initialCategoryIds: string[],
): PipelineStage[] => [
  ...pipeline,
  {
    $addFields: {
      initialCategoryOrder: {
        $cond: [{ $in: ['$categoryId', initialCategoryIds] }, 0, 1],
      },
    },
  },
];

const paginateDiscountSortedProducts = async (
  context: IContext,
  filter: FilterQuery<IProductDocument>,
  params: IProductParams,
) => {
  const pipeline = await buildDiscountSortPipeline(context, filter, params);
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

  return context.models.Products.aggregate(pipeline);
};

const generateFilter = async (
  context: IContext,
  commonQuerySelector: any,
  params: IProductParams,
) => {
  const { models } = context;
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
    segmentIds,
    propertiesData,
    placeEntityId,
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

  if (propertiesData) {
    const propertyConditions = buildPropertyFilter(propertiesData);

    if (propertyConditions.length) {
      andFilters.push(...propertyConditions);
    }
  }

  if (type) {
    filter.type = type;
  }

  if (categoryIds) {
    const categories = await models.ProductCategories.getChildCategories(
      categoryIds,
    );

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
    if (tagWithRelated) {
      const tagObjs = await models.Tags.find({ _id: { $in: tagIds } }).lean();
      const tagsById = new Map(tagObjs.map((tag) => [tag._id, tag]));

      andFilters.push(
        ...tagIds.map((tagId) => ({
          tagIds: {
            $in: [tagId, ...(tagsById.get(tagId)?.relatedIds || [])],
          },
        })),
      );
    } else {
      andFilters.push({ tagIds: { $all: tagIds } });
    }
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
    const pipeline = await getPipelineInventoryScope(context, pipelineId);

    if (pipeline?.excludeCategoryIds?.length) {
      const excludedCategories =
        await models.ProductCategories.getChildCategories(
          pipeline.excludeCategoryIds,
        );

      if (excludedCategories.length) {
        andFilters.push({
          categoryId: { $nin: excludedCategories.map((c) => c._id) },
        });
      }
    }

    if (pipeline?.excludeProductIds?.length) {
      andFilters.push({ _id: { $nin: pipeline.excludeProductIds } });
    }
  }

  if (placeEntityId) {
    if (minRemainder || minRemainder === 0) {
      andFilters.push({
        [`inventories.${placeEntityId}.remainder`]: {
          $exists: true,
          $gte: minRemainder,
        },
      });
    }
    if (maxRemainder || maxRemainder === 0) {
      andFilters.push({
        [`inventories.${placeEntityId}.remainder`]: {
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
                  as: 'place',
                  in: { $ifNull: ['$$place.v.remainder', 0] },
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
                  as: 'place',
                  in: { $ifNull: ['$$place.v.remainder', 0] },
                },
              },
            },
            maxRemainder,
          ],
        },
      });
    }
  }

  const discountRanges = (
    [
      ['discount', '$gte', minDiscountValue],
      ['discount', '$lte', maxDiscountValue],
      ['discountPercent', '$gte', minDiscountPercent],
      ['discountPercent', '$lte', maxDiscountPercent],
    ] as const
  ).filter(([, , value]) => hasRangeValue(value));

  if (discountRanges.length) {
    const discountConditions = await getDiscountConditions(context, params);

    andFilters.push({
      $expr: withEffectiveDiscount(discountConditions, {
        $and: discountRanges.map(([field, operator, value]) => ({
          [operator]: [discountValueOf(field), value],
        })),
      }),
    });
  }

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

  if (segmentIds?.length) {
    andFilters.push({ segmentIds: { $in: segmentIds } });
  } else if (segment) {
    andFilters.push({ segmentIds: segment });
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
    context: IContext,
  ) {
    const { commonQuerySelector, models } = context;
    const filter = await generateFilter(context, commonQuerySelector, params);

    const sortField = getSortField(params);

    const initialCategoryIds = await getPipelineInitialCategoryIds(
      context,
      params.pipelineId,
    );

    const priorityOrder: Record<string, SortOrder> = initialCategoryIds.length
      ? { initialCategoryOrder: 1 }
      : {};

    if (isDiscountSortField(params.sortField)) {
      const discountPipeline = await buildDiscountSortPipeline(
        context,
        filter,
        params,
      );

      const result = await cursorPaginateAggregation({
        model: models.Products,
        pipeline: initialCategoryIds.length
          ? withInitialCategoryPriority(discountPipeline, initialCategoryIds)
          : discountPipeline,
        params: {
          ...params,
          orderBy: {
            ...priorityOrder,
            discountSortValue: (params.sortDirection || 1) as SortOrder,
            _id: 1,
          },
        },
      });

      return applyBasePrices(context, result, params);
    }

    if (sortField) {
      params.orderBy = {
        [sortField]: (params.sortDirection || 1) as SortOrder,
      };
    }

    if (!params.orderBy) {
      params.orderBy = { code: 1 };
    }

    if (initialCategoryIds.length) {
      const result = await cursorPaginateAggregation({
        model: models.Products,
        pipeline: withInitialCategoryPriority(
          [{ $match: filter }],
          initialCategoryIds,
        ),
        params: {
          ...params,
          orderBy: {
            ...priorityOrder,
            ...params.orderBy,
            _id: params.orderBy._id ?? 1,
          },
        },
      });

      return applyBasePrices(context, result, params);
    }

    const result = await cursorPaginate({
      model: models.Products,
      params,
      query: filter,
    });

    return applyBasePrices(context, result, params);
  },

  async products(
    _parent: undefined,
    params: IProductParams,
    context: IContext,
  ) {
    const { commonQuerySelector, models } = context;
    const filter = await generateFilter(context, commonQuerySelector, params);

    const { sortDirection } = params;
    const sortField = getSortField(params);

    let sort: { [key: string]: SortOrder } = { code: 1 };

    if (sortField) {
      sort = { [sortField]: (sortDirection || 1) as SortOrder };
    }

    if (params.groupedSimilarity) {
      const result = await getSimilaritiesProducts(models, filter, sort, {
        groupedSimilarity: params.groupedSimilarity,
      });

      return applyBasePrices(context, result, params);
    }

    if (isDiscountSortField(params.sortField)) {
      const result = await paginateDiscountSortedProducts(
        context,
        filter,
        params,
      );

      return applyBasePrices(context, result, params);
    }

    const result = await defaultPaginate(
      models.Products.find(filter).sort(sort).lean(),
      {
        ...params,
      },
    );

    return applyBasePrices(context, result, params);
  },

  async cpProducts(
    _parent: undefined,
    params: IProductParams,
    context: IContext,
  ) {
    const { commonQuerySelector, models } = context;
    const filter = await generateFilter(context, commonQuerySelector, params);

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
      return await paginateDiscountSortedProducts(context, filter, params);
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

  async productLastCodeByCategory(
    _parent: undefined,
    { categoryId }: { categoryId?: string },
    context: IContext,
  ) {
    if (!categoryId) {
      return null;
    }

    const { models } = context;
    const categories = await models.ProductCategories.getChildCategories([
      categoryId,
    ]);
    const categoryIds = categories.map((category) => category._id);

    const [product] = await models.Products.aggregate<{ code: string }>([
      {
        $match: {
          categoryId: { $in: categoryIds },
        },
      },
      {
        $addFields: {
          codeLength: { $strLenCP: '$code' },
        },
      },
      {
        $sort: {
          codeLength: -1,
          code: -1,
        },
      },
      { $limit: 1 },
      { $project: { _id: 0, code: 1 } },
    ]);

    return product?.code || null;
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
    context: IContext,
  ) {
    const { commonQuerySelector, models } = context;
    const filter = await generateFilter(context, commonQuerySelector, params);

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
