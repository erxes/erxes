import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { afterQueryWrapper, paginate } from '@erxes/api-utils/src';
import { ACCOUNT_STATUSES } from '../../../models/definitions/accounts';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { IContext } from '../../../connectionResolver';
import messageBroker, { sendTagsMessage } from '../../../messageBroker';
import { Builder, countBySegment, countByTag, IListArgs } from '../../../utils';

const accountQueries = {
  /**
   * Accounts list
   */
  async accounts(
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
      segment,
      segmentData,
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
      segment: string;
      segmentData: string;
    },
    { commonQuerySelector, models, subdomain, user }: IContext
  ) {
    const filter: any = commonQuerySelector;

    filter.status = { $ne: ACCOUNT_STATUSES.DELETED };

    if (type) {
      filter.type = type;
    }

    if (categoryId) {
      const category = await models.AccountCategories.getAccountCatogery({
        _id: categoryId,
        status: { $in: [null, 'active'] }
      });

      const account_category_ids = await models.AccountCategories.find(
        { order: { $regex: new RegExp(category.order) } },
        { _id: 1 }
      );
      filter.categoryId = { $in: account_category_ids };
    } else {
      const notActiveCategories = await models.AccountCategories.find({
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
        {
          code: { $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')] }
        },
        {
          barcodes: {
            $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')]
          }
        }
      ];

      filter.$or = fields;
    }

    if (segment || segmentData) {
      const qb = new Builder(models, subdomain, { segment, segmentData }, {});

      await qb.buildAllQueries();

      const { list } = await qb.runQueries();

      filter._id = { $in: list.map(l => l._id) };
    }

    return afterQueryWrapper(
      subdomain,
      'accounts',
      {
        type,
        categoryId,
        searchValue,
        tag,
        ids,
        excludeIds,
        pipelineId,
        boardId,
        segment,
        segmentData,
        ...pagintationArgs
      },
      await paginate(
        models.Accounts.find(filter)
          .sort('code')
          .lean(),
        pagintationArgs
      ),
      messageBroker(),
      user
    );
  },

  async accountsTotalCount(
    _root,
    {
      type,
      segment,
      segmentData
    }: {
      type: string;
      segment: string;
      segmentData: string;
    },
    { commonQuerySelector, subdomain, models }: IContext
  ) {
    const filter: any = commonQuerySelector;

    filter.status = { $ne: ACCOUNT_STATUSES.DELETED };

    if (type) {
      filter.type = type;
    }

    if (segment || segmentData) {
      const qb = new Builder(models, subdomain, { segment, segmentData }, {});

      await qb.buildAllQueries();

      const { list } = await qb.runQueries();

      filter._id = { $in: list.map(l => l._id) };
    }

    return models.Accounts.find(filter).countDocuments();
  },

  async accountsGroupCounts(
    _root,
    params,
    { commonQuerySelector, commonQuerySelectorElk, models, subdomain }: IContext
  ) {
    const counts = {
      bySegment: {},
      byTag: {}
    };

    const { only } = params;

    const qb = new Builder(models, subdomain, params, {
      commonQuerySelector,
      commonQuerySelectorElk
    });

    switch (only) {
      case 'byTag':
        counts.byTag = await countByTag(subdomain, 'accounts:account', qb);
        break;

      case 'bySegment':
        counts.bySegment = await countBySegment(
          subdomain,
          'accounts:account',
          qb
        );
        break;
    }

    return counts;
  },

  accountCategories(
    _root,
    {
      parentId,
      searchValue,
      status,
      meta
    }: { parentId: string; searchValue: string; status: string; meta: string },
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

    if (meta) {
      if (!isNaN(parseFloat(meta))) {
        filter.meta = { $lte: Number(meta) };
      } else {
        filter.meta = meta;
      }
    }

    return models.AccountCategories.find(filter)
      .sort({ order: 1 })
      .lean();
  },

  accountCategoriesTotalCount(_root, _params, { models }: IContext) {
    return models.AccountCategories.find().countDocuments();
  },

  accountDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Accounts.findOne({ _id }).lean();
  },

  accountCategoryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.AccountCategories.findOne({ _id }).lean();
  },

  async accountCountByTags(_root, _params, { models, subdomain }: IContext) {
    const counts = {};

    // Count accounts by tag =========
    const tags = await sendTagsMessage({
      subdomain,
      action: 'find',
      data: {
        type: 'accounts:account'
      },
      isRPC: true,
      defaultValue: []
    });

    for (const tag of tags) {
      counts[tag._id] = await models.Accounts.find({
        tagIds: tag._id,
        status: { $ne: ACCOUNT_STATUSES.DELETED }
      }).countDocuments();
    }

    return counts;
  }
};

requireLogin(accountQueries, 'accountsTotalCount');
checkPermission(accountQueries, 'accounts', 'showAccounts', []);
checkPermission(accountQueries, 'accountCategories', 'showAccounts', []);
checkPermission(accountQueries, 'accountCountByTags', 'showAccounts', []);

export default accountQueries;
