import {
  ILoyaltyAccountTypeExpiry,
  ILoyaltyAccountTypeReset,
} from '@/score/@types/accountType';
import {
  getNextPeriodStart,
  resetAccountType,
  TResetImpact,
} from '@/score/services/accountReset';
import { getLotExpiry, getPendingUntil } from '@/score/services/lotPolicy';
import { loyaltyTimeZone } from '@/score/services/periodSchedule';
import { IModels } from '~/connectionResolvers';

// Accounts a preview walks through; beyond this it says it looked at a part.
const PREVIEW_LIMIT = 2000;

export type TPeriodPreviewInput = {
  accountTypeId?: string;
  expiry?: ILoyaltyAccountTypeExpiry;
  reset?: ILoyaltyAccountTypeReset;
  pendingDays?: number;
};

/**
 * What a wallet's time settings do, in dates rather than option names, and
 * what its next reset would do to the accounts holding it if it ran now.
 * Unsaved settings are previewed as given; the impact comes from the reset's
 * own code in dry-run mode, so the preview and the real run cannot disagree.
 */
export const getAccountTypePeriodPreview = async (
  models: IModels,
  subdomain: string,
  { accountTypeId, expiry, reset, pendingDays }: TPeriodPreviewInput,
) => {
  const now = new Date();
  const timeZone = await loyaltyTimeZone(subdomain);
  const period = reset?.period || 'never';
  const nextReset =
    period === 'never' ? null : getNextPeriodStart(now, period, timeZone);
  const mode = expiry?.mode || 'none';

  const earnedNowExpiresAt =
    mode === 'calendar'
      ? nextReset
      : getLotExpiry({ expiry: { mode, months: expiry?.months } }, now) || null;

  const saved = accountTypeId
    ? await models.LoyaltyAccountTypes.findOne({ _id: accountTypeId }).lean()
    : null;

  let impact: (TResetImpact & { total: number; sampled: boolean }) | null =
    null;

  if (saved && nextReset) {
    const subject = {
      ...saved,
      expiry: { mode, months: expiry?.months },
      reset: { ...saved.reset, period, tierTo: reset?.tierTo || 'keep' },
    };
    const path = `balances.${saved._id}`;
    const [result, total] = await Promise.all([
      resetAccountType({
        models,
        subdomain,
        accountType: subject,
        boundary: nextReset,
        dryRun: true,
        limit: PREVIEW_LIMIT,
      }),
      models.LoyaltyAccounts.countDocuments({
        status: { $ne: 'closed' },
        [path]: { $exists: true },
      }),
    ]);

    impact = { ...result.impact, total, sampled: total > PREVIEW_LIMIT };
  }

  // Purchases this close to a reset would be spendable only after it, so they
  // earn nothing (see earnWindow).
  const noEarnFrom =
    mode === 'calendar' && nextReset && pendingDays
      ? new Date(nextReset.getTime() - pendingDays * 24 * 60 * 60 * 1000)
      : null;

  return {
    timeZone,
    nextReset,
    noEarnFrom,
    earnedNowExpiresAt,
    pendingUntil:
      getPendingUntil({ pendingDays: pendingDays || 0 }, now) || null,
    tierTo: period === 'never' ? null : reset?.tierTo || 'keep',
    impact,
  };
};
