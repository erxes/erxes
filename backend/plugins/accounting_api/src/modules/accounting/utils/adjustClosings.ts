import { fixNum } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  ACCOUNT_KINDS,
  JOURNALS,
  TR_SIDES,
  TR_STATUSES,
} from '../@types/constants';
import {
  IAdjustClosing,
  IAdjustClosingDetail,
  IClosingDetailEntry,
} from '../@types/adjustClosingEntry';
import { ITransaction, ITrDetail } from '../@types/transaction';

type TAccountMeta = {
  _id: string;
  kind?: string;
  branchId?: string;
  departmentId?: string;
};

type TClosingBalance = {
  accountId: string;
  branchId?: string;
  departmentId?: string;
  balance: number;
};

type TTransactionBuildResult = {
  docs: ITransaction[];
  details: IAdjustClosingDetail[];
  taxAmount: number;
};

const MONEY_PRECISION = 2;
const DEFAULT_TAX_PERCENT = 10;

class ClosingValidationError extends Error {
  beginDate: Date;
  date: Date;

  constructor(message: string, beginDate: Date, date: Date) {
    super(message);
    this.beginDate = beginDate;
    this.date = date;
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

const makeGroupKey = ({
  branchId,
  departmentId,
}: {
  branchId?: string;
  departmentId?: string;
}) => `${branchId || ''}:${departmentId || ''}`;

const makeEntryKey = ({
  accountId,
  branchId,
  departmentId,
}: {
  accountId: string;
  branchId?: string;
  departmentId?: string;
}) => `${makeGroupKey({ branchId, departmentId })}:${accountId}`;

const getTempAccounts = async (models: IModels) => {
  const accounts: TAccountMeta[] = await models.Accounts.find(
    {
      isTemp: true,
      status: 'active',
    },
    { _id: 1, kind: 1, branchId: 1, departmentId: 1 },
  ).lean();

  return {
    accounts,
    accountById: new Map(accounts.map((account) => [account._id, account])),
  };
};

const getFirstTempTransactionDate = async (
  models: IModels,
  accountIds: string[],
  endDate: Date,
) => {
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

const getPreviousClosing = (models: IModels, adjust: IAdjustClosing) =>
  models.AdjustClosings.findOne({
    _id: { $ne: adjust._id },
    status: { $in: ['complete', 'publish'] },
    date: { $lt: getPureDate(adjust.date) },
  })
    .sort({ date: -1 })
    .lean();

const checkLaterClosing = async (models: IModels, adjust: IAdjustClosing) => {
  const laterClosing = await models.AdjustClosings.findOne({
    _id: { $ne: adjust._id },
    date: { $gte: getPureDate(adjust.date) },
  }).lean();

  if (laterClosing) {
    throw new Error('A later closing adjustment already exists.');
  }
};

const getClosingPeriod = async (
  models: IModels,
  adjust: IAdjustClosing,
  accountIds: string[],
) => {
  await checkLaterClosing(models, adjust);

  const endDate = getPureDate(adjust.date);
  const previousClosing = await getPreviousClosing(models, adjust);
  const beginDate = previousClosing?.date
    ? getNextDate(previousClosing.date)
    : await getFirstTempTransactionDate(models, accountIds, endDate);

  if (!beginDate) {
    throw new Error(
      'No temporary account transaction found before this closing date.',
    );
  }

  return { beginDate, endDate };
};

const getClosingBalances = async (
  models: IModels,
  accountIds: string[],
  accountById: Map<string, TAccountMeta>,
  endDate: Date,
): Promise<TClosingBalance[]> => {
  const records = await models.Transactions.aggregate([
    {
      $match: {
        date: { $lt: getNextDate(endDate) },
        status: { $in: TR_STATUSES.ACTIVE },
        'details.accountId': { $in: accountIds },
      },
    },
    { $unwind: '$details' },
    { $match: { 'details.accountId': { $in: accountIds } } },
    {
      $project: {
        side: 1,
        accountId: '$details.accountId',
        branchId: { $ifNull: ['$details.branchId', '$branchId'] },
        departmentId: { $ifNull: ['$details.departmentId', '$departmentId'] },
        amount: '$details.amount',
      },
    },
    {
      $group: {
        _id: {
          accountId: '$accountId',
          branchId: '$branchId',
          departmentId: '$departmentId',
        },
        balance: {
          $sum: {
            $cond: [
              { $eq: ['$side', TR_SIDES.DEBIT] },
              '$amount',
              { $multiply: ['$amount', -1] },
            ],
          },
        },
      },
    },
  ]);

  return records
    .map((record) => {
      const account = accountById.get(record._id.accountId);

      return {
        accountId: record._id.accountId,
        branchId: record._id.branchId || account?.branchId,
        departmentId: record._id.departmentId || account?.departmentId,
        balance: fixNum(record.balance || 0, MONEY_PRECISION),
      };
    })
    .filter((balance) => balance.balance !== 0);
};

const validateFinalBalances = (
  balances: TClosingBalance[],
  accountById: Map<string, TAccountMeta>,
  beginDate: Date,
  endDate: Date,
) => {
  const invalidBalance = balances.find((balance) => {
    const account = accountById.get(balance.accountId);

    if (account?.kind === ACCOUNT_KINDS.ACTIVE) {
      return balance.balance < 0;
    }

    if (account?.kind === ACCOUNT_KINDS.PASSIVE) {
      return balance.balance > 0;
    }

    return false;
  });

  if (!invalidBalance) {
    return;
  }

  throw new ClosingValidationError(
    `Temporary account final balance has invalid side. Account: ${invalidBalance.accountId}`,
    beginDate,
    endDate,
  );
};

const getExistingPercentByEntry = (adjust: IAdjustClosing) => {
  const percentByEntry = new Map<string, number>();

  for (const detail of adjust.details || []) {
    for (const entry of detail.entries || []) {
      percentByEntry.set(
        makeEntryKey({
          accountId: entry.accountId,
          branchId: detail.branchId,
          departmentId: detail.departmentId,
        }),
        entry.percent ?? DEFAULT_TAX_PERCENT,
      );
    }
  }

  return percentByEntry;
};

const buildClosingDetails = (
  balances: TClosingBalance[],
  adjust: IAdjustClosing,
) => {
  const percentByEntry = getExistingPercentByEntry(adjust);
  const detailsByGroup = new Map<string, IAdjustClosingDetail>();

  for (const balance of balances) {
    const key = makeGroupKey(balance);
    const detail = detailsByGroup.get(key) || {
      _id: nanoid(),
      branchId: balance.branchId,
      departmentId: balance.departmentId,
      entries: [],
      createdAt: new Date(),
    };

    detail.entries.push({
      _id: nanoid(),
      accountId: balance.accountId,
      balance: balance.balance,
      percent: percentByEntry.get(makeEntryKey(balance)) ?? DEFAULT_TAX_PERCENT,
    });
    detailsByGroup.set(key, detail);
  }

  return [...detailsByGroup.values()];
};

const makeDetail = (
  accountId: string,
  amount: number,
  source: { branchId?: string; departmentId?: string },
): ITrDetail => ({
  accountId,
  amount: fixNum(amount, MONEY_PRECISION),
  branchId: source.branchId,
  departmentId: source.departmentId,
});

const pushTransaction = (
  docs: ITransaction[],
  base: Omit<ITransaction, 'details' | 'side' | 'journal'>,
  side: string,
  details: ITrDetail[],
) => {
  if (!details.length) {
    return;
  }

  docs.push({
    ...base,
    journal: JOURNALS.MAIN,
    status: TR_STATUSES.COMPLETE,
    side,
    details,
  });
};

const buildTransactionDocs = (
  adjust: IAdjustClosing,
  details: IAdjustClosingDetail[],
): TTransactionBuildResult => {
  const docs: ITransaction[] = [];
  const base = {
    date: adjust.date,
    description: adjust.description || 'Temporary account closing adjustment',
    contentType: 'accounting:adjustClosing',
    contentId: adjust._id,
  };
  let taxableResult = 0;
  let periodBalance = 0;

  for (const detail of details) {
    const debitTempDetails: ITrDetail[] = [];
    const creditTempDetails: ITrDetail[] = [];
    const debitIntegrateDetails: ITrDetail[] = [];
    const creditIntegrateDetails: ITrDetail[] = [];
    const debitPeriodDetails: ITrDetail[] = [];
    const creditPeriodDetails: ITrDetail[] = [];
    let groupBalance = 0;

    for (const entry of detail.entries) {
      const amount = Math.abs(entry.balance);
      taxableResult = fixNum(
        taxableResult + entry.balance * ((entry.percent ?? 0) / 100),
        MONEY_PRECISION,
      );
      groupBalance = fixNum(groupBalance + entry.balance, MONEY_PRECISION);

      if (entry.balance > 0) {
        creditTempDetails.push(makeDetail(entry.accountId, amount, detail));
        debitIntegrateDetails.push(
          makeDetail(adjust.integrateAccountId, amount, detail),
        );
      }

      if (entry.balance < 0) {
        debitTempDetails.push(makeDetail(entry.accountId, amount, detail));
        creditIntegrateDetails.push(
          makeDetail(adjust.integrateAccountId, amount, detail),
        );
      }
    }

    if (groupBalance > 0) {
      creditIntegrateDetails.push(
        makeDetail(adjust.integrateAccountId, groupBalance, detail),
      );
      debitPeriodDetails.push(
        makeDetail(adjust.periodGLAccountId, groupBalance, detail),
      );
    }

    if (groupBalance < 0) {
      const amount = Math.abs(groupBalance);
      debitIntegrateDetails.push(
        makeDetail(adjust.integrateAccountId, amount, detail),
      );
      creditPeriodDetails.push(
        makeDetail(adjust.periodGLAccountId, amount, detail),
      );
    }

    periodBalance = fixNum(periodBalance + groupBalance, MONEY_PRECISION);

    pushTransaction(docs, base, TR_SIDES.DEBIT, debitTempDetails);
    pushTransaction(docs, base, TR_SIDES.CREDIT, creditTempDetails);
    pushTransaction(docs, base, TR_SIDES.DEBIT, debitIntegrateDetails);
    pushTransaction(docs, base, TR_SIDES.CREDIT, creditIntegrateDetails);
    pushTransaction(docs, base, TR_SIDES.DEBIT, debitPeriodDetails);
    pushTransaction(docs, base, TR_SIDES.CREDIT, creditPeriodDetails);
  }

  const taxAmount =
    taxableResult < 0 ? fixNum(Math.abs(taxableResult), MONEY_PRECISION) : 0;

  if (taxAmount > 0) {
    periodBalance = fixNum(periodBalance + taxAmount, MONEY_PRECISION);
    pushTransaction(docs, base, TR_SIDES.DEBIT, [
      makeDetail(adjust.periodGLAccountId, taxAmount, {}),
    ]);
    pushTransaction(docs, base, TR_SIDES.CREDIT, [
      makeDetail(adjust.taxPayableAccountId, taxAmount, {}),
    ]);
  }

  if (periodBalance > 0) {
    pushTransaction(docs, base, TR_SIDES.CREDIT, [
      makeDetail(adjust.periodGLAccountId, periodBalance, {}),
    ]);
    pushTransaction(docs, base, TR_SIDES.DEBIT, [
      makeDetail(adjust.earningAccountId, periodBalance, {}),
    ]);
  }

  if (periodBalance < 0) {
    const amount = Math.abs(periodBalance);
    pushTransaction(docs, base, TR_SIDES.DEBIT, [
      makeDetail(adjust.periodGLAccountId, amount, {}),
    ]);
    pushTransaction(docs, base, TR_SIDES.CREDIT, [
      makeDetail(adjust.earningAccountId, amount, {}),
    ]);
  }

  return { docs, details, taxAmount };
};

const buildClosingResult = async (models: IModels, adjust: IAdjustClosing) => {
  const { accounts, accountById } = await getTempAccounts(models);
  const endDate = getPureDate(adjust.date);

  if (!accounts.length) {
    return { beginDate: endDate, endDate, details: [] };
  }

  const accountIds = accounts.map((account) => account._id);
  const period = await getClosingPeriod(models, adjust, accountIds);
  const balances = await getClosingBalances(
    models,
    accountIds,
    accountById,
    period.endDate,
  );

  validateFinalBalances(
    balances,
    accountById,
    period.beginDate,
    period.endDate,
  );

  return {
    ...period,
    details: buildClosingDetails(balances, adjust),
  };
};

const removeClosingTransactions = async (
  models: IModels,
  adjust: IAdjustClosing,
) => {
  const parentIds = [
    adjust.closePeriodTrId,
    adjust.earningTrId,
    adjust.taxPayableTrId,
  ].filter((parentId): parentId is string => Boolean(parentId));

  for (const parentId of parentIds) {
    const oldTransaction = await models.Transactions.findOne({
      parentId,
    }).lean();

    if (oldTransaction) {
      await models.Transactions.removePTransaction({ parentId });
    }
  }
};

export const calculateAdjustClosing = async (
  models: IModels,
  userId: string,
  adjust: IAdjustClosing,
) => {
  await removeClosingTransactions(models, adjust);

  try {
    const result = await buildClosingResult(models, adjust);

    return models.AdjustClosings.updateAdjustClosing(adjust._id || '', {
      details: result.details,
      beginDate: result.beginDate,
      successDate: result.endDate,
      checkedAt: new Date(),
      status: 'process',
      error: '',
      warning: '',
      closePeriodTrId: '',
      earningTrId: '',
      taxPayableTrId: '',
      taxImpactValue: 0,
      modifiedBy: userId,
    });
  } catch (error) {
    const validationError =
      error instanceof ClosingValidationError ? error : undefined;

    return models.AdjustClosings.updateAdjustClosing(adjust._id || '', {
      details: [],
      beginDate:
        validationError?.beginDate ||
        adjust.beginDate ||
        getPureDate(adjust.date),
      successDate: validationError?.date,
      checkedAt: new Date(),
      status: 'process',
      error: error instanceof Error ? error.message : 'Validation failed.',
      warning: '',
      closePeriodTrId: '',
      earningTrId: '',
      taxPayableTrId: '',
      taxImpactValue: 0,
      modifiedBy: userId,
    });
  }
};

export const runAdjustClosingTransactions = async (
  models: IModels,
  userId: string,
  adjust: IAdjustClosing,
) => {
  const details = adjust.details?.length
    ? adjust.details
    : (await buildClosingResult(models, adjust)).details;

  if (!details.length) {
    throw new Error('No closing details to create transactions.');
  }

  await removeClosingTransactions(models, adjust);

  const result = buildTransactionDocs(adjust, details);
  const transactions = result.docs.length
    ? await models.Transactions.createPTransaction(result.docs, userId)
    : [];
  const parentId = transactions[0]?.parentId || '';

  return models.AdjustClosings.updateAdjustClosing(adjust._id || '', {
    details: result.details,
    closePeriodTrId: parentId,
    earningTrId: parentId,
    taxPayableTrId: result.taxAmount > 0 ? parentId : '',
    taxImpactValue: result.taxAmount,
    checkedAt: new Date(),
    status: 'complete',
    error: '',
    warning: '',
    modifiedBy: userId,
  });
};
