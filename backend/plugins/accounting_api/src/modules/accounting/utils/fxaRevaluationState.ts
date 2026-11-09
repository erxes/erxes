import { IModels } from '~/connectionResolvers';
import { ADJ_FXA_STATUSES } from '../@types/adjustFixedAsset';
import { ITransaction, ITrDetailFollowInfos } from '../@types/transaction';
import { JOURNALS, TR_INVENTORY_STATUS_TYPES } from '../@types/constants';

const money = (value: number): number => Math.round(value * 10000) / 10000;

export const allocateFxaRevaluation = (
  change: number,
  openingLoss: number,
  openingReserve: number,
): Required<
  Pick<ITrDetailFollowInfos, 'revaluationLoss' | 'revaluationReserve'>
> => {
  if (
    ![change, openingLoss, openingReserve].every(Number.isFinite) ||
    openingLoss < 0 ||
    openingReserve < 0
  )
    throw new Error('Invalid opening revaluation balances.');
  const increase = money(Math.max(change, 0));
  const decrease = money(Math.max(-change, 0));
  const lossRecovery = money(Math.min(increase, openingLoss));
  const reserveUsed = money(Math.min(decrease, openingReserve));
  return {
    revaluationLoss: money(decrease - reserveUsed - lossRecovery),
    revaluationReserve: money(increase - lossRecovery - reserveUsed),
  };
};

export type TFxaRevaluationState = {
  count: number;
  loss: number;
  reserve: number;
};

export const sumFxaRevaluationBalances = (
  fixedAssetId: string,
  transactions: Pick<ITransaction, 'journal' | 'date' | 'details'>[],
  opening?: TFxaRevaluationState,
): TFxaRevaluationState => {
  const state = { count: 0, loss: 0, reserve: 0, ...opening };
  for (const transaction of transactions) {
    const details = transaction.details.filter(
      (detail) => detail.fixedAssetId === fixedAssetId,
    );
    for (const detail of details) {
      state.loss += detail.followInfos?.revaluationLoss || 0;
      state.reserve += detail.followInfos?.revaluationReserve || 0;
      if (transaction.journal === JOURNALS.FXA_INCOME)
        state.count += detail.count || 0;
      else if (
        [JOURNALS.FXA_OUT, JOURNALS.FXA_SALE].includes(transaction.journal)
      )
        state.count -= detail.count || 0;
    }
  }
  return {
    count: state.count,
    loss: money(state.loss),
    reserve: money(state.reserve),
  };
};

export const getFxaRevaluationState = async (
  models: IModels,
  fixedAssetId: string,
  date: Date,
  excludeTransactionId?: string,
): Promise<TFxaRevaluationState> => {
  const prior = await models.AdjustFixedAssets.findOne({
    date: { $lt: date },
    status: { $in: [ADJ_FXA_STATUSES.COMPLETE, ADJ_FXA_STATUSES.PUBLISH] },
  })
    .sort({ date: -1 })
    .lean();
  const snapshots = prior
    ? await models.AdjustFxaDetails.find({
        adjustId: prior._id,
        fixedAssetId,
      }).lean()
    : [];
  // An absent asset row is not an opening balance of zero: sum acquisition history.
  const hasSnapshot =
    snapshots.length > 0 &&
    snapshots.every(
      (row) =>
        row.closingRevaluationLoss !== undefined &&
        row.closingRevaluationReserve !== undefined &&
        row.count !== undefined,
    );
  const opening = hasSnapshot
    ? snapshots.reduce<TFxaRevaluationState>(
        (sum, row) => ({
          count: sum.count + (row.count || 0),
          loss: sum.loss + (row.closingRevaluationLoss || 0),
          reserve: sum.reserve + (row.closingRevaluationReserve || 0),
        }),
        { count: 0, loss: 0, reserve: 0 },
      )
    : undefined;
  const through = new Date(date);
  through.setHours(0, 0, 0, 0);
  through.setDate(through.getDate() + 1);
  const afterSnapshot = prior ? new Date(prior.date) : undefined;
  if (afterSnapshot) {
    afterSnapshot.setHours(0, 0, 0, 0);
    afterSnapshot.setDate(afterSnapshot.getDate() + 1);
  }
  const transactions = await models.Transactions.find({
    'details.fixedAssetId': fixedAssetId,
    journal: {
      $in: [
        JOURNALS.FXA_INCOME,
        JOURNALS.FXA_REVALUATION,
        JOURNALS.FXA_OUT,
        JOURNALS.FXA_SALE,
      ],
    },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    ...(excludeTransactionId ? { _id: { $ne: excludeTransactionId } } : {}),
    date: {
      $lt: through,
      ...(hasSnapshot && afterSnapshot ? { $gte: afterSnapshot } : {}),
    },
  })
    .sort({ date: 1, createdAt: 1, _id: 1 })
    .lean();
  return sumFxaRevaluationBalances(fixedAssetId, transactions, opening);
};

// Disposal removes its quantity's history through signed detail entries as well.
export const applyFxaDisposalRevaluation = async (
  models: IModels,
  doc: ITransaction,
): Promise<ITransaction> => {
  const ids = [
    ...new Set(doc.details.map((detail) => detail.fixedAssetId)),
  ].filter((id): id is string => Boolean(id));
  const states = new Map(
    await Promise.all(
      ids.map(
        async (id) =>
          [
            id,
            await getFxaRevaluationState(models, id, doc.date, doc._id),
          ] as const,
      ),
    ),
  );

  return {
    ...doc,
    details: doc.details.map((detail) => {
      const state = states.get(detail.fixedAssetId || '');
      if (!state) return detail;
      const count = detail.count || 0;
      const loss =
        state.count > 0 ? money((state.loss * count) / state.count) : 0;
      const reserve =
        state.count > 0 ? money((state.reserve * count) / state.count) : 0;
      state.count -= count;
      state.loss = money(state.loss - loss);
      state.reserve = money(state.reserve - reserve);
      return {
        ...detail,
        followInfos: {
          ...detail.followInfos,
          revaluationLoss: -loss,
          revaluationReserve: -reserve,
        },
      };
    }),
  };
};
