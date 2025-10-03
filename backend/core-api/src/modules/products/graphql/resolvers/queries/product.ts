import { IProductDocument } from 'erxes-api-shared/core-types';
import { cursorPaginate, defaultPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery, SortOrder } from 'mongoose';
import { IContext, IModels } from '~/connectionResolvers';

import { IProductParams } from '@/products/@types/product';
import { PRODUCT_STATUSES } from '@/products/constants';
import {
  getSimilaritiesProducts,
  getSimilaritiesProductsCount,
} from '@/products/utils';

const generateFilter = async (
  models: IModels,
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
  } = params;

  const filter: FilterQuery<IProductParams> = { ...commonQuerySelector };

  const andFilters: any[] = [];

  filter.status = { $ne: PRODUCT_STATUSES.DELETED };

  if (params.status) {
    filter.status = params.status;
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
      const tagObjs = await models.Tags.find({ _id: { $in: excludeTagIds } }).lean();

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

  return { ...filter, ...(andFilters.length ? { $and: andFilters } : {}) };
};

export const productQueries = {
  /**
   * Products list
   */
  async productsMain(
    _parent: undefined,
    params: IProductParams,
    { commonQuerySelector, models }: IContext,
  ) {
    const filter = await generateFilter(models, commonQuerySelector, params);

    if (!params.orderBy) {
      params.orderBy = { code: 1 }
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
    { commonQuerySelector, models }: IContext,
  ) {
    const filter = await generateFilter(models, commonQuerySelector, params);

    const { sortField, sortDirection } = params;

    let sort: { [key: string]: SortOrder } = { code: 1 };

    if (sortField) {
      sort = { [sortField]: (sortDirection || 1) as SortOrder };
    }

    if (params.groupedSimilarity) {
      return await getSimilaritiesProducts(models, filter, sort, {
        groupedSimilarity: params.groupedSimilarity,
      });
    }

    return await defaultPaginate(
      models.Products.find(filter).sort(sort),
      {
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

  async productsTotalCount(
    _parent: undefined,
    params: IProductParams,
    { commonQuerySelector, models }: IContext,
  ) {
    const filter = await generateFilter(models, commonQuerySelector, params);

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
          products: await models.Products.find({ _id }),
        };
      }

      const codeRegexes: any[] = [];
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

      const filters: any = {
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
