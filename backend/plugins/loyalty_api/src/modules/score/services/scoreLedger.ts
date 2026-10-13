import { TCreatedVia } from 'erxes-api-shared/core-types';
import { IScoreLogDocument } from '@/score/@types/scoreLog';
import { LOYALTY_ACCOUNT_TYPE_STATUSES, SCORE_ACTION } from '@/score/constants';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import {
  ILoyaltyAccountDocument,
  TLoyaltyAccountOwnerType,
} from '@/score/@types/account';
import { TLoyaltyFrozenBlocks } from '@/score/@types/accountType';
import { writeAccountBalance } from '@/score/services/accountBalance';
import { getLotExpiry, getPendingUntil } from '@/score/services/lotPolicy';
import { IEarnBreakdownItem } from '@/score/@types/earnTable';
import { IModels } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils';

export type ScoreAction =
  | 'add'
  | 'subtract'
  | 'set'
  | 'refund'
  | 'return'
  | 'expire';

export type OwnerScoreUpdate = {
  updatedCustomFieldsData?: Record<string, any>;
  updatedScore?: number;
};

export type ScoreLogLike = {
  action?: string;
  preScore?: number;
  changeScore?: number;
  createdAt?: Date;
  _id?: string;
};

export type ScoreOwner = {
  _id: string;
  score?: number;
  propertiesData?: Record<string, any>;
  customFieldsData?: Array<{
    field?: string;
    value?: any;
    numberValue?: any;
  }>;
};

export type ScoreTarget = {
  targetId?: string;
  targetType?: string;
  serviceName?: string;
};

export type ScoreChangeDoc = ScoreTarget & {
  ownerType: string;
  ownerId: string;
  campaignId?: string;
  fieldId?: string;
  action?: ScoreAction;
  changeScore?: number;
  description?: string;
  createdBy?: string;
  createdVia?: TCreatedVia;
  sourceScoreLogId?: string;
  createdAt?: Date;
  owner?: ScoreOwner;
  preventNegativeBalance?: boolean;
  // System writes such as period resets are not spending by the owner.
  bypassFreeze?: boolean;
  // The lot an expiry takes from.
  lotId?: string;
  breakdown?: IEarnBreakdownItem[];
};

export type RefundScoreDoc = ScoreTarget & {
  ownerType: string;
  ownerId: string;
  sourceScoreLogId?: string;
  scoreCampaignIds?: string[];
  checkInId?: string;
  description?: string;
  createdBy?: string;
  netTargetAddsForSubtract?: boolean;
};

export type ScoreBalanceQuery = {
  ownerType: string;
  ownerId: string;
  campaignId?: string;
  campaignIds?: string[];
  fieldId?: string;
};

export const fixScoreNumber = (value: number, fractionDigits = 4) => {
  const numberValue = Number(value) || 0;
  const multiplier = 10 ** fractionDigits;

  return Math.round((numberValue + Number.EPSILON) * multiplier) / multiplier;
};

export const getOwnerScoreValue = (owner: ScoreOwner, fieldId?: string) => {
  if (!fieldId) {
    return Number(owner?.score) || 0;
  }

  return (
    Number(
      owner?.propertiesData?.[fieldId] ??
        (owner?.customFieldsData || []).find(({ field }) => field === fieldId)
          ?.numberValue ??
        (owner?.customFieldsData || []).find(({ field }) => field === fieldId)
          ?.value,
    ) || 0
  );
};

export const getLogChangeScore = (log: ScoreLogLike) => {
  return Number(log?.changeScore) || 0;
};

const isAbsoluteScoreAction = (action?: string) =>
  action === SCORE_ACTION.SET || action === SCORE_ACTION.RETURN;

export const calculateScoreValueFromLogs = (logs: ScoreLogLike[]) =>
  fixScoreNumber(
    logs.reduce((score, log) => {
      const changeScore = getLogChangeScore(log);

      return isAbsoluteScoreAction(log.action)
        ? changeScore
        : score + changeScore;
    }, 0),
  );

export const resolveScoreAction = (
  changeScore: number,
  action?: ScoreAction,
): ScoreAction => {
  if (action) {
    return action;
  }

  if (changeScore < 0) {
    return SCORE_ACTION.SUBTRACT as ScoreAction;
  }

  return (action || SCORE_ACTION.ADD) as ScoreAction;
};

