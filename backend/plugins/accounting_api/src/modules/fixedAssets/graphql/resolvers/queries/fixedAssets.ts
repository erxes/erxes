import { escapeRegExp } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const fixedAssets = {
  fxaInstances: async (
    _root: undefined,
    {
      ids,
      fixedAssetIds,
      status,
      branchId,
      departmentId,
    }: {
      ids?: string[];
      fixedAssetIds?: string[];
      status?: string;
      branchId?: string;
      departmentId?: string;
    },
    { models }: IContext,
  ) => {
    const filter: Record<string, unknown> = {};

    if (ids?.length) {
      filter._id = { $in: ids };
    }

    if (fixedAssetIds?.length) {
      filter.fixedAssetId = { $in: fixedAssetIds };
    }

    if (status) {
      filter.status = status;
    }

    if (branchId) {
      filter.branchId = branchId;
    }

    if (departmentId) {
      filter.departmentId = departmentId;
    }

    return models.FxaInstances.find(filter)
      .sort({ fixedAssetId: 1, code: 1 })
      .lean();
  },

  fixedAssets: async (
    _root: undefined,
    {
      searchValue,
      ids,
      categoryId,
      status,
      limit,
    }: {
      searchValue?: string;
      ids?: string[];
      categoryId?: string;
      status?: string;
      limit?: number;
    },
    { models }: IContext,
  ) => {
    const filter: any = { status: { $ne: 'deleted' } };

    if (ids?.length) {
      filter._id = { $in: ids };
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (status) {
      filter.status = status;
    }

    if (searchValue) {
      const regex = new RegExp(escapeRegExp(searchValue), 'i');
      filter.$or = [{ code: regex }, { name: regex }];
    }

    return models.FixedAssets.find(filter)
      .sort({ code: 1 })
      .limit(limit || 30)
      .lean();
  },

  fixedAssetDetail: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.FixedAssets.findOne({ _id }).lean();
  },

  fixedAssetCategories: async (
    _root: undefined,
    {
      searchValue,
      ids,
      status,
    }: { searchValue?: string; ids?: string[]; status?: string },
    { models }: IContext,
  ) => {
    const filter: any = { status: { $ne: 'deleted' } };

    if (ids?.length) {
      filter._id = { $in: ids };
    }

    if (status) {
      filter.status = status;
    }

    if (searchValue) {
      const regex = new RegExp(escapeRegExp(searchValue), 'i');
      filter.$or = [{ code: regex }, { name: regex }];
    }

    return models.FixedAssetCategories.find(filter).sort({ code: 1 }).lean();
  },

  fixedAssetCategoryDetail: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.FixedAssetCategories.findOne({ _id }).lean();
  },
};

export default fixedAssets;
