import type { PaymentConfigItem } from '@/payments';

export type PayInfo = {
  score?: number;
  maxVal?: number;
  hasPopup: boolean;
  validQr: boolean;
};

export const selectPaymentTypesForRender = (
  incoming: PaymentConfigItem[],
  previous: PaymentConfigItem[],
  saving: boolean,
): PaymentConfigItem[] =>
  saving && incoming.length === 0 && previous.length > 0 ? previous : incoming;

export const updatePayInfoForScore = (
  previous: Record<string, PayInfo>,
  type: string,
  score: number,
  initialAmount: number,
  requiresQr: boolean,
): Record<string, PayInfo> => {
  const current = previous[type];
  const validQr = current?.validQr || false;
  const availableAmount = score + initialAmount;
  const next: PayInfo = {
    hasPopup: requiresQr,
    score,
    maxVal: requiresQr ? (validQr ? availableAmount : 0) : availableAmount,
    validQr,
  };

  if (
    current?.hasPopup === next.hasPopup &&
    current.score === next.score &&
    current.maxVal === next.maxVal &&
    current.validQr === next.validQr
  ) {
    return previous;
  }

  return {
    ...previous,
    [type]: next,
  };
};