export const prepareScoreLogChange = ({
  action,
  changeScore,
}: {
  action?: ScoreAction;
  changeScore: number;
}) => {
  const normalizedChangeScore = fixScoreNumber(changeScore);
  const resolvedAction = resolveScoreAction(normalizedChangeScore, action);

  return {
    action: resolvedAction,
    changeScore: normalizedChangeScore,
  };
};

export const getOwnerScoreUpdate = ({
  fieldId,
  newScore,
}: {
  fieldId?: string;
  newScore: number;
}): OwnerScoreUpdate => {
  if (fieldId) {
    return { updatedCustomFieldsData: { [fieldId]: newScore } };
  }

  return { updatedScore: newScore };
};

// cpUser balances live on the linked customer, so its account is the customer's.
export const ACCOUNT_OWNER_TYPES: Record<string, TLoyaltyAccountOwnerType> = {
  customer: 'customer',
  company: 'company',
  user: 'user',
  cpUser: 'customer',
};

// Balance key of the owner's top-level score, kept beside account type ids.
export const DEFAULT_BALANCE_KEY = 'default';

export const resolveBalanceOwner = async (
  subdomain: string,
  ownerType: string,
  ownerId: string,
) => {
  const accountOwnerType = ACCOUNT_OWNER_TYPES[ownerType];

  if (!accountOwnerType) {
    throw new Error(`Unsupported owner type: ${ownerType}`);
  }

  if (ownerType !== 'cpUser') {
    return { accountOwnerType, recordId: ownerId };
  }

  const cpUser = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'cpUsers',
    action: 'get',
    input: { id: ownerId },
    defaultValue: null,
  });

  if (!cpUser?.erxesCustomerId) {
    throw new Error('Not Found Owner');
  }

  return { accountOwnerType, recordId: cpUser.erxesCustomerId as string };
};

export const updateOwnerScoreCache = async ({
  models,
  subdomain,
  ownerId,
  ownerType,
  updatedCustomFieldsData,
  updatedScore,
  mirrorToAccount = true,
}: OwnerScoreUpdate & {
  models: IModels;
  subdomain: string;
  ownerId: string;
  ownerType: string;
  // Off when the account balance was already changed atomically.
  mirrorToAccount?: boolean;
}) => {
  const fieldValues = updatedCustomFieldsData || {};
  const fieldIds = Object.keys(fieldValues);

  if (!fieldIds.length && updatedScore === undefined) {
    return { accountId: undefined };
  }

  const { accountOwnerType, recordId } = await resolveBalanceOwner(
    subdomain,
    ownerType,
    ownerId,
  );

  // Account balances are featured fields: only their account type may write them.
  const accountTypes = fieldIds.length
    ? await models.LoyaltyAccountTypes.find({
        fieldId: { $in: fieldIds },
      }).lean()
    : [];

  // Totals as the ledger has them; pending earnings are not spendable yet.
  const balances: Record<string, number> = {};

  for (const accountType of accountTypes) {
    balances[accountType._id] = fieldValues[accountType.fieldId as string];
  }

  if (updatedScore !== undefined) {
    balances[DEFAULT_BALANCE_KEY] = updatedScore;
  }

  let accountId: string | undefined;

  if (mirrorToAccount && Object.keys(balances).length) {
    const account = await models.LoyaltyAccounts.ensureOwnerAccount({
      ownerType: accountOwnerType,
      ownerId: recordId,
    });
    const pending: Record<string, number> = {};

    for (const [key, total] of Object.entries(balances)) {
      const lotRef = { accountId: account._id, key };

      await models.LoyaltyAccounts.markLotsBacked(account._id, key);
      pending[key] = await models.LoyaltyLots.sumOpen(lotRef, 'pending');
      balances[key] = fixScoreNumber(total - pending[key]);
      await models.LoyaltyLots.reconcileAvailable({
        ...lotRef,
        target: balances[key],
        expiresAt: getLotExpiry(accountTypes.find(({ _id }) => _id === key)),
      });
    }

    await models.LoyaltyAccounts.setBalances(account._id, balances, pending);
    accountId = account._id;
  }

  for (const accountType of accountTypes) {
    await writeAccountBalance(subdomain, {
      accountTypeId: accountType._id,
      ownerType,
      recordId,
      balance: balances[accountType._id],
    });
  }

  const spendableScore =
    updatedScore === undefined ? undefined : balances[DEFAULT_BALANCE_KEY];

  const accountFieldIds = new Set(accountTypes.map(({ fieldId }) => fieldId));
  const $set: Record<string, unknown> = {};

  // Per key, so values other writers hold in propertiesData survive.
  for (const fieldId of fieldIds) {
    if (!accountFieldIds.has(fieldId)) {
      $set[`propertiesData.${fieldId}`] = fieldValues[fieldId];
    }
  }

  if (spendableScore !== undefined) {
    $set.score = spendableScore;
  }

  if (!Object.keys($set).length) {
    return { accountId };
  }

  const ownerModule = {
    user: 'users',
    customer: 'customers',
    company: 'companies',
    cpUser: 'customers',
  }[ownerType];

  if (!ownerModule) {
    throw new Error(`Unsupported owner type: ${ownerType}`);
  }

  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: ownerModule,
    action: ownerModule === 'users' ? 'updateOne' : 'updateMany',
    input: {
      selector: { _id: recordId },
      modifier: { $set },
    },
    defaultValue: null,
  });

  return { accountId };
};

