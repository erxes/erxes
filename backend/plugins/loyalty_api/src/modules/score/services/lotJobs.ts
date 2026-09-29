import { ILoyaltyAccountTypeDocument } from '@/score/@types/accountType';
import { SCORE_ACTION } from '@/score/constants';
import {
  applyScoreChange,
  DEFAULT_BALANCE_KEY,
  fixScoreNumber,
  projectBalance,
  ScoreAction,
} from '@/score/services/scoreLedger';
import { IModels } from '~/connectionResolvers';

const describeError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

// A run that died between claiming a lot and finishing it leaves the claim
// behind; after this long it is looked at again.
const STALE_CLAIM_MS = 10 * 60 * 1000;

const accountPending = async (
  models: IModels,
  accountId: string,
  key: string,
) => {
  const account = await models.LoyaltyAccounts.findOne(
    { _id: accountId },
    { [`balances.${key}.pending`]: 1 },
  ).lean();

  return Number(account?.balances?.[key]?.pending) || 0;
};

/**
 * Settles releases that stopped halfway. Pending lots always add up to the
 * account's pending points, so the account says whether the move happened:
 * if its pending still counts the lot, it did not.
 */
const settleStaleReleases = async (models: IModels, now: Date) => {
  const stale = await models.LoyaltyLots.find({
    status: 'pending',
    releasingAt: { $lte: new Date(now.getTime() - STALE_CLAIM_MS) },
  }).lean();

  for (const lot of stale) {
    const [pending, lots] = await Promise.all([
      accountPending(models, lot.accountId, lot.key),
      models.LoyaltyLots.sumOpen(
        { accountId: lot.accountId, key: lot.key },
        'pending',
      ),
    ]);

    await models.LoyaltyLots.updateOne(
      { _id: lot._id },
      fixScoreNumber(pending - lots) === 0
        ? { $unset: { releasingAt: '' } }
        : { $set: { status: 'available' }, $unset: { releasingAt: '' } },
    );
  }
};

// Pending purchase earnings whose wait is over become spendable. The part of
// a lot that pays off debt stops being a lot: debt is backed by none.
export const releasePendingLots = async ({
  models,
  subdomain,
  now = new Date(),
}: {
  models: IModels;
  subdomain: string;
  now?: Date;
}) => {
  const accountTypes = new Map<string, ILoyaltyAccountTypeDocument | null>();

  await settleStaleReleases(models, now);

  for (;;) {
    // Claimed, not yet released: still pending until the account has moved.
    const lot = await models.LoyaltyLots.findOneAndUpdate(
      {
        status: 'pending',
        availableAt: { $lte: now },
        releasingAt: { $exists: false },
      },
      { $set: { releasingAt: now } },
      { new: true },
    ).lean();

    if (!lot) {
      break;
    }

    let released: { previous: number; next: number } | null;

    try {
      released = await models.LoyaltyAccounts.releasePending(
        lot.accountId,
        lot.key,
        lot.remaining,
      );
    } catch (error) {
      // Nothing moved; the next run tries again.
      await models.LoyaltyLots.updateOne(
        { _id: lot._id },
        { $unset: { releasingAt: '' } },
      );
      console.error(
        `[loyalty lots] ${subdomain} release ${lot._id}: ${describeError(
          error,
        )}`,
      );
      continue;
    }

    if (!released) {
      await models.LoyaltyLots.updateOne(
        { _id: lot._id },
        { $set: { status: 'closed' }, $unset: { releasingAt: '' } },
      );
      continue;
    }

    try {
      const backed = fixScoreNumber(
        Math.max(0, released.next) - Math.max(0, released.previous),
      );

      await models.LoyaltyLots.updateOne(
        { _id: lot._id },
        {
          $set: {
            status: backed <= 0 ? 'closed' : 'available',
            remaining: Math.max(0, Math.min(backed, lot.remaining)),
          },
          $unset: { releasingAt: '' },
        },
      );

      const account = await models.LoyaltyAccounts.findOne({
        _id: lot.accountId,
      }).lean();

      if (!account) {
        continue;
      }

      if (!accountTypes.has(lot.key)) {
        accountTypes.set(
          lot.key,
          lot.key === DEFAULT_BALANCE_KEY
            ? null
            : await models.LoyaltyAccountTypes.findOne({ _id: lot.key }),
        );
      }

      await projectBalance({
        models,
        subdomain,
        accountId: account._id,
        key: lot.key,
        accountTypeId: accountTypes.get(lot.key)?._id,
        ownerType: account.ownerType,
        ownerId: account.ownerId,
        recordId: account.ownerId,
        balance: released.next,
      });
    } catch (error) {
      console.error(
        `[loyalty lots] ${subdomain} release ${lot._id}: ${describeError(
          error,
        )}`,
      );
    }
  }
};

// Rolling expiry: each lot past its date loses what is left of it, through
// the ledger so history and reports show it as expired.
export const expireLots = async ({
  models,
  subdomain,
  now = new Date(),
}: {
  models: IModels;
  subdomain: string;
  now?: Date;
}) => {
  // A claim left by a run that died is taken back; a lot it did expire is
  // closed or empty by now and no longer matches.
  await models.LoyaltyLots.updateMany(
    {
      status: 'available',
      remaining: { $gt: 0 },
      expiringAt: { $lte: new Date(now.getTime() - STALE_CLAIM_MS) },
    },
    { $unset: { expiringAt: '' } },
  );

  for (;;) {
    // Claimed first, so two runs never expire the same lot twice.
    const lot = await models.LoyaltyLots.findOneAndUpdate(
      {
        status: 'available',
        expiresAt: { $lte: now },
        remaining: { $gt: 0 },
        expiringAt: { $exists: false },
      },
      { $set: { expiringAt: now } },
      { new: true },
    ).lean();

    if (!lot) {
      break;
    }

    try {
      const [account, accountType] = await Promise.all([
        models.LoyaltyAccounts.findOne({ _id: lot.accountId }).lean(),
        models.LoyaltyAccountTypes.findOne({ _id: lot.key }).lean(),
      ]);

      if (!account || !accountType?.fieldId) {
        continue;
      }

      // Never more than the account holds: expiry must not create debt.
      const amount = fixScoreNumber(
        Math.min(
          lot.remaining,
          Math.max(0, Number(account.balances?.[lot.key]?.balance) || 0),
        ),
      );

      if (amount <= 0) {
        await models.LoyaltyLots.updateOne(
          { _id: lot._id },
          { $set: { remaining: 0, status: 'closed' } },
        );
        continue;
      }

      await applyScoreChange({
        models,
        subdomain,
        doc: {
          ownerType: account.ownerType,
          ownerId: account.ownerId,
          fieldId: accountType.fieldId,
          action: SCORE_ACTION.EXPIRE as ScoreAction,
          changeScore: -amount,
          serviceName: 'loyalty',
          description: 'Points expired',
          bypassFreeze: true,
          preventNegativeBalance: false,
          lotId: lot._id,
        },
      });

      await models.LoyaltyLots.updateOne(
        { _id: lot._id },
        { $unset: { expiringAt: '' } },
      );
    } catch (error) {
      await models.LoyaltyLots.updateOne(
        { _id: lot._id },
        { $unset: { expiringAt: '' } },
      );
      console.error(
        `[loyalty lots] ${subdomain} expire ${lot._id}: ${describeError(
          error,
        )}`,
      );
    }
  }
};
