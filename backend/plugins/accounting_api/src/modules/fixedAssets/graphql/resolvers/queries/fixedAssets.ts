import { escapeRegExp } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { FXA_LOG_EVENT_TYPES } from '@/fixedAssets/@types/constants';

const fixedAssets = {
  fxaInstances: async (
    _root: undefined,
    {
      ids,
      fixedAssetIds,
      status,
      branchId,
      departmentId,
      transactionId,
    }: {
      ids?: string[];
      fixedAssetIds?: string[];
      status?: string;
      branchId?: string;
      departmentId?: string;
      transactionId?: string;
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
      filter.$or = [
        { currentStatus: status },
        { currentStatus: { $exists: false }, status },
      ];
    }

    if (branchId) {
      filter.$and = [
        ...((filter.$and as Record<string, unknown>[]) || []),
        {
          $or: [
            { currentBranchId: branchId },
            { currentBranchId: { $exists: false }, branchId },
          ],
        },
      ];
    }

    if (departmentId) {
      filter.$and = [
        ...((filter.$and as Record<string, unknown>[]) || []),
        {
          $or: [
            { currentDepartmentId: departmentId },
            { currentDepartmentId: { $exists: false }, departmentId },
          ],
        },
      ];
    }

    const transactionIds = Array.from(new Set([transactionId].filter(Boolean)));

    if (transactionIds.length) {
      const logsByTransaction = await Promise.all(
        transactionIds.map((id) =>
          models.FxaInstanceLogs.findByTransaction(id || '', [
            FXA_LOG_EVENT_TYPES.ACQUISITION,
            FXA_LOG_EVENT_TYPES.DISPOSAL,
            FXA_LOG_EVENT_TYPES.SALE,
            FXA_LOG_EVENT_TYPES.MOVE,
          ]),
        ),
      );
      const transactionInstanceIds = Array.from(
        new Set(logsByTransaction.flat().map((log) => log.fxaInstanceId)),
      );

      if (!transactionInstanceIds.length) {
        return [];
      }

      filter._id = { $in: transactionInstanceIds };
    }

    return models.FxaInstances.listByFilter(filter);
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
