import { IVoucherCampaignDocument } from '@/voucher/@types/voucherCampaign';
import { loyaltyTimeZone } from '@/score/services/periodSchedule';
import { zonedDate, zonedDayStart } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

/** Refused because the owner already has what the campaign allows. */
export class VoucherOwnerLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VoucherOwnerLimitError';
  }
}

const PERIOD_WORDS = {
  campaign: 'from this campaign',
  year: 'this year',
  month: 'this month',
} as const;

/** Where the current period began, in the organization's own calendar. */
const periodStart = async (
  subdomain: string,
  period: 'campaign' | 'year' | 'month',
  now: Date,
): Promise<Date | undefined> => {
  if (period === 'campaign') {
    return undefined;
  }

  const timeZone = await loyaltyTimeZone(subdomain);
  const today = zonedDate(now, timeZone);

  return zonedDayStart(
    { year: today.year, month: period === 'year' ? 1 : today.month, day: 1 },
    timeZone,
  );
};

/**
 * Owners, out of those given, that may still receive from this campaign.
 * Whatever the campaign hands out is counted: a voucher, or the spin or
 * lottery ticket it stands for.
 */
export const ownersWithinLimit = async (
  models: IModels,
  subdomain: string,
  campaign: IVoucherCampaignDocument,
  ownerIds: string[],
): Promise<{ allowed: string[]; refused: string[]; reason?: string }> => {
  const limit = campaign.perOwnerLimit;

  if (!limit?.count || !ownerIds.length) {
    return { allowed: ownerIds, refused: [] };
  }

  const since = await periodStart(subdomain, limit.period, new Date());
  const createdAt = since ? { createdAt: { $gte: since } } : {};

  const issued = new Map<string, number>();

  const tally = (rows: { _id: string; count: number }[]) =>
    rows.forEach(({ _id, count }) =>
      issued.set(_id, (issued.get(_id) || 0) + count),
    );

  const grouped = (match: Record<string, unknown>) => [
    { $match: { ...match, ownerId: { $in: ownerIds }, ...createdAt } },
    { $group: { _id: '$ownerId', count: { $sum: 1 } } },
  ];

  const [vouchers, spins, lotteries] = await Promise.all([
    models.Vouchers.aggregate(grouped({ campaignId: campaign._id })),
    models.Spins.aggregate(grouped({ voucherCampaignId: campaign._id })),
    models.Lotteries.aggregate(grouped({ voucherCampaignId: campaign._id })),
  ]);

  tally(vouchers);
  tally(spins);
  tally(lotteries);

  const allowed = ownerIds.filter(
    (ownerId) => (issued.get(ownerId) || 0) < limit.count,
  );
  const refused = ownerIds.filter((ownerId) => !allowed.includes(ownerId));

  return {
    allowed,
    refused,
    reason: refused.length
      ? `Already received ${limit.count} ${PERIOD_WORDS[limit.period]}`
      : undefined,
  };
};
