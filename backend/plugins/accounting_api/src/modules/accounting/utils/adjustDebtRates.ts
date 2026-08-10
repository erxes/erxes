import { fixNum, graphqlPubsub } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  ACCOUNT_JOURNALS,
  ACCOUNT_KINDS,
  JOURNALS,
  TR_SIDES,
  TR_STATUSES,
} from '../@types/constants';
import {
  IAdjustDebtRate,
  IAdjustDebtRateDetail,
} from '../@types/adjustDebtRate';
import { ITransaction, ITrDetail } from '../@types/transaction';

type TDebtBalance = {
  accountId: string;
  customerType?: string;
  customerId?: string;
  branchId?: string;
  departmentId?: string;
  mainBalance: number;
  currencyBalance: number;
};

type TDebtMovement = TDebtBalance & {
  date: Date;
};

type TAdjustmentDetail = IAdjustDebtRateDetail & {
  diff: number;
};

type TAccountMeta = {
  _id: string;
  code?: string;
  name?: string;
  kind?: string;
  currency?: string;
  branchId?: string;
  departmentId?: string;
};

type TPublishedDebtRateDetail = IAdjustDebtRateDetail & {
  accountCode?: string;
  accountName?: string;
  accountKind?: string;
  accountCurrency?: string;
  diff?: number;
};

const BALANCE_PRECISION = 6;
const MONEY_PRECISION = 2;

