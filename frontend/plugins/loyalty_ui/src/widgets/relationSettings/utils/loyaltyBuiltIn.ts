// What the host source already does in loyalty on its own, handed over as
// `config.loyalty`; anything else there is ignored.
export type TLoyaltyBuiltIn = {
  campaignIds: string[];
  walletIds: string[];
};

const ids = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((id): id is string => typeof id === 'string' && !!id)
    : [];

export const readLoyaltyBuiltIn = (
  config?: Record<string, unknown>,
): TLoyaltyBuiltIn => {
  const loyalty = config?.loyalty as
    | { earnCampaignIds?: unknown; tierWalletIds?: unknown }
    | undefined;

  return {
    campaignIds: ids(loyalty?.earnCampaignIds),
    walletIds: ids(loyalty?.tierWalletIds),
  };
};
