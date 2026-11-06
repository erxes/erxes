import { getFxaLedgerAssets } from '@/accounting/utils/fxaLedger';
import { IContext } from '~/connectionResolvers';
import {
  ITransactionDocument,
  ITrDetail,
} from '@/accounting/@types/transaction';
import {
  JOURNALS,
  TR_INVENTORY_STATUS_TYPES,
} from '@/accounting/@types/constants';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { assertTransactionJournalPermission } from '@/accounting/utils/transactionPermissions';
import { checkPermissionTrs } from '@/accounting/utils/trPermissions';
import {
  getFxaCorrections,
  getFxaRulesAtDate,
} from '@/accounting/utils/fxaJustify';
import {
  buildFixedAssetLocationRemainderRows,
  getFixedAssetRemainderExclusionFilter,
} from '@/fixedAssets/graphql/resolvers/queries/fixedAssets';
import { IFxaOwnerRecordDocument } from '@/fixedAssets/@types/fxaOwnerRecord';

export type TChooserTransaction = Pick<
  ITransactionDocument,
  '_id' | 'journal' | 'date' | 'branchId' | 'departmentId' | 'followInfos'
> & { details: ITrDetail[] };
export type TChooserOwner = {
  ownerId: string;
  code: string;
  count: number;
  branchId?: string;
  departmentId?: string;
  fixedAssetId: string;
};

const movementJournals = [
  JOURNALS.FXA_INCOME,
  JOURNALS.FXA_OUT,
  JOURNALS.FXA_MOVE,
  JOURNALS.FXA_MOVE_IN,
  JOURNALS.FXA_SALE,
  JOURNALS.FXA_SALE_OUT,
  JOURNALS.FXA_DEP,
  JOURNALS.FXA_DEP_IN,
  JOURNALS.FXA_DEP_OUT,
  JOURNALS.FXA_JUSTIFY,
  JOURNALS.FXA_CAPITAL,
];
const chooserJournals = [
  JOURNALS.FXA_OUT,
  JOURNALS.FXA_MOVE,
  JOURNALS.FXA_SALE,
  JOURNALS.FXA_CAPITAL,
  JOURNALS.FXA_JUSTIFY,
];

export const buildChooserOwnerBalances = (
  transactions: TChooserTransaction[],
  records: Pick<
    IFxaOwnerRecordDocument,
    | 'fixedAssetId'
    | 'ownerId'
    | 'code'
    | 'count'
    | 'action'
    | 'transactionId'
    | 'transactionDetailId'
  >[],
): TChooserOwner[] => {
  const byId = new Map(
    transactions.map((transaction) => [transaction._id, transaction]),
  );
  const deltas: TChooserOwner[] = [];
  for (const record of records) {
    if (!record.ownerId) continue;
    const transaction = record.transactionId
      ? byId.get(record.transactionId)
      : undefined;
    if (record.transactionId && !transaction) continue;
    const detail = transaction?.details.find(
      (value) =>
        value._id === record.transactionDetailId &&
        value.fixedAssetId === record.fixedAssetId,
    );
    let branchId = detail
      ? detail.branchId || transaction?.branchId || ''
      : undefined;
    let departmentId = detail
      ? detail.departmentId || transaction?.departmentId || ''
      : undefined;
    if (
      detail &&
      transaction?.journal === JOURNALS.FXA_MOVE &&
      record.action === 'received'
    ) {
      const destination = transactions.find(
        (value) =>
          value.journal === JOURNALS.FXA_MOVE_IN &&
          value.details.some((row) => row.originId === detail._id),
      );
      const destinationDetail = destination?.details.find(
        (row) => row.originId === detail._id,
      );
      branchId = destinationDetail
        ? destinationDetail.branchId || destination?.branchId || ''
        : undefined;
      departmentId = destinationDetail
        ? destinationDetail.departmentId || destination?.departmentId || ''
        : undefined;
    }
    deltas.push({
      fixedAssetId: record.fixedAssetId,
      branchId,
      departmentId,
      ownerId: record.ownerId,
      code: record.code || '',
      count:
        (record.action === 'received'
          ? 1
          : record.action === 'handedOver'
          ? -1
          : 0) * Math.max(0, Math.trunc(record.count || 0)),
    });
  }
  const identity = (value: TChooserOwner) =>
    JSON.stringify([value.fixedAssetId, value.ownerId, value.code]);
  const uncertain = new Set(
    deltas
      .filter(
        (value) =>
          value.branchId === undefined || value.departmentId === undefined,
      )
      .map(identity),
  );
  const balances = new Map<string, TChooserOwner>();
  for (const delta of deltas) {
    const value = uncertain.has(identity(delta))
      ? { ...delta, branchId: undefined, departmentId: undefined }
      : delta;
    const key = JSON.stringify([
      identity(value),
      value.branchId,
      value.departmentId,
    ]);
    const balance = balances.get(key);
    if (balance) balance.count += value.count;
    else balances.set(key, { ...value });
  }
  return [...balances.values()].filter((value) => value.count > 0);
};

type TChooserParams = {
  journal: string;
  date: Date;
  searchValue?: string;
  categoryId?: string;
  branchId?: string;
  departmentId?: string;
  ownerId?: string;
  excludeTransactionId?: string;
  page?: number;
  perPage?: number;
};

