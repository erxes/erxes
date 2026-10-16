import type { VoucherFormValues } from '../constants/voucherFormSchema';

export const VOUCHER_VALIDITY_UNITS = ['day', 'week', 'month'] as const;
export type TVoucherValidityUnit = (typeof VOUCHER_VALIDITY_UNITS)[number];

export type TVoucherValidity = {
  count: number;
  unit: TVoucherValidityUnit;
};

type TTermFields = Pick<
  VoucherFormValues,
  | 'startDate'
  | 'endDate'
  | 'noEndDate'
  | 'validityMode'
  | 'validityCount'
  | 'validityUnit'
>;

const toIso = (date?: Date | string | null) =>
  date ? new Date(date).toISOString() : null;

/** The term as the server takes it; nulls clear what an edit removed. */
export const toVoucherTerm = (data: TTermFields) => ({
  startDate: toIso(data.startDate),
  endDate: data.noEndDate ? null : toIso(data.endDate),
  validity:
    data.validityMode === 'period' && data.validityCount
      ? { count: data.validityCount, unit: data.validityUnit }
      : null,
});

/** A saved campaign's term as the form holds it. */
export const fromVoucherTerm = (campaign: {
  startDate?: string | null;
  endDate?: string | null;
  validity?: TVoucherValidity | null;
}): TTermFields => ({
  startDate: campaign.startDate ? new Date(campaign.startDate) : null,
  endDate: campaign.endDate ? new Date(campaign.endDate) : null,
  noEndDate: !campaign.endDate,
  validityMode: campaign.validity ? 'period' : 'campaign',
  validityCount: campaign.validity?.count,
  validityUnit: campaign.validity?.unit ?? 'month',
});
