import { fixNum, graphqlPubsub } from 'erxes-api-shared/utils';
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

type TBalanceMovement = TAccountBalance & {
  date: Date;
};

type TPublishedFundRateDetail = IAdjustFundRateDetail & {
  accountCode?: string;
  accountName?: string;
  accountCurrency?: string;
  diff?: number;
};

const BALANCE_PRECISION = 6;
const MONEY_PRECISION = 2;

class FundRateValidationError extends Error {
  date: Date;
  beginDate: Date;

  constructor(message: string, date: Date, beginDate: Date) {
    super(message);
    this.date = date;
    this.beginDate = beginDate;
  }
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getPureDate = (date: Date) => {
  const pureDate = new Date(date);
  pureDate.setHours(0, 0, 0, 0);
  return pureDate;
};

const getNextDate = (date: Date) => addDays(getPureDate(date), 1);

const makeBalanceKey = ({
  accountId,
  branchId,
  departmentId,
}: {
  accountId: string;
  branchId?: string;
  departmentId?: string;
}) => `${accountId}:${branchId || ''}:${departmentId || ''}`;

const getFundAccounts = async (models: IModels, adjust: IAdjustFundRate) => {
  const accounts = await models.Accounts.find(
    {
      journal: { $in: [ACCOUNT_JOURNALS.CASH, ACCOUNT_JOURNALS.BANK] },
      currency: adjust.currency,
      status: 'active',
    },
    { _id: 1, branchId: 1, departmentId: 1 },
  ).lean();

  return {
    accounts,
    accountById: new Map(
      accounts.map((account) => [
        account._id,
        {
          branchId: account.branchId,
          departmentId: account.departmentId,
        },
      ]),
    ),
  };
};

const getPreviousAdjustment = (
  models: IModels,
  adjust: IAdjustFundRate,
): Promise<IAdjustFundRate | null> =>
  models.AdjustFundRates.findOne({
    _id: { $ne: adjust._id },
    currency: adjust.currency,
    date: { $lt: getPureDate(adjust.date) },
  })
    .sort({ date: -1 })
    .lean();

const checkLaterAdjustment = async (
  models: IModels,
  adjust: IAdjustFundRate,
): Promise<void> => {
  const laterAdjust = await models.AdjustFundRates.findOne({
    _id: { $ne: adjust._id },
    currency: adjust.currency,
    date: { $gte: getPureDate(adjust.date) },
  }).lean();

  if (laterAdjust) {
    throw new Error('A later fund rate adjustment already exists.');
  }
};

const getFirstFundTransactionDate = async (
  models: IModels,
  adjust: IAdjustFundRate,
  accountIds: string[],
): Promise<Date | undefined> => {
  const endDate = getPureDate(adjust.date);
  const transaction = await models.Transactions.findOne(
    {
      date: { $lt: getNextDate(endDate) },
      status: { $in: TR_STATUSES.ACTIVE },
      'details.accountId': { $in: accountIds },
    },
    { date: 1 },
  )
    .sort({ date: 1 })
    .lean();

  return transaction?.date ? getPureDate(transaction.date) : undefined;
};

const getAdjustmentPeriod = async (
  models: IModels,
  adjust: IAdjustFundRate,
  accountIds: string[],
) => {
  await checkLaterAdjustment(models, adjust);

  const previousAdjustment = await getPreviousAdjustment(models, adjust);
  const beginDate = previousAdjustment?.date
    ? getNextDate(previousAdjustment.date)
    : await getFirstFundTransactionDate(models, adjust, accountIds);

  if (!beginDate) {
    throw new Error('No fund transaction found before this adjustment date.');
  }

  return {
    beginDate,
    endDate: getPureDate(adjust.date),
  };
};

const getBalanceMovements = async (
  models: IModels,
  adjust: IAdjustFundRate,
  accountIds: string[],
  accountById: Map<string, { branchId?: string; departmentId?: string }>,
  endDate: Date,
): Promise<TBalanceMovement[]> => {
  const endExclusiveDate = getNextDate(endDate);

  const records = await models.Transactions.aggregate([
    {
      $match: {
        date: { $lt: endExclusiveDate },
        status: { $in: TR_STATUSES.ACTIVE },
        'details.accountId': { $in: accountIds },
      },
    },
    { $unwind: '$details' },
    {
      $match: {
        'details.accountId': { $in: accountIds },
      },
    },
    {
      $project: {
        date: 1,
        side: 1,
        accountId: '$details.accountId',
        branchId: { $ifNull: ['$details.branchId', '$branchId'] },
        departmentId: { $ifNull: ['$details.departmentId', '$departmentId'] },
        amount: '$details.amount',
        currencyAmount: { $ifNull: ['$details.currencyAmount', 0] },
      },
    },
    {
      $group: {
        _id: {
          date: '$date',
          accountId: '$accountId',
          branchId: '$branchId',
          departmentId: '$departmentId',
        },
        mainBalance: {
          $sum: {
            $cond: [
              { $eq: ['$side', TR_SIDES.DEBIT] },
              '$amount',
              { $multiply: ['$amount', -1] },
            ],
          },
        },
        currencyBalance: {
          $sum: {
            $cond: [
              { $eq: ['$side', TR_SIDES.DEBIT] },
              '$currencyAmount',
              { $multiply: ['$currencyAmount', -1] },
            ],
          },
        },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  return records
    .map((record) => {
      const account = accountById.get(record._id.accountId);
      const branchId = record._id.branchId || account?.branchId;
      const departmentId = record._id.departmentId || account?.departmentId;

      return {
        accountId: record._id.accountId,
        date: getPureDate(record._id.date),
        mainBalance: fixNum(record.mainBalance || 0, BALANCE_PRECISION),
        currencyBalance: fixNum(record.currencyBalance || 0, BALANCE_PRECISION),
        branchId,
        departmentId,
      };
    })
    .filter(
      (balance) => balance.mainBalance !== 0 || balance.currencyBalance !== 0,
    );
};

const applyMovement = (
  runningBalances: Map<string, TAccountBalance>,
  movement: TBalanceMovement,
) => {
  const key = makeBalanceKey(movement);
  const balance = runningBalances.get(key) || {
    accountId: movement.accountId,
    mainBalance: 0,
    currencyBalance: 0,
    branchId: movement.branchId,
    departmentId: movement.departmentId,
  };

  balance.mainBalance = fixNum(
    balance.mainBalance + movement.mainBalance,
    BALANCE_PRECISION,
  );
  balance.currencyBalance = fixNum(
    balance.currencyBalance + movement.currencyBalance,
    BALANCE_PRECISION,
  );
  runningBalances.set(key, balance);
};

const buildBalanceByDay = (
  movements: TBalanceMovement[],
  beginDate: Date,
  endDate: Date,
) => {
  const runningBalances = new Map<string, TAccountBalance>();
  const movementsByDate = new Map<number, TBalanceMovement[]>();

  for (const movement of movements) {
    if (movement.date < beginDate) {
      applyMovement(runningBalances, movement);
      continue;
    }

    const dateKey = movement.date.getTime();
    movementsByDate.set(dateKey, [
      ...(movementsByDate.get(dateKey) || []),
      movement,
    ]);
  }

  let currentDate = beginDate;

  while (currentDate <= endDate) {
    for (const movement of movementsByDate.get(currentDate.getTime()) || []) {
      applyMovement(runningBalances, movement);
    }

    const negativeBalance = [...runningBalances.values()].find(
      (balance) => balance.currencyBalance < 0,
    );

    if (negativeBalance) {
      throw new FundRateValidationError(
        `Fund currency balance cannot be negative before adjustment. Date: ${currentDate.toISOString().slice(0, 10)}, Account: ${negativeBalance.accountId}`,
        currentDate,
        beginDate,
      );
    }

    currentDate = addDays(currentDate, 1);
  }

  return [...runningBalances.values()]
    .map((balance) => ({
      ...balance,
      mainBalance: fixNum(balance.mainBalance, BALANCE_PRECISION),
      currencyBalance: fixNum(balance.currencyBalance, BALANCE_PRECISION),
    }))
    .filter(
      (balance) => balance.mainBalance !== 0 || balance.currencyBalance !== 0,
    );
};

const buildAdjustmentResult = async (
  models: IModels,
  adjust: IAdjustFundRate,
): Promise<{
  beginDate: Date;
  endDate: Date;
  details: TAdjustmentDetail[];
}> => {
  const { accounts, accountById } = await getFundAccounts(models, adjust);
  const endDate = getPureDate(adjust.date);

  if (!accounts.length) {
    return {
      beginDate: endDate,
      endDate,
      details: [],
    };
  }

  const accountIds = accounts.map((account) => account._id);
  const period = await getAdjustmentPeriod(
    models,
    adjust,
    accountIds,
  );
  const movements = await getBalanceMovements(
    models,
    adjust,
    accountIds,
    accountById,
    period.endDate,
  );
  const balances = buildBalanceByDay(
    movements,
    period.beginDate,
    period.endDate,
  );

  return {
    ...period,
    details: balances.map((balance) => {
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
    }),
  };
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

const toPersistedDetail = (
  detail: TAdjustmentDetail,
): IAdjustFundRateDetail => ({
  _id: detail._id,
  accountId: detail.accountId,
  mainBalance: detail.mainBalance,
  currencyBalance: detail.currencyBalance,
  branchId: detail.branchId,
  departmentId: detail.departmentId,
  createdAt: detail.createdAt,
});

const enrichAdjustmentForSubscription = async (
  models: IModels,
  adjust: IAdjustFundRate,
) => {
  const accountIds = [
    ...new Set((adjust.details || []).map((detail) => detail.accountId)),
  ];
  const accounts = await models.Accounts.find(
    { _id: { $in: accountIds } },
    { _id: 1, code: 1, name: 1, currency: 1 },
  ).lean();
  const accountById = new Map(
    accounts.map((account) => [account._id, account]),
  );

  const details: TPublishedFundRateDetail[] = (adjust.details || []).map(
    (detail) => {
      const account = accountById.get(detail.accountId);

      return {
        ...detail,
        accountCode: account?.code,
        accountName: account?.name,
        accountCurrency: account?.currency,
        diff: fixNum(
          (detail.currencyBalance || 0) * (adjust.spotRate || 0) -
            (detail.mainBalance || 0),
          MONEY_PRECISION,
        ),
      };
    },
  );

  return { ...adjust, details };
};

const removeAdjustFundRateTransaction = async (
  models: IModels,
  adjust: IAdjustFundRate,
) => {
  if (!adjust.transactionId) {
    return;
  }

  const oldTransaction = await models.Transactions.findOne({
    parentId: adjust.transactionId,
  }).lean();

  if (oldTransaction) {
    await models.Transactions.removePTransaction({
      parentId: adjust.transactionId,
    });
  }
};

export const calculateAdjustFundRate = async (
  models: IModels,
  userId: string,
  adjust: IAdjustFundRate,
) => {
  await removeAdjustFundRateTransaction(models, adjust);

  let result: Awaited<ReturnType<typeof buildAdjustmentResult>>;

  try {
    result = await buildAdjustmentResult(models, adjust);
  } catch (error) {
    const validationError =
      error instanceof FundRateValidationError ? error : undefined;
    const updatedAdjust = await models.AdjustFundRates.updateAdjustFundRate(
      adjust._id || '',
      {
        details: [],
        transactionId: '',
        beginDate:
          validationError?.beginDate || adjust.beginDate || getPureDate(adjust.date),
        successDate: validationError?.date,
        checkedAt: new Date(),
        status: 'process',
        error: error instanceof Error ? error.message : 'Validation failed.',
        warning: '',
        modifiedBy: userId,
      },
    );

    graphqlPubsub.publish(`accountingAdjustFundRateChanged:${adjust._id}`, {
      accountingAdjustFundRateChanged: await enrichAdjustmentForSubscription(
        models,
        updatedAdjust,
      ),
    });

    return updatedAdjust;
  }

  const updatedAdjust = await models.AdjustFundRates.updateAdjustFundRate(
    adjust._id || '',
    {
      details: result.details.map(toPersistedDetail),
      transactionId: '',
      beginDate: result.beginDate,
      successDate: result.endDate,
      checkedAt: new Date(),
      status: 'process',
      error: '',
      warning: '',
      modifiedBy: userId,
    },
  );

  graphqlPubsub.publish(`accountingAdjustFundRateChanged:${adjust._id}`, {
    accountingAdjustFundRateChanged: await enrichAdjustmentForSubscription(
      models,
      updatedAdjust,
    ),
  });

  return updatedAdjust;
};

export const runAdjustFundRate = async (
  models: IModels,
  userId: string,
  adjust: IAdjustFundRate,
) => {
  const details = (adjust.details || []).length
    ? (adjust.details || []).map((detail) => ({
        ...detail,
        diff: fixNum(
          (detail.currencyBalance || 0) * (adjust.spotRate || 0) -
            (detail.mainBalance || 0),
          MONEY_PRECISION,
        ),
      }))
    : (await buildAdjustmentResult(models, adjust)).details;

  await removeAdjustFundRateTransaction(models, adjust);

  const trDocs = buildTransactionDocs(adjust, details);

  const transactions = trDocs.length
    ? await models.Transactions.createPTransaction(trDocs, userId)
    : [];

  const parentId = transactions[0]?.parentId;
  const fundTransactionIds = new Map(
    transactions
      .flatMap((transaction) =>
        (transaction.details || []).map((detail) => ({
          key: makeBalanceKey({
            accountId: detail.accountId,
            branchId: detail.branchId,
            departmentId: detail.departmentId,
          }),
          transactionId: transaction._id,
        })),
      )
      .filter(({ key }) =>
        details.some((detail) => makeBalanceKey(detail) === key),
      )
      .map(({ key, transactionId }) => [key, transactionId]),
  );

  const updatedAdjust = await models.AdjustFundRates.updateAdjustFundRate(
    adjust._id || '',
    {
      details: details.map((detail) => ({
        ...toPersistedDetail(detail),
        transactionId: fundTransactionIds.get(makeBalanceKey(detail)),
      })),
      transactionId: parentId || '',
      checkedAt: new Date(),
      status: 'complete',
      error: '',
      warning: '',
      modifiedBy: userId,
    },
  );

  graphqlPubsub.publish(`accountingAdjustFundRateChanged:${adjust._id}`, {
    accountingAdjustFundRateChanged: await enrichAdjustmentForSubscription(
      models,
      updatedAdjust,
    ),
  });

  return updatedAdjust;
};
