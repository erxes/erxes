import { getNextPeriodStart } from '@/score/services/accountReset';
import { getPendingUntil } from '@/score/services/lotPolicy';
import { loyaltyTimeZone } from '@/score/services/periodSchedule';
import { IModels } from '~/connectionResolvers';

/**
 * Points a purchase would earn now but could spend only after the wallet's
 * next reset, which clears them first: such points are not given at all.
 * Returns the two dates when that is the case.
 */
export const heldPastReset = async ({
  models,
  subdomain,
  accountTypeId,
  now = new Date(),
}: {
  models: IModels;
  subdomain: string;
  accountTypeId?: string;
  now?: Date;
}) => {
  if (!accountTypeId) {
    return null;
  }

  const accountType = await models.LoyaltyAccountTypes.findOne(
    { _id: accountTypeId },
    { expiry: 1, reset: 1, pendingDays: 1 },
  ).lean();
  const period = accountType?.reset?.period;

  if (
    accountType?.expiry?.mode !== 'calendar' ||
    !accountType.pendingDays ||
    !period ||
    period === 'never'
  ) {
    return null;
  }

  const availableAt = getPendingUntil(accountType, now);
  const resetsAt = getNextPeriodStart(
    now,
    period,
    await loyaltyTimeZone(subdomain),
  );

  return availableAt && availableAt >= resetsAt
    ? { availableAt, resetsAt }
    : null;
};
