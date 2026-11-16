import type { PaymentConfigItem } from '@/payments';

export type PayInfo = {
  // The most money points may pay, from loyalty; this deal's own spend included.
  limit?: number;
  // No customer, a refused account, or the limit still loading.
  unavailable?: boolean;
  maxVal?: number;
  hasPopup: boolean;
  validQr: boolean;
  scoreOwnerId?: string;
  accountTypeId?: string;
};

/** Keeps configured payment types visible while a save returns partial data. */
export const selectPaymentTypesForRender = (
  incoming: PaymentConfigItem[],
  previous: PaymentConfigItem[],
  saving: boolean,
): PaymentConfigItem[] =>
  saving && incoming.length === 0 && previous.length > 0 ? previous : incoming;

/** Builds score payment state without reusing QR approval across identities. */
export const updatePayInfoForScore = (
  previous: Record<string, PayInfo>,
  type: string,
  limit: number,
  unavailable: boolean,
  requiresQr: boolean,
  scoreOwnerId: string,
  accountTypeId: string,
): Record<string, PayInfo> => {
  const current = previous[type];
  const validQr = Boolean(
    current?.validQr &&
      current.scoreOwnerId === scoreOwnerId &&
      current.accountTypeId === accountTypeId,
  );
  const maxVal = unavailable || (requiresQr && !validQr) ? 0 : limit;

  const next: PayInfo = {
    hasPopup: requiresQr,
    limit,
    unavailable,
    maxVal,
    validQr,
    scoreOwnerId,
    accountTypeId,
  };

  if (
    current?.hasPopup === next.hasPopup &&
    current.limit === next.limit &&
    current.unavailable === next.unavailable &&
    current.maxVal === next.maxVal &&
    current.validQr === next.validQr &&
    current.scoreOwnerId === next.scoreOwnerId &&
    current.accountTypeId === next.accountTypeId
  ) {
    return previous;
  }

  return {
    ...previous,
    [type]: next,
  };
};