export const getScoreBalanceFromLogs = async (
  models: IModels,
  query: ScoreBalanceQuery,
) => {
  const { ownerType, ownerId, campaignId, campaignIds, fieldId } = query;
  const filter: Record<string, any> = { ownerType, ownerId };

  if (campaignId) {
    filter.campaignId = campaignId;
  } else if (campaignIds?.length) {
    filter.campaignId = { $in: campaignIds };
  } else if (fieldId) {
    const ids = await models.ScoreCampaigns.find({ fieldId }).distinct('_id');
    filter.campaignId = { $in: ids };
  }

  const logs = await models.ScoreLogs.find(filter)
    .sort({ createdAt: 1, _id: 1 })
    .lean();

  return calculateScoreValueFromLogs(logs);
};

const getCampaignFieldId = async (
  models: IModels,
  campaignId?: string,
  fieldId?: string,
) => {
  if (fieldId || !campaignId) {
    return fieldId;
  }

  const campaign = await models.ScoreCampaigns.findOne({ _id: campaignId })
    .select('fieldId')
    .lean();

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  return campaign?.fieldId;
};

// The top-level score as the ledger has it: every entry of campaigns that
// write no account type. Customers have no `score` field, so for them this
// is the only place that balance ever existed before accounts.
const getDefaultLedgerBalance = async (
  models: IModels,
  ownerType: string,
  ownerId: string,
) => {
  const typedCampaignIds = await models.ScoreCampaigns.find({
    fieldId: { $nin: [null, ''] },
  }).distinct('_id');
  const logs = await models.ScoreLogs.find({
    ownerType,
    ownerId,
    campaignId: { $nin: typedCampaignIds },
    // Campaign-less entries of an account type (resets) are not the default.
    accountTypeId: { $in: [null, ''] },
  })
    .sort({ createdAt: 1, _id: 1 })
    .lean();

  return fixScoreNumber(calculateScoreValueFromLogs(logs));
};

// What a balance started at before the owner's account tracked it.
const getUntrackedBalance = async ({
  models,
  ownerType,
  ownerId,
  owner,
  fieldId,
}: {
  models: IModels;
  ownerType: string;
  ownerId: string;
  owner: ScoreOwner;
  fieldId?: string;
}) =>
  fieldId
    ? getOwnerScoreValue(owner, fieldId)
    : getDefaultLedgerBalance(models, ownerType, ownerId);

