import { fixNum } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  ACCOUNT_JOURNALS,
  JOURNALS,
  TR_SIDES,
  TR_STATUSES,
} from '../@types/constants';
import {
  IAdjustFundRate,
  IAdjustFundRateDetail,
} from '../@types/adjustRateFundDetails';
import { ITransaction, ITrDetail } from '../@types/transaction';

type TAccountBalance = {
  accountId: string;
  mainBalance: number;
  currencyBalance: number;
  branchId?: string;
  departmentId?: string;
};

type TAdjustmentDetail = IAdjustFundRateDetail & {
  diff: number;
  branchId?: string;
  departmentId?: string;
};

const BALANCE_PRECISION = 6;
const MONEY_PRECISION = 2;

const getStructureValue = (
  adjustValue: string | undefined,
  accountValue: string | undefined,
) => adjustValue || accountValue || undefined;

const buildBalanceByAccount = async (
  models: IModels,
  adjust: IAdjustFundRate,
): Promise<TAccountBalance[]> => {
  const accounts = await models.Accounts.find(
    {
      journal: { $in: [ACCOUNT_JOURNALS.CASH, ACCOUNT_JOURNALS.BANK] },
      currency: adjust.currency,
      status: 'active',
      ...(adjust.branchId ? { branchId: adjust.branchId } : {}),
      ...(adjust.departmentId ? { departmentId: adjust.departmentId } : {}),
    },
    { _id: 1, branchId: 1, departmentId: 1 },
  ).lean();

  if (!accounts.length) {
    return [];
  }

  const accountById = new Map(
    accounts.map((account) => [
      account._id,
      {
        branchId: account.branchId,
        departmentId: account.departmentId,
      },
    ]),
  );

  const records = await models.Transactions.aggregate([
    {
      $match: {
        date: { $lte: adjust.date },
        status: { $in: TR_STATUSES.ACTIVE },
        'details.accountId': { $in: accounts.map((account) => account._id) },
      },
    },
    { $unwind: '$details' },
    {
      $match: {
        'details.accountId': { $in: accounts.map((account) => account._id) },
      },
    },
    {
      $group: {
        _id: '$details.accountId',
        mainBalance: {
          $sum: {
            $cond: [
              { $eq: ['$side', TR_SIDES.DEBIT] },
              '$details.amount',
              { $multiply: ['$details.amount', -1] },
            ],
          },
        },
        currencyBalance: {
          $sum: {
            $cond: [
              { $eq: ['$side', TR_SIDES.DEBIT] },
              { $ifNull: ['$details.currencyAmount', 0] },
              { $multiply: [{ $ifNull: ['$details.currencyAmount', 0] }, -1] },
            ],
          },
        },
      },
    },
  ]);

  return records
    .map((record) => {
      const account = accountById.get(record._id);

      return {
        accountId: record._id,
        mainBalance: fixNum(record.mainBalance || 0, BALANCE_PRECISION),
        currencyBalance: fixNum(record.currencyBalance || 0, BALANCE_PRECISION),
        branchId: getStructureValue(adjust.branchId, account?.branchId),
        departmentId: getStructureValue(
          adjust.departmentId,
          account?.departmentId,
        ),
      };
    })
    .filter(
      (balance) => balance.mainBalance !== 0 || balance.currencyBalance !== 0,
    );
};

const buildAdjustmentDetails = async (
  models: IModels,
  adjust: IAdjustFundRate,
): Promise<TAdjustmentDetail[]> => {
  const balances = await buildBalanceByAccount(models, adjust);

  return balances.map((balance) => {
    const targetMainBalance = fixNum(
      balance.currencyBalance * adjust.spotRate,
      MONEY_PRECISION,
    );
    const diff = fixNum(
      targetMainBalance - balance.mainBalance,
      MONEY_PRECISION,
    );

    return {
      _id: nanoid(),
      accountId: balance.accountId,
      mainBalance: balance.mainBalance,
      currencyBalance: balance.currencyBalance,
      diff,
      branchId: balance.branchId,
      departmentId: balance.departmentId,
      createdAt: new Date(),
    };
  });
};

