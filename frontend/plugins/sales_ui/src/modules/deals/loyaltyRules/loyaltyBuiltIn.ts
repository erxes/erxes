// What a sales source already does in loyalty on its own, handed to
// loyalty's settings tab as `config.loyalty` in loyalty's own terms.
export type TLoyaltyBuiltInConfig = {
  earnCampaignIds: string[];
  tierWalletIds: string[];
};

export const loyaltyBuiltInConfig = ({
  earnCampaignIds,
  tierWalletIds,
}: TLoyaltyBuiltInConfig) => ({
  loyalty: {
    earnCampaignIds: [...new Set(earnCampaignIds.filter(Boolean))],
    tierWalletIds: [...new Set(tierWalletIds.filter(Boolean))],
  },
});