// Read side of `changeBalance`: the account first, the pre-account source
// otherwise. Every balance shown or checked must come from here.
export const getOwnerBalance = async ({
  models,
  subdomain,
  ownerType,
  ownerId,
  fieldId,
  owner,
}: {
  models: IModels;
  subdomain: string;
  ownerType: string;
  ownerId: string;
  fieldId?: string;
  owner?: ScoreOwner;
}) => {
  const accountType = fieldId
    ? await models.LoyaltyAccountTypes.findOne({ fieldId }).lean()
    : null;
  const key = accountType
    ? accountType._id
    : fieldId
    ? undefined
    : DEFAULT_BALANCE_KEY;

  if (key) {
    const { accountOwnerType, recordId } = await resolveBalanceOwner(
      subdomain,
      ownerType,
      ownerId,
    );
    const account = await models.LoyaltyAccounts.findOne(
      { ownerType: accountOwnerType, ownerId: recordId },
      { [`balances.${key}`]: 1 },
    ).lean();
    const tracked = account?.balances?.[key]?.balance;

    if (tracked !== undefined) {
      return fixScoreNumber(Number(tracked) || 0);
    }
  }

  if (!fieldId) {
    return getDefaultLedgerBalance(models, ownerType, ownerId);
  }

  return getOwnerScoreValue(
    owner ||
      ((await getLoyaltyOwner(subdomain, {
        ownerType,
        ownerId,
      })) as ScoreOwner),
    fieldId,
  );
};

// A frozen account keeps earning unless its account type blocks everything;
// spending is anything that lowers the balance, including a lower `set`.
const assertAccountOpen = ({
  account,
  frozenBlocks = 'spending',
  change,
  absolute,
  current,
}: {
  account: ILoyaltyAccountDocument;
  frozenBlocks?: TLoyaltyFrozenBlocks;
  change: number;
  absolute: boolean;
  current: number;
}) => {
  if (account.status === 'closed') {
    throw new Error(`Loyalty account ${account.number} is closed`);
  }

  if (account.status !== 'frozen') {
    return;
  }

  const lowers = absolute ? change < current : change < 0;

  if (frozenBlocks === 'all' || lowers) {
    throw new Error(`Loyalty account ${account.number} is frozen`);
  }
};

const NOT_ENOUGH_SCORE = 'There has no enough score to subtract';

// Writes the owner's copy of a spendable balance (the featured field, or the
// top-level score). Concurrent writers may land their copies out of order;
// whoever lands last re-reads the account and corrects the copy.
export const projectBalance = async ({
  models,
  subdomain,
  accountId,
  key,
  accountTypeId,
  ownerType,
  ownerId,
  recordId,
  balance,
}: {
  models: IModels;
  subdomain: string;
  accountId: string;
  key: string;
  accountTypeId?: string;
  ownerType: string;
  ownerId: string;
  recordId: string;
  balance: number;
}) => {
  const writeProjection = (value: number) =>
    accountTypeId
      ? writeAccountBalance(subdomain, {
          accountTypeId,
          ownerType,
          recordId,
          balance: value,
        })
      : updateOwnerScoreCache({
          models,
          subdomain,
          ownerId,
          ownerType,
          updatedScore: value,
          mirrorToAccount: false,
        });

  let projected = fixScoreNumber(balance);

  for (let attempt = 0; attempt < 3; attempt++) {
    await writeProjection(projected);

    const latest = await models.LoyaltyAccounts.findOne(
      { _id: accountId },
      { [`balances.${key}.balance`]: 1 },
    ).lean();
    const current = fixScoreNumber(
      Number(latest?.balances?.[key]?.balance) || 0,
    );

    if (current === projected) {
      break;
    }

    projected = current;
  }
};