const makeDetail = (
  accountId: string,
  amount: number,
  source: TAdjustmentDetail,
): ITrDetail => ({
  accountId,
  amount,
  branchId: source.branchId,
  departmentId: source.departmentId,
});

const buildTransactionDocs = (
  adjust: IAdjustFundRate,
  details: TAdjustmentDetail[],
): ITransaction[] => {
  const debitFundDetails: ITrDetail[] = [];
  const creditGainDetails: ITrDetail[] = [];
  const creditFundDetails: ITrDetail[] = [];
  const debitLossDetails: ITrDetail[] = [];

  for (const detail of details) {
    if (detail.diff > 0) {
      debitFundDetails.push(makeDetail(detail.accountId, detail.diff, detail));
      creditGainDetails.push(
        makeDetail(adjust.gainAccountId, detail.diff, detail),
      );
      continue;
    }

    if (detail.diff < 0) {
      const amount = Math.abs(detail.diff);
      creditFundDetails.push(makeDetail(detail.accountId, amount, detail));
      debitLossDetails.push(makeDetail(adjust.lossAccountId, amount, detail));
    }
  }

  const base = {
    date: adjust.date,
    description: adjust.description || 'Fund currency rate adjustment',
    journal: JOURNALS.EXCHANGE_DIFF,
    status: TR_STATUSES.COMPLETE,
    branchId: adjust.branchId,
    departmentId: adjust.departmentId,
    contentType: 'accounting:adjustFundRate',
    contentId: adjust._id,
  };

  const docs: Array<ITransaction | undefined> = [
    debitFundDetails.length
      ? { ...base, side: TR_SIDES.DEBIT, details: debitFundDetails }
      : undefined,
    creditGainDetails.length
      ? { ...base, side: TR_SIDES.CREDIT, details: creditGainDetails }
      : undefined,
    creditFundDetails.length
      ? { ...base, side: TR_SIDES.CREDIT, details: creditFundDetails }
      : undefined,
    debitLossDetails.length
      ? { ...base, side: TR_SIDES.DEBIT, details: debitLossDetails }
      : undefined,
  ];

  return docs.filter((doc): doc is ITransaction => !!doc);
};

export const runAdjustFundRate = async (
  models: IModels,
  userId: string,
  adjust: IAdjustFundRate,
) => {
  if (adjust.transactionId) {
    const oldTransaction = await models.Transactions.findOne({
      parentId: adjust.transactionId,
    }).lean();

    if (oldTransaction) {
      await models.Transactions.removePTransaction({
        parentId: adjust.transactionId,
      });
    }
  }

  const details = await buildAdjustmentDetails(models, adjust);
  const trDocs = buildTransactionDocs(adjust, details);
  const transactions = trDocs.length
    ? await models.Transactions.createPTransaction(trDocs, userId)
    : [];

  const parentId = transactions[0]?.parentId;
  const fundTransactionIds = new Map(
    transactions
      .flatMap((transaction) =>
        (transaction.details || []).map((detail) => ({
          accountId: detail.accountId,
          transactionId: transaction._id,
        })),
      )
      .filter(({ accountId }) =>
        details.some((detail) => detail.accountId === accountId),
      )
      .map(({ accountId, transactionId }) => [accountId, transactionId]),
  );

  return models.AdjustFundRates.updateAdjustFundRate(adjust._id || '', {
    details: details.map(
      ({
        diff: _diff,
        branchId: _branchId,
        departmentId: _departmentId,
        ...detail
      }) => ({
        ...detail,
        transactionId: fundTransactionIds.get(detail.accountId),
      }),
    ),
    transactionId: parentId || '',
    modifiedBy: userId,
  });
};
