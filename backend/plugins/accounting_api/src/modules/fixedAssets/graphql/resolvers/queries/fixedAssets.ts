import { escapeRegExp } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  JOURNALS,
  TR_INVENTORY_STATUS_TYPES,
} from '@/accounting/@types/constants';
import {
  FXA_OWNER_RECORD_ACTIONS,
  FXA_OWNER_RECORD_STATUSES,
} from '@/fixedAssets/@types/constants';

const FXA_MOVEMENT_JOURNALS = [
  JOURNALS.FXA_INCOME,
  JOURNALS.FXA_OUT,
  JOURNALS.FXA_SALE,
  JOURNALS.FXA_MOVE,
  JOURNALS.FXA_MOVE_IN,
];

const getFxaMovementSign = (journal?: string) => {
  switch (journal) {
    case JOURNALS.FXA_INCOME:
    case JOURNALS.FXA_MOVE_IN:
      return 1;
    case JOURNALS.FXA_OUT:
    case JOURNALS.FXA_SALE:
    case JOURNALS.FXA_MOVE:
      return -1;
    default:
      return 0;
  }
};

const normalizeLocationId = (value?: string) => value || '';

const getEndOfDay = (value: Date) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);

  return date;
};

type TFxaOwnerRecordParams = {
  ids?: string[];
  searchValue?: string;
  fixedAssetIds?: string[];
  fixedAssetId?: string;
  categoryId?: string;
  action?: string;
  status?: string;
  ownerId?: string;
  balanceOnly?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  transactionId?: string;
  page?: number;
  perPage?: number;
  limit?: number;
};

