import { FilterQuery } from 'mongoose';

export const VOUCHER_VALIDITY_UNITS = ['day', 'week', 'month'] as const;
export type TVoucherValidityUnit = (typeof VOUCHER_VALIDITY_UNITS)[number];

/** How long one voucher works from the moment it is issued. */
export interface IVoucherValidity {
  count: number;
  unit: TVoucherValidityUnit;
}

type TDateLike = Date | string | null | undefined;

type TCampaignDates = {
  startDate?: TDateLike;
  endDate?: TDateLike;
  finishDateOfUse?: TDateLike;
};

const toDate = (value: TDateLike) => (value ? new Date(value) : undefined);

/** A campaign without a start or an end is open on that side. */
export const isCampaignIssuing = (
  campaign: TCampaignDates,
  now = new Date(),
) => {
  const startDate = toDate(campaign.startDate);
  const endDate = toDate(campaign.endDate);

  return (!startDate || startDate <= now) && (!endDate || endDate >= now);
};

/** The same window as a query; `null` matches a missing date too. */
export const campaignIssuingSelector = (
  now = new Date(),
): FilterQuery<TCampaignDates> => ({
  $and: [
    { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
    { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
  ],
});

export const addValidity = (from: Date, { count, unit }: IVoucherValidity) => {
  const date = new Date(from);

  if (unit === 'month') {
    date.setMonth(date.getMonth() + count);
  } else {
    date.setDate(date.getDate() + count * (unit === 'week' ? 7 : 1));
  }

  return date;
};

/**
 * When a voucher stops working. One with its own term keeps it past the
 * campaign's end; one without follows the campaign. The use deadline
 * (`finishDateOfUse`) closes both.
 */
export const voucherExpiresAt = (
  voucher: { config?: { endDate?: TDateLike } | null },
  campaign: TCampaignDates,
) => {
  const own = toDate(voucher.config?.endDate);
  const deadline = toDate(campaign.finishDateOfUse);

  if (!own) {
    return deadline ?? toDate(campaign.endDate);
  }

  return deadline && deadline < own ? deadline : own;
};
