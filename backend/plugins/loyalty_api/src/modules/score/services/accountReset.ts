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

// Resets up to a batch of accounts holding this type that have not gone
// through the period starting at `boundary`. Failed accounts stay unmarked
// and are retried on the next run.
export const resetAccountType = async ({
  models,
  subdomain,
  accountType,
  boundary,
}: {
  models: IModels;
  subdomain: string;
  accountType: ILoyaltyAccountTypeDocument;
  boundary: Date;
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
    .limit(RESET_BATCH)
    .cursor();

  let failed = 0;
  let processed = 0;

  for await (const account of accounts) {
    processed++;
    const entry = account.balances?.get(accountType._id);

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

        // Through the ledger, so repair and history see the reset.
        if (Number(entry?.balance) !== kept) {
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
            },
          });
        }
      }

      // A tier won after the period began belongs to the new period.
      const tierIsOld =
        !entry?.tierSince || new Date(entry.tierSince) < boundary;

      if (tierAfterReset !== undefined && tierIsOld) {
        await setAccountTier({
          models,
          subdomain,
          accountId: account._id,
          accountTypeId: accountType._id,
          tier: tierAfterReset,
        });
      }

      await models.LoyaltyAccounts.markReset(
        account._id,
        accountType._id,
        boundary,
      );
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
  return { failed, more: processed >= RESET_BATCH && failed < processed };
};

/** Returns whether accounts are left for another run. */
export const resetDueAccountTypes = async ({
  models,
  subdomain,
  timeZone,
  now = new Date(),
}: {
  models: IModels;
  subdomain: string;
  timeZone: string;
  now?: Date;
}) => {
  const accountTypes = await models.LoyaltyAccountTypes.find({
    status: 'active',
    'reset.period': { $in: ['monthly', 'yearly'] },
  });
  let more = false;

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
    const result =
      reset.since && reset.since >= boundary
        ? { failed: 0, more: false }
        : await resetAccountType({
            models,
            subdomain,
            accountType,
            boundary,
          });

    if (result.more) {
      more = true;
      continue;
    }

    if (!result.failed) {
      await models.LoyaltyAccountTypes.updateOne(
        { _id: accountType._id },
        { $set: { 'reset.lastBoundary': boundary } },
      );
    }
  }

  return more;
};