// The single place a balance changes. Balances with a key (an account type,
// or the default score) change atomically on the owner's loyalty account and
// the owner record only mirrors the result; a legacy custom field that is not
// an account type yet still goes through the owner snapshot.
export const changeBalance = async ({
  models,
  subdomain,
  ownerType,
  ownerId,
  owner,
  fieldId,
  change,
  absolute,
  preventNegativeBalance = true,
  bypassFreeze = false,
  purchaseEarn = false,
  logId,
  sourceLogId,
  lotId,
}: {
  models: IModels;
  subdomain: string;
  ownerType: string;
  ownerId: string;
  owner: ScoreOwner;
  fieldId?: string;
  change: number;
  absolute: boolean;
  preventNegativeBalance?: boolean;
  bypassFreeze?: boolean;
  // A purchase earning waits the account type's pending days.
  purchaseEarn?: boolean;
  // The log this change is written as; new lots point at it.
  logId?: string;
  // The earning a refund or recalculation takes back first.
  sourceLogId?: string;
  lotId?: string;
}) => {
  const accountType = fieldId
    ? await models.LoyaltyAccountTypes.findOne({ fieldId }).lean()
    : null;

  if (accountType?.status === LOYALTY_ACCOUNT_TYPE_STATUSES.ARCHIVED) {
    throw new Error(`Loyalty wallet "${accountType.name}" is archived`);
  }

  const key = accountType
    ? accountType._id
    : fieldId
    ? undefined
    : DEFAULT_BALANCE_KEY;

  if (!key) {
    const snapshot = getOwnerScoreValue(owner, fieldId);
    const next = fixScoreNumber(absolute ? change : snapshot + change);

    if (preventNegativeBalance && next < 0) {
      throw new Error(NOT_ENOUGH_SCORE);
    }

    await updateOwnerScoreCache({
      models,
      subdomain,
      ownerId,
      ownerType,
      ...getOwnerScoreUpdate({ fieldId, newScore: next }),
    });

    return { previous: snapshot, next, accountId: undefined, accountType };
  }

  const { accountOwnerType, recordId } = await resolveBalanceOwner(
    subdomain,
    ownerType,
    ownerId,
  );
  const ownerRef = { ownerType: accountOwnerType, ownerId: recordId };
  let account = await models.LoyaltyAccounts.getOwnerAccount(ownerRef);

  // Only a balance the account does not track yet needs its starting point.
  const untracked =
    account?.balances?.get(key)?.balance === undefined
      ? await getUntrackedBalance({
          models,
          ownerType,
          ownerId,
          owner,
          fieldId,
        })
      : undefined;

  if (!account) {
    // No account is opened just to fail a subtraction.
    if (!absolute && preventNegativeBalance && (untracked ?? 0) + change < 0) {
      throw new Error(NOT_ENOUGH_SCORE);
    }

    account = await models.LoyaltyAccounts.ensureOwnerAccount(ownerRef);
  }

  if (untracked !== undefined) {
    await models.LoyaltyAccounts.seedBalance(account._id, key, untracked);
  }

  const lotRef = { accountId: account._id, key };
  const now = new Date();
  const expiresAt = getLotExpiry(accountType, now);
  // A balance from before lots becomes one lot, exactly once.
  const unbacked = await models.LoyaltyAccounts.markLotsBacked(
    account._id,
    key,
  );

  if (unbacked) {
    await models.LoyaltyLots.addLot({
      ...lotRef,
      amount: unbacked,
      pending: false,
      availableAt: now,
      expiresAt,
    });
  }

  if (!bypassFreeze) {
    assertAccountOpen({
      account,
      frozenBlocks: accountType?.frozenBlocks,
      change,
      absolute,
      current: account.balances?.get(key)?.balance ?? untracked ?? 0,
    });
  }

  const pendingUntil =
    purchaseEarn && !absolute && change > 0
      ? getPendingUntil(accountType, now)
      : undefined;

  if (pendingUntil) {
    await models.LoyaltyAccounts.changePending(account._id, key, change);
    await models.LoyaltyLots.addLot({
      ...lotRef,
      amount: change,
      pending: true,
      availableAt: pendingUntil,
      expiresAt,
      sourceLogId: logId,
    });

    // The spendable balance and its copies do not move until release.
    const spendable = fixScoreNumber(
      account.balances?.get(key)?.balance ?? untracked ?? 0,
    );

    return {
      previous: spendable,
      next: spendable,
      accountId: account._id,
      accountType,
    };
  }

  // Taking back an earning starts with whatever of it is still pending.
  let spendableChange = change;

  if (!absolute && change < 0 && sourceLogId) {
    const takenPending = await models.LoyaltyLots.take({
      ...lotRef,
      amount: -change,
      status: 'pending',
      prefer: { sourceLogId },
      onlyPreferred: true,
    });

    if (takenPending) {
      await models.LoyaltyAccounts.changePending(
        account._id,
        key,
        -takenPending,
      );
      spendableChange = fixScoreNumber(change + takenPending);
    }
  }

  const applied =
    !absolute && !spendableChange
      ? {
          previous: account.balances?.get(key)?.balance ?? untracked ?? 0,
          next: account.balances?.get(key)?.balance ?? untracked ?? 0,
        }
      : await models.LoyaltyAccounts.applyBalanceChange({
          accountId: account._id,
          key,
          change: spendableChange,
          absolute,
          floor: preventNegativeBalance ? 0 : undefined,
        });

  if (!applied) {
    throw new Error(NOT_ENOUGH_SCORE);
  }

  const previous = fixScoreNumber(applied.previous);
  const next = fixScoreNumber(applied.next);

  // Lots back only the positive part of a balance; debt is backed by none.
  const backedChange = fixScoreNumber(
    Math.max(0, next) - Math.max(0, previous),
  );

  if (backedChange > 0) {
    await models.LoyaltyLots.addLot({
      ...lotRef,
      amount: backedChange,
      pending: false,
      availableAt: now,
      expiresAt,
      sourceLogId: logId,
    });
  } else if (backedChange < 0) {
    await models.LoyaltyLots.take({
      ...lotRef,
      amount: -backedChange,
      status: 'available',
      prefer: lotId ? { lotId } : sourceLogId ? { sourceLogId } : undefined,
    });
  }

  await projectBalance({
    models,
    subdomain,
    accountId: account._id,
    key,
    accountTypeId: accountType?._id,
    ownerType,
    ownerId,
    recordId,
    balance: next,
  });

  return { previous, next, accountId: account._id, accountType };
};

