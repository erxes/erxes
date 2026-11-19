import { fixNum } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  IAdjustClosing,
  IAdjustClosingDetail,
} from '../@types/adjustClosingEntry';
import {
  ACCOUNT_JOURNALS,
  ACCOUNT_KINDS,
  JOURNALS,
  TR_SIDES,
  TR_STATUSES,
} from '../@types/constants';
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

const getPreviousClosing = (
  models: IModels,
  endDate: Date,
  excludeId?: string,
) =>
  models.AdjustClosings.findOne({
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    status: { $in: ['complete', 'publish'] },
    date: { $lt: endDate },
  })
    .sort({ date: -1 })
    .lean();

/**
 * The day after the previous closing; without one, the earliest transaction
 * date on any temporary account up to the closing date.
 */
const resolveBeginDate = async (
  models: IModels,
  endDate: Date,
  accountIds: string[],
  excludeId?: string,
) => {
  const previousClosing = await getPreviousClosing(models, endDate, excludeId);

  if (previousClosing?.date) {
    return getNextDate(previousClosing.date);
  }

  return getFirstTempTransactionDate(models, accountIds, endDate);
};

export const getAdjustClosingBeginDate = async (
  models: IModels,
  date: Date,
  excludeId?: string,
) => {
  const { accounts } = await getTempAccounts(models);

  if (!accounts.length) {
    return undefined;
  }

  return resolveBeginDate(
    models,
    getPureDate(date),
    accounts.map((account) => account._id),
    excludeId,
  );
};

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
  const beginDate = await resolveBeginDate(
    models,
    endDate,
    accountIds,
    adjust._id,
  );

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
  ptrId: string,
  side: string,
  details: ITrDetail[],
  journal: string = JOURNALS.CLOSING,
) => {
  if (!details.length) {
    return;
  }

  docs.push({
    ...base,
    ptrId,
    journal,
    status: TR_STATUSES.COMPLETE,
    side,
    details,
  });
};

/**
 * Every balanced posting gets its own ptrId: per branch/department, temporary
 * accounts against the integration account, then the integration account
 * against period gain/loss; then tax payable; then retained earnings.
 * Postings use the closing journal, except the tax payable side, which is a
 * payable transaction when that account belongs to the debt journal.
 */
