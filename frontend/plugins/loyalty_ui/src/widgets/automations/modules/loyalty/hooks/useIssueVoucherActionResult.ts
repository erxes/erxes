import { IAutomationHistoryAction } from 'ui-modules';

// Mirrors the voucher documents loyalty_api's issue-voucher producer returns.
type TIssuedVoucher = {
  _id: string;
  campaignId: string;
  ownerId: string;
  ownerType?: string;
};

const isIssuedVoucher = (value: unknown): value is TIssuedVoucher =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as TIssuedVoucher).campaignId === 'string' &&
  typeof (value as TIssuedVoucher).ownerId === 'string';

export const useIssueVoucherActionResult = (
  action: IAutomationHistoryAction,
) => {
  const rows: unknown[] = Array.isArray(action.result?.result)
    ? action.result.result
    : [];

  return { vouchers: rows.filter(isIssuedVoucher) };
};