export const applyScoreChange = async ({
  models,
  subdomain,
  doc,
}: {
  models: IModels;
  subdomain: string;
  doc: ScoreChangeDoc;
}) => {
  const {
    ownerType,
    ownerId,
    campaignId,
    targetId,
    serviceName,
    description,
    createdBy = '',
    sourceScoreLogId,
    createdAt = new Date(),
    preventNegativeBalance = true,
    bypassFreeze,
    lotId,
    breakdown,
  } = doc;

  if (!ownerType || !ownerId) {
    throw new Error('You must provide a owner');
  }

  const owner =
    doc.owner || (await getLoyaltyOwner(subdomain, { ownerType, ownerId }));

  if (!owner) {
    throw new Error('Owner not found');
  }

  const changeScore = fixScoreNumber(Number(doc.changeScore) || 0);
  const isAbsoluteAction = isAbsoluteScoreAction(doc.action);

  if (!changeScore && !isAbsoluteAction) {
    throw new Error('Score change must not be zero');
  }

  const fieldId = await getCampaignFieldId(models, campaignId, doc.fieldId);
  const logId = new models.ScoreLogs()._id;
  const preparedChange = prepareScoreLogChange({
    action: doc.action,
    changeScore,
  });
  const {
    previous: previousScore,
    next: newScore,
    accountId,
    accountType,
  } = await changeBalance({
    models,
    subdomain,
    ownerType,
    ownerId,
    owner,
    fieldId,
    change: changeScore,
    absolute: isAbsoluteAction,
    preventNegativeBalance,
    bypassFreeze,
    purchaseEarn:
      preparedChange.action === SCORE_ACTION.ADD && !!campaignId && !!targetId,
    logId,
    sourceLogId: sourceScoreLogId,
    lotId,
  });

  const log = await models.ScoreLogs.create({
    _id: logId,
    breakdown,
    ownerId,
    ownerType,
    campaignId,
    accountTypeId: accountType?._id,
    accountId,
    preScore: previousScore,
    changeScore: preparedChange.changeScore,
    createdAt,
    description,
    createdBy,
    createdVia: doc.createdVia,
    serviceName,
    targetId,
    targetType: doc.targetType,
    action: preparedChange.action,
    sourceScoreLogId,
  });
  const appliedChange = isAbsoluteAction
    ? fixScoreNumber(newScore - previousScore)
    : changeScore;

  await models.ScoreLogs.recordActivity({
    log,
    changeScore: appliedChange,
    previousScore,
    newScore,
    walletName: accountType?.name,
  });

  return {
    log,
    fieldId,
    previousScore,
    newScore,
    changeScore: appliedChange,
    accountId,
  };
};

