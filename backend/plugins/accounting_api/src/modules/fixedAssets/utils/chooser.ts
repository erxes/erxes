import {
  ITransactionDocument,
  ITrDetail,
} from '@/accounting/@types/transaction';
import { JOURNALS } from '@/accounting/@types/constants';
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
    let sign = 0;
    if (record.action === 'received') sign = 1;
    else if (record.action === 'handedOver') sign = -1;
    deltas.push({
      fixedAssetId: record.fixedAssetId,
      branchId,
      departmentId,
      ownerId: record.ownerId,
      code: record.code || '',
      count: sign * Math.max(0, Math.trunc(record.count || 0)),
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
