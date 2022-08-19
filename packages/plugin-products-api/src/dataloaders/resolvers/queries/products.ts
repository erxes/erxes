import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { afterQueryWrapper, paginate } from '@erxes/api-utils/src';
import { PRODUCT_STATUSES } from '../../../models/definitions/products';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { IContext } from '../../../connectionResolver';
import messageBroker, { sendTagsMessage } from '../../../messageBroker';

const productQueries = {
  /**
   * Products list
   */
  async products(
    _root,
    {
      type,
      categoryId,
      searchValue,
      tag,
      ids,
      excludeIds,
      pipelineId,
      boardId,
      ...pagintationArgs
    }: {
      ids: string[];
      excludeIds: boolean;
      type: string;
      categoryId: string;
      searchValue: string;
      tag: string;
      page: number;
      perPage: number;
      pipelineId: string;
      boardId: string;
    },
    { commonQuerySelector, models, subdomain, user }: IContext
  ) {
    const filter: any = commonQuerySelector;

    filter.status = { $ne: PRODUCT_STATUSES.DELETED };

    if (type) {
      filter.type = type;
    }

    if (categoryId) {
      const category = await models.ProductCategories.getProductCatogery({
        _id: categoryId,
        status: { $in: [null, 'active'] }
      });

      const product_category_ids = await models.ProductCategories.find(
        { order: { $regex: new RegExp(category.order) } },
        { _id: 1 }
      );
      filter.categoryId = { $in: product_category_ids };
    } else {
      const notActiveCategories = await models.ProductCategories.find({
        status: { $nin: [null, 'active'] }
      });

      filter.categoryId = { $nin: notActiveCategories.map(e => e._id) };
    }

    if (ids && ids.length > 0) {
      filter._id = { [excludeIds ? '$nin' : '$in']: ids };
      if (!pagintationArgs.page && !pagintationArgs.perPage) {
        pagintationArgs.page = 1;
        pagintationArgs.perPage = 100;
      }
    }

    if (tag) {
      filter.tagIds = { $in: [tag] };
    }

    // search =========
    if (searchValue) {
      const fields = [
        {
          name: { $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')] }
        },
        { code: { $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')] } }
      ];

      filter.$or = fields;
    }

    return afterQueryWrapper(
      subdomain,
      'products',
      {
        type,
        categoryId,
        searchValue,
        tag,
        ids,
        excludeIds,
        pipelineId,
        boardId,
        ...pagintationArgs
      },
      await paginate(
        models.Products.find(filter)
          .sort('code')
          .lean(),
        pagintationArgs
      ),
      messageBroker(),
      user
    );
  },

  /**
   * Get all products count. We will use it in pager
   */
  productsTotalCount(
    _root,
    { type }: { type: string },
    { commonQuerySelector, models }: IContext
  ) {
    const filter: any = commonQuerySelector;

    filter.status = { $ne: PRODUCT_STATUSES.DELETED };

    if (type) {
      filter.type = type;
    }

    return models.Products.find(filter).countDocuments();
  },

  productCategories(
    _root,
    {
      parentId,
      searchValue,
      status
    }: { parentId: string; searchValue: string; status: string },
    { commonQuerySelector, models }: IContext
  ) {
    const filter: any = commonQuerySelector;

    filter.status = { $nin: ['disabled', 'archived'] };

    if (status && status !== 'active') {
      filter.status = status;
    }

    if (parentId) {
      filter.parentId = parentId;
    }

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return models.ProductCategories.find(filter)
      .sort({ order: 1 })
      .lean();
  },

  productCategoriesTotalCount(_root, _params, { models }: IContext) {
    return models.ProductCategories.find().countDocuments();
  },

  productDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Products.findOne({ _id }).lean();
  },

  productCategoryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.ProductCategories.findOne({ _id }).lean();
  },

  async productCountByTags(_root, _params, { models, subdomain }: IContext) {
    const counts = {};

    // Count products by tag =========
    const tags = await sendTagsMessage({
      subdomain,
      action: 'find',
      data: {
        type: 'products:product'
      },
      isRPC: true,
      defaultValue: []
    });

    for (const tag of tags) {
      counts[tag._id] = await models.Products.find({
        tagIds: tag._id,
        status: { $ne: PRODUCT_STATUSES.DELETED }
      }).countDocuments();
    }

    return counts;
  }
};

requireLogin(productQueries, 'productsTotalCount');
checkPermission(productQueries, 'products', 'showProducts', []);
checkPermission(productQueries, 'productCategories', 'showProducts', []);
checkPermission(productQueries, 'productCountByTags', 'showProducts', []);

export default productQueries;