const findRefundSourceLog = async (
  models: IModels,
  {
    sourceScoreLogId,
    targetId,
    ownerType,
    ownerId,
  }: Pick<
    RefundScoreDoc,
    'sourceScoreLogId' | 'targetId' | 'ownerType' | 'ownerId'
  >,
) => {
  if (sourceScoreLogId) {
    return models.ScoreLogs.findOne({ _id: sourceScoreLogId });
  }

  if (!targetId) {
    throw new Error('Please provide target or source score log');
  }

  return (
    (await models.ScoreLogs.findOne({
      targetId,
      ownerId,
      ownerType,
      action: SCORE_ACTION.SET,
    })) ||
    (await models.ScoreLogs.findOne({
      targetId,
      ownerId,
      ownerType,
      action: SCORE_ACTION.SUBTRACT,
    })) ||
    (await models.ScoreLogs.findOne({
      targetId,
      ownerId,
      ownerType,
      action: SCORE_ACTION.ADD,
    }))
  );
};

export const getScoreValueBeforeLog = async (
  models: IModels,
  sourceLog: IScoreLogDocument,
) => {
  const logs = await models.ScoreLogs.find({
    _id: { $ne: sourceLog._id },
    ownerId: sourceLog.ownerId,
    ownerType: sourceLog.ownerType,
    campaignId: sourceLog.campaignId,
    createdAt: { $lt: sourceLog.createdAt },
  })
    .sort({ createdAt: 1, _id: 1 })
    .lean();

  return calculateScoreValueFromLogs(logs);
};

const getRefundChangeScore = async ({
  models,
  sourceLog,
  netTargetAddsForSubtract = true,
}: {
  models: IModels;
  sourceLog: IScoreLogDocument;
  netTargetAddsForSubtract?: boolean;
}) => {
  const sourceChangeScore = getLogChangeScore(sourceLog);

  if (sourceLog.action === SCORE_ACTION.SET) {
    return getScoreValueBeforeLog(models, sourceLog);
  }

  if (sourceLog.action !== SCORE_ACTION.SUBTRACT || !netTargetAddsForSubtract) {
    return -sourceChangeScore;
  }

  const addedScoreLogs = await models.ScoreLogs.find({
    targetId: sourceLog.targetId,
    ownerId: sourceLog.ownerId,
    ownerType: sourceLog.ownerType,
    action: SCORE_ACTION.ADD,
  });

  const totalAddedScore = addedScoreLogs.reduce(
    (sum, log) => sum + getLogChangeScore(log),
    0,
  );

  return -sourceChangeScore - totalAddedScore;
};

export const refundScoreChange = async ({
  models,
  subdomain,
  doc,
}: {
  models: IModels;
  subdomain: string;
  doc: RefundScoreDoc;
}) => {
  const sourceLog = await findRefundSourceLog(models, doc);

  if (!sourceLog) {
    throw new Error('Cannot find score log on this target');
  }

  const refundScoreLog = await models.ScoreLogs.exists({
    targetId: sourceLog.targetId,
    ownerId: sourceLog.ownerId,
    ownerType: sourceLog.ownerType,
    action: { $in: [SCORE_ACTION.REFUND, SCORE_ACTION.RETURN] },
    sourceScoreLogId: sourceLog._id,
  });

  if (refundScoreLog) {
    throw new Error(
      'Cannot refund loyalty score cause already refunded loyalty score',
    );
  }

  const changeScore = await getRefundChangeScore({
    models,
    sourceLog,
    netTargetAddsForSubtract: doc.netTargetAddsForSubtract,
  });

  return applyScoreChange({
    models,
    subdomain,
    doc: {
      ownerId: sourceLog.ownerId,
      ownerType: sourceLog.ownerType,
      campaignId: sourceLog.campaignId,
      serviceName: sourceLog.serviceName,
      targetId: sourceLog.targetId,
      targetType: sourceLog.targetType,
      sourceScoreLogId: sourceLog._id,
      action: sourceLog.action === SCORE_ACTION.SET ? 'return' : 'refund',
      changeScore,
      description: doc.description,
      createdBy: doc.createdBy,
      // Points already spent become debt that later earnings pay off.
      preventNegativeBalance: false,
    },
  });
};
