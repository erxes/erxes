import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { afterQueryWrapper, paginate } from '@erxes/api-utils/src';
import { ACCOUNT_STATUSES } from '../../../models/definitions/accounts';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { IContext, IModels } from '../../../connectionResolver';
import {
  getSimilaritiesAccounts,
  getSimilaritiesAccountsCount,
} from '../../../maskUtils';

interface IQueryParams {
  ids?: string[];
  excludeIds?: boolean;
  type?: string;
  status?: string;
  categoryId?: string;
  searchValue?: string;
  vendorId?: string;
  brand?: string;
  tag: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
  pipelineId?: string;
  boardId?: string;
  segment?: string;
  segmentData?: string;
  groupedSimilarity?: string;
}

const generateFilter = async (
  subdomain,
  models,
  commonQuerySelector,
  params,
) => {
  const {
    type,
    categoryId,
    searchValue,
    vendorId,
    brand,
    tag,
    ids,
    excludeIds,
  } = params;
  const filter: any = commonQuerySelector;

  filter.status = { $ne: ACCOUNT_STATUSES.DELETED };

  if (params.status) {
    filter.status = params.status;
  }
  if (type) {
    filter.type = type;
  }

  if (categoryId) {
    const category = await models.AccountCategories.getAccountingCategory({
      _id: categoryId,
      status: { $in: [null, 'active'] },
    });

    const accountCategoryIds = await models.AccountCategories.find(
      { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
      { _id: 1 },
    );
    filter.categoryId = { $in: accountCategoryIds };
  } else {
    const notActiveCategories = await models.AccountCategories.find({
      status: { $nin: [null, 'active'] },
    });

    filter.categoryId = { $nin: notActiveCategories.map((e) => e._id) };
  }

  if (ids && ids.length > 0) {
    filter._id = { [excludeIds ? '$nin' : '$in']: ids };
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
        .replace(/_/g, '.')}.*`,
      'igu',
    );

    filter.$or = [
      {
        $or: [{ code: { $in: [regex] } }, { code: { $in: [codeRegex] } }],
      },
      { name: { $in: [regex] } },
      { barcodes: { $in: [searchValue] } },
    ];
  }

  if (vendorId) {
    filter.vendorId = vendorId;
  }

  if (brand) {
    filter.scopeBrandIds = { $in: [brand] };
  }

  return filter;
};

const generateFilterCat = async ({
  models,
  parentId,
  withChild,
  searchValue,
  meta,
  brand,
  status,
}) => {
  const filter: any = {};
  filter.status = { $nin: ['disabled', 'archived'] };

  if (status && status !== 'active') {
    filter.status = status;
  }

  if (parentId) {
    if (withChild) {
      const category = await (
        models as IModels
      ).AccountCategories.getAccountCategory({
        _id: parentId,
      });

      const relatedCategoryIds = (
        await models.AccountCategories.find(
          { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
          { _id: 1 },
        ).lean()
      ).map((c) => c._id);

      filter.parentId = { $in: relatedCategoryIds };
    } else {
      filter.parentId = parentId;
    }
  }

  if (brand) {
    filter.scopeBrandIds = { $in: [brand] };
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

const accountQueries = {
  /**
   * Accounts list
   */
  async accounts(
    _root,
    params: IQueryParams,
    { commonQuerySelector, models, subdomain, user }: IContext,
  ) {
    const filter = await generateFilter(
      subdomain,
      models,
      commonQuerySelector,
      params,
    );

    const { sortField, sortDirection, page, perPage, ids, excludeIds } = params;

    const pagintationArgs = { page, perPage };
    if (
      ids &&
      ids.length &&
      !excludeIds &&
      ids.length > (pagintationArgs.perPage || 20)
    ) {
      pagintationArgs.page = 1;
      pagintationArgs.perPage = ids.length;
    }

    let sort: any = { code: 1 };
    if (sortField) {
      sort = { [sortField]: sortDirection || 1 };
    }

    if (params.groupedSimilarity) {
      return await getSimilaritiesAccounts(models, filter, params);
    }

    return afterQueryWrapper(
      subdomain,
      'accounts',
      params,
      await paginate(
        models.Accounts.find(filter).sort(sort).lean(),
        pagintationArgs,
      ),
      user,
    );
  },

  async accountsTotalCount(
    _root,
    params: IQueryParams,
    { commonQuerySelector, models, subdomain }: IContext,
  ) {
    const filter = await generateFilter(
      subdomain,
      models,
      commonQuerySelector,
      params,
    );

    if (params.groupedSimilarity) {
      return await getSimilaritiesAccountsCount(models, filter, params);
    }

    return models.Accounts.find(filter).count();
  },

  /**
   * Group account counts by segment or tag
   */
  async accountsGroupCounts(
    _root,
    params,
    {
      commonQuerySelector,
      commonQuerySelectorElk,
      models,
      subdomain,
    }: IContext,
  ) {
    const counts = {
      bySegment: {},
      byTag: {},
    };

    return counts;
  },

  async accountSimilarities(
    _root,
    { _id, groupedSimilarity },
    { models }: IContext,
  ) {
    const account = await models.Accounts.getAccount({ _id });

    if (groupedSimilarity === 'config') {
      const getRegex = (str) => {
        return new RegExp(
          `^${str
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.')
            .replace(/_/g, '.')}.*`,
          'igu',
        );
      };

      const similarityGroups =
        await models.AccountingsConfigs.getConfig('similarityGroup');

      const codeMasks = Object.keys(similarityGroups);
      const customFieldIds = (account.customFieldsData || []).map(
        (cf) => cf.field,
      );

      const matchedMasks = codeMasks.filter(
        (cm) =>
          account.code.match(getRegex(cm)) &&
          (similarityGroups[cm].rules || [])
            .map((sg) => sg.fieldId)
            .filter((sgf) => customFieldIds.includes(sgf)).length ===
            (similarityGroups[cm].rules || []).length,
      );

      if (!matchedMasks.length) {
        return {
          accounts: await models.Accounts.find({ _id }),
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
            'customFieldsData.field': { $in: fieldIds },
          },
        ],
      };

      return {
        accounts: await models.Accounts.find(filters).sort({ code: 1 }),
        groups,
      };
    }

    const category = await models.AccountCategories.getAccountCategory({
      _id: account.categoryId,
    });
    if (
      !category.isSimilarity ||
      !category.similarities ||
      !category.similarities.length
    ) {
      return {
        accounts: await models.Accounts.find({ _id }),
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
      accounts: await models.Accounts.find(filters).sort({ code: 1 }),
      groups,
    };
  },

  async accountCategories(
    _root,
    { parentId, withChild, searchValue, status, brand, meta },
    { models }: IContext,
  ) {
    const filter = await generateFilterCat({
      models,
      status,
      parentId,
      withChild,
      searchValue,
      brand,
      meta,
    });

    const sortParams: any = { order: 1 };

    return await models.AccountCategories.find(filter).sort(sortParams).lean();
  },

  async accountCategoriesTotalCount(
    _root,
    { parentId, searchValue, status, withChild, brand, meta },
    { models }: IContext,
  ) {
    const filter = await generateFilterCat({
      models,
      parentId,
      withChild,
      searchValue,
      status,
      brand,
      meta,
    });
    return models.AccountCategories.find(filter).countDocuments();
  },

  accountDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Accounts.findOne({ _id }).lean();
  },

  accountCategoryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.AccountCategories.findOne({ _id }).lean();
  },
};

requireLogin(accountQueries, 'accountsTotalCount');
checkPermission(accountQueries, 'accounts', 'showAccounts', []);
checkPermission(accountQueries, 'accountCategories', 'showAccounts', []);

export default accountQueries;
