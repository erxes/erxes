import type { PaymentConfigItem } from '@/payments';

export type PayInfo = {
  score?: number;
  maxVal?: number;
  hasPopup: boolean;
  validQr: boolean;
  scoreOwnerId?: string;
  scoreCampaignId?: string;
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
  score: number,
  initialAmount: number,
  requiresQr: boolean,
  scoreOwnerId: string,
  scoreCampaignId: string,
): Record<string, PayInfo> => {
  const current = previous[type];
  const validQr = Boolean(
    current?.validQr &&
    current.scoreOwnerId === scoreOwnerId &&
    current.scoreCampaignId === scoreCampaignId,
  );
  const availableAmount = score + initialAmount;
  let maxVal = availableAmount;

  if (requiresQr && !validQr) {
    maxVal = 0;
  }

  const next: PayInfo = {
    hasPopup: requiresQr,
    score,
    maxVal,
    validQr,
    scoreOwnerId,
    scoreCampaignId,
  };

  if (
    current?.hasPopup === next.hasPopup &&
    current.score === next.score &&
    current.maxVal === next.maxVal &&
    current.validQr === next.validQr &&
    current.scoreOwnerId === next.scoreOwnerId &&
    current.scoreCampaignId === next.scoreCampaignId
  ) {
    return previous;
  }

  return {
    ...previous,
    [type]: next,
  };
};