const buildFxaOwnerRecordFilter = async (
  models: IContext['models'],
  params: TFxaOwnerRecordParams,
) => {
  const filter: Record<string, unknown> = {};

  if (params.ids?.length) {
    filter._id = { $in: params.ids };
  }

  if (params.searchValue) {
    filter.code = { $regex: escapeRegExp(params.searchValue), $options: 'i' };
  }

  if (params.fixedAssetIds?.length) {
    filter.fixedAssetId = { $in: params.fixedAssetIds };
  }

  if (params.fixedAssetId) {
    filter.fixedAssetId = params.fixedAssetId;
  }

  if (params.categoryId) {
    const fixedAssets = await models.FixedAssets.find(
      { categoryId: params.categoryId },
      { _id: 1 },
    ).lean();
    const fixedAssetIds = fixedAssets.map((fixedAsset) => fixedAsset._id);

    filter.fixedAssetId = filter.fixedAssetId
      ? {
          $in: fixedAssetIds.filter((fixedAssetId) =>
            params.fixedAssetId
              ? fixedAssetId === params.fixedAssetId
              : params.fixedAssetIds?.length
                ? params.fixedAssetIds.includes(fixedAssetId)
                : true,
          ),
        }
      : { $in: fixedAssetIds };
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (params.action) {
    filter.action = params.action;
  }

  if (params.ownerId) {
    filter.ownerId = params.ownerId;
  }

  if (params.createdFrom || params.createdTo) {
    filter.createdAt = {
      ...(params.createdFrom ? { $gte: params.createdFrom } : {}),
      ...(params.createdTo ? { $lte: getEndOfDay(params.createdTo) } : {}),
    };
  }

  if (params.transactionId) {
    filter.transactionId = params.transactionId;
  }

  return filter;
};

const getOwnerRecordCountSign = (action?: string) => {
  if (action === FXA_OWNER_RECORD_ACTIONS.RECEIVED) {
    return 1;
  }

  if (action === FXA_OWNER_RECORD_ACTIONS.HANDED_OVER) {
    return -1;
  }

  return 0;
};

const getFxaOwnerRecordBalances = async (
  models: IContext['models'],
  filter: Record<string, unknown>,
) => {
  const records = await models.FxaOwnerRecords.find(filter).lean();
  const balances = new Map<
    string,
    {
      _id: string;
      fixedAssetId?: string;
      code?: string;
      count: number;
      action: string;
      status: string;
      ownerId?: string;
      createdAt?: Date;
      updatedAt?: Date;
      createdBy?: string;
      modifiedBy?: string;
    }
  >();

  for (const record of records) {
    if (!record.fixedAssetId) {
      continue;
    }

    const ownerId = record.ownerId || '';
    const key = `${record.fixedAssetId}:${ownerId}`;
    const current = balances.get(key) || {
      _id: key,
      fixedAssetId: record.fixedAssetId,
      code: record.code,
      count: 0,
      action: 'balance',
      status: FXA_OWNER_RECORD_STATUSES.ACTIVE,
      ownerId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: record.createdBy,
      modifiedBy: record.modifiedBy,
    };

    current.count += getOwnerRecordCountSign(record.action) * (record.count || 0);
    current.updatedAt = record.updatedAt || current.updatedAt;
    balances.set(key, current);
  }

  return Array.from(balances.values()).filter((record) => record.count > 0);
};

const fixedAssets = {
  fxaOwnerRecords: async (
    _root: undefined,
    params: TFxaOwnerRecordParams,
    { models }: IContext,
  ) => {
    const perPage = params.perPage || params.limit;
    const filter = await buildFxaOwnerRecordFilter(models, params);

    if (params.balanceOnly) {
      const records = await getFxaOwnerRecordBalances(models, filter);
      const skip = params.page && perPage ? (params.page - 1) * perPage : 0;

      return records.slice(skip, perPage ? skip + perPage : undefined);
    }

    return models.FxaOwnerRecords.listByFilter(
      filter,
      params.page,
      perPage,
    );
  },

  fxaOwnerRecordsCount: async (
    _root: undefined,
    params: TFxaOwnerRecordParams,
    { models }: IContext,
  ) => {
    const filter = await buildFxaOwnerRecordFilter(models, params);

    if (params.balanceOnly) {
      const records = await getFxaOwnerRecordBalances(models, filter);

      return records.length;
    }

    return models.FxaOwnerRecords.countByFilter(
      filter,
    );
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

  fixedAssetLocationRemainder: async (
    _root: undefined,
    {
      fixedAssetId,
      branchId,
      departmentId,
      date,
      excludeTransactionId,
    }: {
      fixedAssetId: string;
      branchId?: string;
      departmentId?: string;
      date?: Date;
      excludeTransactionId?: string;
    },
    { models }: IContext,
  ) => {
    const filter: Record<string, unknown> = {
      journal: { $in: FXA_MOVEMENT_JOURNALS },
      status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
      'details.fixedAssetId': fixedAssetId,
    };

    if (date) {
      filter.date = { $lte: getEndOfDay(date) };
    }

    if (excludeTransactionId) {
      filter._id = { $ne: excludeTransactionId };
    }

    const transactions = await models.Transactions.find(filter).lean();
    let remainder = 0;
    const normalizedBranchId = normalizeLocationId(branchId);
    const normalizedDepartmentId = normalizeLocationId(departmentId);

    for (const transaction of transactions) {
      const sign = getFxaMovementSign(transaction.journal);

      if (!sign) {
        continue;
      }

      for (const detail of transaction.details || []) {
        if (detail.fixedAssetId !== fixedAssetId) {
          continue;
        }

        const detailBranchId = normalizeLocationId(
          detail.branchId || transaction.branchId,
        );
        const detailDepartmentId = normalizeLocationId(
          detail.departmentId || transaction.departmentId,
        );

        if (
          detailBranchId !== normalizedBranchId ||
          detailDepartmentId !== normalizedDepartmentId
        ) {
          continue;
        }

        remainder += sign * Math.max(0, Math.trunc(detail.count || 0));
      }
    }

    return {
      fixedAssetId,
      branchId: normalizedBranchId,
      departmentId: normalizedDepartmentId,
      remainder,
    };
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
