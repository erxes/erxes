import { TCreatedVia } from 'erxes-api-shared/core-types';
import {
  ILoyaltyAccountTypeDocument,
  TLoyaltyResetPeriod,
} from '@/score/@types/accountType';
import { SCORE_ACTION } from '@/score/constants';
import { setAccountTier } from '@/score/services/accountTier';
import {
  applyScoreChange,
  fixScoreNumber,
  ScoreAction,
} from '@/score/services/scoreLedger';
import { IModels } from '~/connectionResolvers';

const zonedParts = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
};

const zoneOffset = (date: Date, timeZone: string) => {
  const { year, month, day, hour, minute, second } = zonedParts(date, timeZone);

  return (
    Date.UTC(year, month - 1, day, hour, minute, second) -
    Math.floor(date.getTime() / 1000) * 1000
  );
};

// Calendar periods in the organization's time zone: the 1st of the month or
// January 1st, at local midnight.
export const getPeriodStart = (
  now: Date,
  period: Exclude<TLoyaltyResetPeriod, 'never'>,
  timeZone: string,
) => {
  let zone = timeZone;

  try {
    zonedParts(now, zone);
  } catch {
    zone = 'UTC';
  }

  const { year, month } = zonedParts(now, zone);
  const wall = Date.UTC(year, period === 'monthly' ? month - 1 : 0, 1);
  const guess = new Date(wall - zoneOffset(new Date(wall), zone));

  return new Date(wall - zoneOffset(guess, zone));
};

// The start of the period after the current one: when the next reset runs.
export const getNextPeriodStart = (
  now: Date,
  period: Exclude<TLoyaltyResetPeriod, 'never'>,
  timeZone: string,
) => {
  const current = getPeriodStart(now, period, timeZone);
  const days = period === 'monthly' ? 32 : 367;

  return getPeriodStart(
    new Date(current.getTime() + days * 24 * 60 * 60 * 1000),
    period,
    timeZone,
  );
};

// Accounts reset per run; a run that reaches it hands the rest to another.
const RESET_BATCH = Number(process.env.LOYALTY_RESET_BATCH) || 500;

/**
 * What the account moved since the period began, pending earnings left out
 * (they are not in the balance yet). A run that comes after midnight keeps
 * this and clears only what the old period left.
 */
const changedSince = async ({
  models,
  accountId,
  accountTypeId,
  since,
}: {
  models: IModels;
  accountId: string;
  accountTypeId: string;
  since: Date;
}) => {
  const [logs] = await models.ScoreLogs.aggregate<{ total: number }>([
    {
      $match: {
        accountId,
        accountTypeId,
        createdAt: { $gte: since },
        action: { $ne: SCORE_ACTION.SET },
      },
    },
    { $group: { _id: null, total: { $sum: '$changeScore' } } },
  ]);
  const stillPending = await models.LoyaltyLots.sumOpen(
    { accountId, key: accountTypeId },
    'pending',
    { createdAt: { $gte: since } },
  );

  return fixScoreNumber((logs?.total || 0) - stillPending);
};

// What a reset takes from and gives to accounts; the preview reports it
// without writing, from the same loop the real run goes through.
export type TResetImpact = {
  accounts: number;
  pointsCleared: number;
  pointsKept: number;
  tierChanges: { from: string | null; to: string | null; accounts: number }[];
};

type TResetSubject = Pick<
  ILoyaltyAccountTypeDocument,
  '_id' | 'name' | 'createdUserId' | 'reset' | 'expiry' | 'tiers' | 'fieldId'
>;

/**
 * A period run acts for the wallet it runs: the entries it writes say so,
 * and are recorded under whoever made the wallet, the way an automation's
 * are under its owner.
 */
export const walletRunVia = (
  accountType: Pick<TResetSubject, '_id' | 'name' | 'createdUserId'>,
  runId?: string,
): TCreatedVia => ({
  source: 'wallet',
  sourceId: accountType._id,
  sourceName: accountType.name,
  runId,
  actorId: accountType.createdUserId,
});