class DebtRateValidationError extends Error {
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

const makeDebtKey = ({
  accountId,
  customerType,
  customerId,
  branchId,
  departmentId,
}: {
  accountId: string;
  customerType?: string;
  customerId?: string;
  branchId?: string;
  departmentId?: string;
}) =>
  [
    accountId,
    customerType || '',
    customerId || '',
    branchId || '',
    departmentId || '',
  ].join(':');

const getDebtAccounts = async (models: IModels, adjust: IAdjustDebtRate) => {
  const accounts: TAccountMeta[] = await models.Accounts.find(
    {
      journal: ACCOUNT_JOURNALS.DEBT,
      currency: adjust.currency,
      status: 'active',
    },
    { _id: 1, code: 1, name: 1, kind: 1, currency: 1, branchId: 1, departmentId: 1 },
  ).lean();

  return {
    accounts,
    accountById: new Map(accounts.map((account) => [account._id, account])),
  };
};

const getPreviousAdjustment = (
  models: IModels,
  adjust: IAdjustDebtRate,
): Promise<IAdjustDebtRate | null> =>
  models.AdjustDebtRates.findOne({
    _id: { $ne: adjust._id },
    currency: adjust.currency,
    date: { $lt: getPureDate(adjust.date) },
  })
    .sort({ date: -1 })
    .lean();

const checkLaterAdjustment = async (
  models: IModels,
  adjust: IAdjustDebtRate,
) => {
  const laterAdjust = await models.AdjustDebtRates.findOne({
    _id: { $ne: adjust._id },
    currency: adjust.currency,
    date: { $gte: getPureDate(adjust.date) },
  }).lean();

  if (laterAdjust) {
    throw new Error('A later debt rate adjustment already exists.');
  }
};

const getBaseTransactionFilter = (
  adjust: IAdjustDebtRate,
  accountIds: string[],
  endDate: Date,
) => {
  const filter: Record<string, unknown> = {
    date: { $lt: getNextDate(endDate) },
    status: { $in: TR_STATUSES.ACTIVE },
    'details.accountId': { $in: accountIds },
  };

  if (adjust.customerId && adjust.customerType) {
    filter.customerType = adjust.customerType;
  }
  if (adjust.customerId) {
    filter.customerId = adjust.customerId;
  }
  if (adjust.branchId) {
    filter.$or = [
      { branchId: adjust.branchId },
      { 'details.branchId': adjust.branchId },
    ];
  }
  if (adjust.departmentId) {
    filter.$and = [
      ...((filter.$and as unknown[]) || []),
      {
        $or: [
          { departmentId: adjust.departmentId },
          { 'details.departmentId': adjust.departmentId },
        ],
      },
    ];
  }

  return filter;
};

const getFirstDebtTransactionDate = async (
  models: IModels,
  adjust: IAdjustDebtRate,
  accountIds: string[],
) => {
  const endDate = getPureDate(adjust.date);
  const transaction = await models.Transactions.findOne(
    getBaseTransactionFilter(adjust, accountIds, endDate),
    { date: 1 },
  )
    .sort({ date: 1 })
    .lean();

  return transaction?.date ? getPureDate(transaction.date) : undefined;
};

const getAdjustmentPeriod = async (
  models: IModels,
  adjust: IAdjustDebtRate,
  accountIds: string[],
) => {
  await checkLaterAdjustment(models, adjust);

  const previousAdjustment = await getPreviousAdjustment(models, adjust);
  const beginDate = previousAdjustment?.date
    ? getNextDate(previousAdjustment.date)
    : await getFirstDebtTransactionDate(models, adjust, accountIds);

  if (!beginDate) {
    throw new Error('No debt transaction found before this adjustment date.');
  }

  return {
    beginDate,
    endDate: getPureDate(adjust.date),
  };
};

const getDebtMovements = async (
  models: IModels,
  adjust: IAdjustDebtRate,
  accountIds: string[],
  accountById: Map<string, TAccountMeta>,
  endDate: Date,
): Promise<TDebtMovement[]> => {
  const records = await models.Transactions.aggregate([
    {
      $match: getBaseTransactionFilter(adjust, accountIds, endDate),
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
        customerType: 1,
        customerId: 1,
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
          customerType: '$customerType',
          customerId: '$customerId',
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

      return {
        accountId: record._id.accountId,
        customerType: record._id.customerType,
        customerId: record._id.customerId,
        branchId: record._id.branchId || account?.branchId,
        departmentId: record._id.departmentId || account?.departmentId,
        date: getPureDate(record._id.date),
        mainBalance: fixNum(record.mainBalance || 0, BALANCE_PRECISION),
        currencyBalance: fixNum(record.currencyBalance || 0, BALANCE_PRECISION),
      };
    })
    .filter(
      (balance) => balance.mainBalance !== 0 || balance.currencyBalance !== 0,
    );
};

const applyMovement = (
  runningBalances: Map<string, TDebtBalance>,
  movement: TDebtMovement,
) => {
  const key = makeDebtKey(movement);
  const balance = runningBalances.get(key) || {
    accountId: movement.accountId,
    customerType: movement.customerType,
    customerId: movement.customerId,
    branchId: movement.branchId,
    departmentId: movement.departmentId,
    mainBalance: 0,
    currencyBalance: 0,
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

const validateDebtBalance = (
  balance: TDebtBalance,
  accountById: Map<string, TAccountMeta>,
) => {
  const account = accountById.get(balance.accountId);
  if (account?.kind === ACCOUNT_KINDS.ACTIVE && balance.currencyBalance < 0) {
    return 'Active debt account balance must be debit.';
  }

  if (account?.kind === ACCOUNT_KINDS.PASSIVE && balance.currencyBalance > 0) {
    return 'Passive debt account balance must be credit.';
  }

  return '';
};

const buildBalanceByDay = (
  movements: TDebtMovement[],
  accountById: Map<string, TAccountMeta>,
  beginDate: Date,
  endDate: Date,
) => {
  const runningBalances = new Map<string, TDebtBalance>();
  const movementsByDate = new Map<number, TDebtMovement[]>();

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

    const invalidBalance = [...runningBalances.values()].find((balance) =>
      validateDebtBalance(balance, accountById),
    );

    if (invalidBalance) {
      throw new DebtRateValidationError(
        `${validateDebtBalance(invalidBalance, accountById)} Date: ${currentDate.toISOString().slice(0, 10)}, Account: ${invalidBalance.accountId}`,
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
  adjust: IAdjustDebtRate,
) => {
  const { accounts, accountById } = await getDebtAccounts(models, adjust);
  const endDate = getPureDate(adjust.date);

  if (!accounts.length) {
    return {
      beginDate: endDate,
      endDate,
      details: [],
    };
  }

  const accountIds = accounts.map((account) => account._id);
  const period = await getAdjustmentPeriod(models, adjust, accountIds);
  const movements = await getDebtMovements(
    models,
    adjust,
    accountIds,
    accountById,
    period.endDate,
  );
  const balances = buildBalanceByDay(
    movements,
    accountById,
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
        customerType: balance.customerType,
        customerId: balance.customerId,
        branchId: balance.branchId,
        departmentId: balance.departmentId,
        mainBalance: balance.mainBalance,
        currencyBalance: balance.currencyBalance,
        diff,
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
  adjust: IAdjustDebtRate,
  details: TAdjustmentDetail[],
): ITransaction[] => {
  const groupedDetails = new Map<string, TAdjustmentDetail[]>();

  for (const detail of details) {
    const key = `${detail.customerType || ''}:${detail.customerId || ''}`;
    groupedDetails.set(key, [...(groupedDetails.get(key) || []), detail]);
  }

  const docs: ITransaction[] = [];

  for (const customerDetails of groupedDetails.values()) {
    const debitDebtDetails: ITrDetail[] = [];
    const creditGainDetails: ITrDetail[] = [];
    const creditDebtDetails: ITrDetail[] = [];
    const debitLossDetails: ITrDetail[] = [];
    const firstDetail = customerDetails[0];

    for (const detail of customerDetails) {
      if (detail.diff > 0) {
        debitDebtDetails.push(makeDetail(detail.accountId, detail.diff, detail));
        creditGainDetails.push(
          makeDetail(adjust.gainAccountId, detail.diff, detail),
        );
        continue;
      }

      if (detail.diff < 0) {
        const amount = Math.abs(detail.diff);
        creditDebtDetails.push(makeDetail(detail.accountId, amount, detail));
        debitLossDetails.push(makeDetail(adjust.lossAccountId, amount, detail));
      }
    }

    const base = {
      date: adjust.date,
      description: adjust.description || 'Debt currency rate adjustment',
      journal: JOURNALS.EXCHANGE_DIFF,
      status: TR_STATUSES.COMPLETE,
      contentType: 'accounting:adjustDebtRate',
      contentId: adjust._id,
      customerType: firstDetail?.customerType,
      customerId: firstDetail?.customerId,
    };

    if (debitDebtDetails.length) {
      docs.push({ ...base, side: TR_SIDES.DEBIT, details: debitDebtDetails });
    }
    if (creditGainDetails.length) {
      docs.push({ ...base, side: TR_SIDES.CREDIT, details: creditGainDetails });
    }
    if (creditDebtDetails.length) {
      docs.push({ ...base, side: TR_SIDES.CREDIT, details: creditDebtDetails });
    }
    if (debitLossDetails.length) {
      docs.push({ ...base, side: TR_SIDES.DEBIT, details: debitLossDetails });
    }
  }

  return docs;
};

const toPersistedDetail = (
  detail: TAdjustmentDetail,
): IAdjustDebtRateDetail => ({
  _id: detail._id,
  accountId: detail.accountId,
  customerType: detail.customerType,
  customerId: detail.customerId,
  branchId: detail.branchId,
  departmentId: detail.departmentId,
  mainBalance: detail.mainBalance,
  currencyBalance: detail.currencyBalance,
  createdAt: detail.createdAt,
});

export const enrichDebtRateAdjustment = async (
  models: IModels,
  adjust: IAdjustDebtRate,
) => {
  const accountIds = [
    ...new Set((adjust.details || []).map((detail) => detail.accountId)),
  ];
  const accounts: TAccountMeta[] = await models.Accounts.find(
    { _id: { $in: accountIds } },
    { _id: 1, code: 1, name: 1, currency: 1, kind: 1 },
  ).lean();
  const accountById = new Map(
    accounts.map((account) => [account._id, account]),
  );

  const details: TPublishedDebtRateDetail[] = (adjust.details || []).map(
    (detail) => {
      const account = accountById.get(detail.accountId);

      return {
        ...detail,
        accountCode: account?.code,
        accountName: account?.name,
        accountKind: account?.kind,
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

const removeAdjustDebtRateTransaction = async (
  models: IModels,
  adjust: IAdjustDebtRate,
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

export const calculateAdjustDebtRate = async (
  models: IModels,
  userId: string,
  adjust: IAdjustDebtRate,
) => {
  await removeAdjustDebtRateTransaction(models, adjust);

  let result: Awaited<ReturnType<typeof buildAdjustmentResult>>;

  try {
    result = await buildAdjustmentResult(models, adjust);
  } catch (error) {
    const validationError =
      error instanceof DebtRateValidationError ? error : undefined;
    const updatedAdjust = await models.AdjustDebtRates.updateAdjustDebtRate(
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

    graphqlPubsub.publish(`accountingAdjustDebtRateChanged:${adjust._id}`, {
      accountingAdjustDebtRateChanged: await enrichDebtRateAdjustment(
        models,
        updatedAdjust,
      ),
    });

    return updatedAdjust;
  }

  const updatedAdjust = await models.AdjustDebtRates.updateAdjustDebtRate(
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

  graphqlPubsub.publish(`accountingAdjustDebtRateChanged:${adjust._id}`, {
    accountingAdjustDebtRateChanged: await enrichDebtRateAdjustment(
      models,
      updatedAdjust,
    ),
  });

  return updatedAdjust;
};

export const runAdjustDebtRate = async (
  models: IModels,
  userId: string,
  adjust: IAdjustDebtRate,
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

  await removeAdjustDebtRateTransaction(models, adjust);

  const trDocs = buildTransactionDocs(adjust, details);
  const transactions = trDocs.length
    ? await models.Transactions.createPTransaction(trDocs, userId)
    : [];

  const parentId = transactions[0]?.parentId;
  const debtTransactionIds = new Map(
    transactions
      .flatMap((transaction) =>
        (transaction.details || []).map((detail) => ({
          key: makeDebtKey({
            accountId: detail.accountId,
            customerType: transaction.customerType,
            customerId: transaction.customerId,
            branchId: detail.branchId,
            departmentId: detail.departmentId,
          }),
          transactionId: transaction._id,
        })),
      )
      .filter(({ key }) => details.some((detail) => makeDebtKey(detail) === key))
      .map(({ key, transactionId }) => [key, transactionId]),
  );

  const updatedAdjust = await models.AdjustDebtRates.updateAdjustDebtRate(
    adjust._id || '',
    {
      details: details.map((detail) => ({
        ...toPersistedDetail(detail),
        transactionId: debtTransactionIds.get(makeDebtKey(detail)),
      })),
      transactionId: parentId || '',
      checkedAt: new Date(),
      status: 'complete',
      error: '',
      warning: '',
      modifiedBy: userId,
    },
  );

  graphqlPubsub.publish(`accountingAdjustDebtRateChanged:${adjust._id}`, {
    accountingAdjustDebtRateChanged: await enrichDebtRateAdjustment(
      models,
      updatedAdjust,
    ),
  });

  return updatedAdjust;
};
