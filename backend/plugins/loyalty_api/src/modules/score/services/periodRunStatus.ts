import { getPeriodStart } from '@/score/services/accountReset';
import {
  loyaltyTimeZone,
  nextPeriodRunAt,
  periodRunTimeZone,
} from '@/score/services/periodSchedule';
import { IModels } from '~/connectionResolvers';

const SHOWN_RUNS = 30;

// The wallets the next run resets, with how many accounts each.
const dueResets = async (models: IModels, subdomain: string, at: Date) => {
  const timeZone = await loyaltyTimeZone(subdomain);
  const accountTypes = await models.LoyaltyAccountTypes.find(
    { status: 'active', 'reset.period': { $in: ['monthly', 'yearly'] } },
    { name: 1, reset: 1 },
  ).lean();
  const resets: {
    accountTypeId: string;
    name: string;
    boundary: Date;
    accounts: number;
  }[] = [];

  for (const { _id, name, reset } of accountTypes) {
    if (!reset || reset.period === 'never') {
      continue;
    }

    const boundary = getPeriodStart(at, reset.period, timeZone);

    if (
      (reset.lastBoundary && reset.lastBoundary >= boundary) ||
      (reset.since && reset.since >= boundary)
    ) {
      continue;
    }

    const path = `balances.${_id}`;
    const accounts = await models.LoyaltyAccounts.countDocuments({
      status: { $ne: 'closed' },
      [path]: { $exists: true },
      $or: [
        { [`${path}.resetAt`]: { $exists: false } },
        { [`${path}.resetAt`]: { $lt: boundary } },
      ],
    });

    resets.push({ accountTypeId: _id, name, boundary, accounts });
  }

  return resets;
};

/**
 * Whether this organization has period runs, when the next one is and what
 * it will do, and how the last ones went; so none of it is found only in
 * Redis.
 */
export const getPeriodRunStatus = async (
  models: IModels,
  subdomain: string,
) => {
  const [nextRunAt, runs] = await Promise.all([
    nextPeriodRunAt(subdomain),
    models.LoyaltyPeriodRuns.find()
      .sort({ startedAt: -1 })
      .limit(SHOWN_RUNS)
      .lean(),
  ]);

  const preview = nextRunAt
    ? {
        releasing: await models.LoyaltyLots.countDocuments({
          status: 'pending',
          availableAt: { $lte: nextRunAt },
        }),
        expiring: await models.LoyaltyLots.countDocuments({
          status: 'available',
          remaining: { $gt: 0 },
          expiresAt: { $lte: nextRunAt },
        }),
        resets: await dueResets(models, subdomain, nextRunAt),
      }
    : null;

  return {
    nextRunAt,
    timeZone: periodRunTimeZone(),
    preview,
    runs,
  };
};