// Resets up to a batch of accounts holding this type that have not gone
// through the period starting at `boundary`. Failed accounts stay unmarked
// and are retried on the next run. `dryRun` writes nothing and only counts.
export const resetAccountType = async ({
  models,
  subdomain,
  accountType,
  boundary,
  dryRun = false,
  limit = RESET_BATCH,
  runId,
}: {
  models: IModels;
  subdomain: string;
  accountType: TResetSubject;
  boundary: Date;
  dryRun?: boolean;
  limit?: number;
  runId?: string;
}) => {
  const { reset } = accountType;
  const path = `balances.${accountType._id}`;
  const lowest = (accountType.tiers || [])
    .filter(({ deprecated }) => !deprecated)
    .sort((a, b) => a.order - b.order)[0];
  const tierAfterReset =
    reset?.tierTo === 'none'
      ? null
      : reset?.tierTo === 'lowest'
      ? lowest?.key ?? null
      : undefined;

  const accounts = models.LoyaltyAccounts.find({
    status: { $ne: 'closed' },
    [path]: { $exists: true },
    $or: [
      { [`${path}.resetAt`]: { $exists: false } },
      { [`${path}.resetAt`]: { $lt: boundary } },
    ],
  })
    .limit(limit)
    .cursor();

  let failed = 0;
  let processed = 0;
  let resetCount = 0;
  const tierChanges = new Map<string, TResetImpact['tierChanges'][number]>();
  let pointsCleared = 0;
  let pointsKept = 0;

  for await (const account of accounts) {
    processed++;
    const entry = account.balances?.get(accountType._id);
    const balance = Number(entry?.balance) || 0;

    try {
      if (accountType.expiry?.mode === 'calendar') {
        const kept = Math.max(
          0,
          await changedSince({
            models,
            accountId: account._id,
            accountTypeId: accountType._id,
            since: boundary,
          }),
        );

        // Earned in the old period but still held back: it belongs to that
        // period and goes with it, rather than landing in the new one later.
        const oldPending = await models.LoyaltyLots.find(
          {
            accountId: account._id,
            key: accountType._id,
            status: 'pending',
            remaining: { $gt: 0 },
            createdAt: { $lt: boundary },
          },
          { remaining: 1, sourceLogId: 1 },
        ).lean();

        pointsKept = fixScoreNumber(pointsKept + kept);
        pointsCleared = fixScoreNumber(
          pointsCleared +
            Math.max(0, balance - kept) +
            oldPending.reduce((sum, lot) => sum + lot.remaining, 0),
        );

        for (const lot of dryRun ? [] : oldPending) {
          if (!lot.sourceLogId) {
            continue;
          }

          // Taken from the earning's pending lot, so the balance is not
          // touched and the ledger still sums to it.
          await applyScoreChange({
            models,
            subdomain,
            doc: {
              ownerType: account.ownerType,
              ownerId: account.ownerId,
              fieldId: accountType.fieldId,
              action: SCORE_ACTION.EXPIRE as ScoreAction,
              changeScore: -lot.remaining,
              sourceScoreLogId: lot.sourceLogId,
              serviceName: 'loyalty',
              description: 'Period reset: held-back points of the old period',
              bypassFreeze: true,
              preventNegativeBalance: false,
              createdVia: walletRunVia(accountType, runId),
            },
          });
        }

        // Through the ledger, so repair and history see the reset.
        if (!dryRun && balance !== kept) {
          await applyScoreChange({
            models,
            subdomain,
            doc: {
              ownerType: account.ownerType,
              ownerId: account.ownerId,
              fieldId: accountType.fieldId,
              action: SCORE_ACTION.SET as ScoreAction,
              changeScore: kept,
              serviceName: 'loyalty',
              description: 'Period reset',
              bypassFreeze: true,
              createdVia: walletRunVia(accountType, runId),
            },
          });
        }
      }

      // A tier won after the period began belongs to the new period.
      const tierIsOld =
        !entry?.tierSince || new Date(entry.tierSince) < boundary;

      if (tierAfterReset !== undefined && tierIsOld) {
        const from = entry?.tier ?? null;

        if (from !== tierAfterReset) {
          const key = `${from}>${tierAfterReset}`;
          const change = tierChanges.get(key) || {
            from,
            to: tierAfterReset,
            accounts: 0,
          };

          change.accounts++;
          tierChanges.set(key, change);
        }

        if (!dryRun) {
          await setAccountTier({
            models,
            subdomain,
            accountId: account._id,
            accountTypeId: accountType._id,
            tier: tierAfterReset,
            // A reset moves everyone at once; it is not a member's news.
            notify: false,
            via: { createdVia: walletRunVia(accountType, runId) },
          });
        }
      }

      if (!dryRun) {
        await models.LoyaltyAccounts.markReset(
          account._id,
          accountType._id,
          boundary,
        );
      }
      resetCount++;
    } catch (error) {
      failed++;
      console.error(
        `[loyalty reset] ${subdomain} account ${account.number}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  // A batch that failed whole would only fail again right away.
  const impact: TResetImpact = {
    accounts: resetCount,
    pointsCleared,
    pointsKept,
    tierChanges: [...tierChanges.values()],
  };

  return {
    failed,
    reset: resetCount,
    more: processed >= limit && failed < processed,
    impact,
  };
};

/** What was reset, and whether accounts are left for another run. */
export const resetDueAccountTypes = async ({
  models,
  subdomain,
  timeZone,
  now = new Date(),
  runId,
}: {
  models: IModels;
  subdomain: string;
  timeZone: string;
  now?: Date;
  runId?: string;
}) => {
  const accountTypes = await models.LoyaltyAccountTypes.find({
    status: 'active',
    'reset.period': { $in: ['monthly', 'yearly'] },
  });
  const result = { more: false, reset: 0, failed: 0 };

  for (const accountType of accountTypes) {
    const { reset } = accountType;

    if (!reset || reset.period === 'never') {
      continue;
    }

    const boundary = getPeriodStart(now, reset.period, timeZone);

    if (reset.lastBoundary && reset.lastBoundary >= boundary) {
      continue;
    }

    // A period that began before the reset was turned on is left alone.
    const typeResult =
      reset.since && reset.since >= boundary
        ? { failed: 0, reset: 0, more: false }
        : await resetAccountType({
            models,
            subdomain,
            accountType,
            boundary,
            runId,
          });

    result.reset += typeResult.reset;
    result.failed += typeResult.failed;

    if (typeResult.more) {
      result.more = true;
      continue;
    }

    if (!typeResult.failed) {
      await models.LoyaltyAccountTypes.updateOne(
        { _id: accountType._id },
        { $set: { 'reset.lastBoundary': boundary } },
      );
    }
  }

  return result;
};