export const accountingFixedAssetChooser = async (
  _root: unknown,
  params: TChooserParams,
  context: IContext,
) => {
  const { models, user } = context;
  if (!user?._id) throw new Error('Authentication required.');
  if (!chooserJournals.includes(params.journal))
    throw new Error('Unsupported fixed asset chooser journal.');
  if (!params.date || !Number.isFinite(new Date(params.date).getTime()))
    throw new Error('Select a valid transaction date.');
  await assertTransactionJournalPermission(context, params.journal, 'read');
  const date = new Date(params.date);
  date.setHours(23, 59, 59, 999);
  const filter: Record<string, unknown> = {
    status: { $ne: 'deleted' },
  };
  if (params.categoryId) filter.categoryId = params.categoryId;
  if (params.searchValue) {
    const regex = new RegExp(escapeRegExp(params.searchValue.trim()), 'i');
    filter.$or = [{ code: regex }, { name: regex }];
  }
  const masters = await models.FixedAssets.find(filter)
    .sort({ code: 1, _id: 1 })
    .lean();
  const assets = await getFxaLedgerAssets(
    models,
    date,
    masters.map((asset) => asset._id),
    params.excludeTransactionId,
  );
  const empty = { items: [], totalCount: 0, hasMore: false };
  if (!assets.length) return empty;
  const ids = assets.map((asset) => asset._id);
  const excluded = params.excludeTransactionId
    ? await models.Transactions.findOne(
        { _id: params.excludeTransactionId },
        { _id: 1, parentId: 1 },
      ).lean()
    : null;
  const exclusion = getFixedAssetRemainderExclusionFilter(
    excluded,
    params.excludeTransactionId,
  );
  const transactions = await models.Transactions.find({
    journal: { $in: movementJournals },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    'details.fixedAssetId': { $in: ids },
    date: { $lte: date },
    ...exclusion,
  }).lean();
  const permissions = await checkPermissionTrs(models, transactions, user);
  const hiddenIds = new Set(
    permissions
      .filter((transaction) => transaction.permission === 'hidden')
      .map((transaction) => transaction._id),
  );
  const hiddenAssets = new Set(
    transactions
      .filter((transaction) => hiddenIds.has(transaction._id))
      .flatMap((transaction) =>
        transaction.details.map((detail) => detail.fixedAssetId),
      ),
  );
  const visibleAssets = assets.filter((asset) => !hiddenAssets.has(asset._id));
  const visibleIds = new Set(visibleAssets.map((asset) => asset._id));
  const visibleTransactions = transactions.filter(
    (transaction) => !hiddenIds.has(transaction._id),
  );
  const ownerRecords = await models.FxaOwnerRecords.find({
    fixedAssetId: { $in: [...visibleIds] },
    status: 'active',
    $or: [
      {
        transactionId: {
          $in: visibleTransactions.map((transaction) => transaction._id),
        },
      },
      { transactionId: { $exists: false } },
      { transactionId: '' },
    ],
    createdAt: { $lte: date },
  }).lean();
  // Transaction-linked rows use their business date, not the later import/creation timestamp.
  const linkedRecords = await models.FxaOwnerRecords.find({
    fixedAssetId: { $in: [...visibleIds] },
    status: 'active',
    transactionId: {
      $in: visibleTransactions.map((transaction) => transaction._id),
    },
  }).lean();
  const ownerById = new Map(
    [...ownerRecords, ...linkedRecords].map((record) => [record._id, record]),
  );
  const owners = buildChooserOwnerBalances(visibleTransactions, [
    ...ownerById.values(),
  ]);
  const branchId = params.branchId === '_' ? '' : params.branchId || undefined;
  const departmentId =
    params.departmentId === '_' ? '' : params.departmentId || undefined;
  const locations = buildFixedAssetLocationRemainderRows({
    fixedAssetIds: [...visibleIds],
    transactions: visibleTransactions,
  });
  const correctionsDate = new Date(date.getTime() + 1);
  const corrections = await getFxaCorrections(
    models,
    correctionsDate,
    params.excludeTransactionId,
  );
  const items = visibleAssets.flatMap((asset) => {
    const assetOwners = owners.filter(
      (owner) => owner.fixedAssetId === asset._id,
    );
    const unknownOwners = assetOwners.filter(
      (owner) =>
        owner.branchId === undefined || owner.departmentId === undefined,
    );
    const allAssetLocations = locations
      .filter((location) => location.fixedAssetId === asset._id)
      .map((location) => ({
        ...location,
        owners: assetOwners.filter(
          (owner) =>
            owner.branchId === location.branchId &&
            owner.departmentId === location.departmentId,
        ),
      }));
    const matchingLocations = allAssetLocations.filter(
      (location) =>
        (branchId === undefined || location.branchId === branchId) &&
        (departmentId === undefined ||
          location.departmentId === departmentId) &&
        (!params.ownerId ||
          location.owners.some((owner) => owner.ownerId === params.ownerId) ||
          unknownOwners.some((owner) => owner.ownerId === params.ownerId)),
    );
    const assetLocations = !matchingLocations.length
      ? []
      : params.journal === JOURNALS.FXA_CAPITAL
      ? allAssetLocations
      : matchingLocations;
    if (!assetLocations.length) return [];
    return [
      {
        asset: { ...asset, ...getFxaRulesAtDate(asset, corrections, date) },
        locations: assetLocations,
        unlocatedOwners: unknownOwners,
      },
    ];
  });
  const perPage = Math.min(100, Math.max(1, Math.trunc(params.perPage || 20)));
  const offset = (Math.max(1, Math.trunc(params.page || 1)) - 1) * perPage;
  return {
    items: items.slice(offset, offset + perPage),
    totalCount: items.length,
    hasMore: offset + perPage < items.length,
  };
};