const buildTransactionDocs = (
  adjust: IAdjustClosing,
  details: IAdjustClosingDetail[],
  taxPayableJournal: string,
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
    const debitTempIntegrateDetails: ITrDetail[] = [];
    const creditTempIntegrateDetails: ITrDetail[] = [];
    let groupBalance = 0;
    // Branch/department-level postings carry the group on the transaction
    // itself; tax and retained earnings are posted once, without a group.
    const groupBase = {
      ...base,
      branchId: detail.branchId,
      departmentId: detail.departmentId,
    };

    for (const entry of detail.entries) {
      const amount = Math.abs(entry.balance);
      taxableResult = fixNum(
        taxableResult + entry.balance * ((entry.percent ?? 0) / 100),
        MONEY_PRECISION,
      );
      groupBalance = fixNum(groupBalance + entry.balance, MONEY_PRECISION);

      if (entry.balance > 0) {
        creditTempDetails.push(makeDetail(entry.accountId, amount, detail));
        debitTempIntegrateDetails.push(
          makeDetail(adjust.integrateAccountId, amount, detail),
        );
      }

      if (entry.balance < 0) {
        debitTempDetails.push(makeDetail(entry.accountId, amount, detail));
        creditTempIntegrateDetails.push(
          makeDetail(adjust.integrateAccountId, amount, detail),
        );
      }
    }

    const tempPtrId = nanoid();
    pushTransaction(
      docs,
      groupBase,
      tempPtrId,
      TR_SIDES.DEBIT,
      debitTempDetails,
    );
    pushTransaction(
      docs,
      groupBase,
      tempPtrId,
      TR_SIDES.CREDIT,
      creditTempDetails,
    );
    pushTransaction(
      docs,
      groupBase,
      tempPtrId,
      TR_SIDES.DEBIT,
      debitTempIntegrateDetails,
    );
    pushTransaction(
      docs,
      groupBase,
      tempPtrId,
      TR_SIDES.CREDIT,
      creditTempIntegrateDetails,
    );

    const integratePtrId = nanoid();
    const groupAmount = Math.abs(groupBalance);

    if (groupBalance > 0) {
      pushTransaction(docs, groupBase, integratePtrId, TR_SIDES.CREDIT, [
        makeDetail(adjust.integrateAccountId, groupAmount, detail),
      ]);
      pushTransaction(docs, groupBase, integratePtrId, TR_SIDES.DEBIT, [
        makeDetail(adjust.periodGLAccountId, groupAmount, detail),
      ]);
    }

    if (groupBalance < 0) {
      pushTransaction(docs, groupBase, integratePtrId, TR_SIDES.DEBIT, [
        makeDetail(adjust.integrateAccountId, groupAmount, detail),
      ]);
      pushTransaction(docs, groupBase, integratePtrId, TR_SIDES.CREDIT, [
        makeDetail(adjust.periodGLAccountId, groupAmount, detail),
      ]);
    }

    periodBalance = fixNum(periodBalance + groupBalance, MONEY_PRECISION);
  }

  const taxAmount =
    taxableResult < 0 ? fixNum(Math.abs(taxableResult), MONEY_PRECISION) : 0;

  if (taxAmount > 0) {
    const taxPtrId = nanoid();
    periodBalance = fixNum(periodBalance + taxAmount, MONEY_PRECISION);
    pushTransaction(docs, base, taxPtrId, TR_SIDES.DEBIT, [
      makeDetail(adjust.periodGLAccountId, taxAmount, {}),
    ]);
    pushTransaction(
      docs,
      base,
      taxPtrId,
      TR_SIDES.CREDIT,
      [makeDetail(adjust.taxPayableAccountId, taxAmount, {})],
      taxPayableJournal,
    );
  }

  const earningPtrId = nanoid();
  const periodAmount = Math.abs(periodBalance);

  if (periodBalance > 0) {
    pushTransaction(docs, base, earningPtrId, TR_SIDES.CREDIT, [
      makeDetail(adjust.periodGLAccountId, periodAmount, {}),
    ]);
    pushTransaction(docs, base, earningPtrId, TR_SIDES.DEBIT, [
      makeDetail(adjust.earningAccountId, periodAmount, {}),
    ]);
  }

  if (periodBalance < 0) {
    pushTransaction(docs, base, earningPtrId, TR_SIDES.DEBIT, [
      makeDetail(adjust.periodGLAccountId, periodAmount, {}),
    ]);
    pushTransaction(docs, base, earningPtrId, TR_SIDES.CREDIT, [
      makeDetail(adjust.earningAccountId, periodAmount, {}),
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

export const removeClosingTransactions = async (
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
  await models.AdjustClosings.checkAdjustClosingEditable(adjust._id || '');
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
  await models.AdjustClosings.checkAdjustClosingEditable(adjust._id || '');

  const details = adjust.details?.length
    ? adjust.details
    : (await buildClosingResult(models, adjust)).details;

  if (!details.length) {
    throw new Error('No closing details to create transactions.');
  }

  await removeClosingTransactions(models, adjust);

  const taxPayableAccount = await models.Accounts.findOne(
    { _id: adjust.taxPayableAccountId },
    { journal: 1 },
  ).lean();
  const result = buildTransactionDocs(
    adjust,
    details,
    taxPayableAccount?.journal === ACCOUNT_JOURNALS.DEBT
      ? JOURNALS.PAYABLE
      : JOURNALS.CLOSING,
  );
  const transactions = result.docs.length
    ? await models.Transactions.createPTransaction(result.docs, userId, {
        preservePtrIds: true,
      })
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
