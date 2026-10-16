import { useQuery } from '@apollo/client';
import { SALES_STAGE_LOYALTY_POINTS } from '../graphql/loyaltyRulesQueries';
import { loyaltyBuiltInConfig } from '../loyaltyBuiltIn';

type TStageLoyalty = {
  _id: string;
  loyaltyPoints?: {
    earns?: { campaignId: string }[] | null;
    tier?: { accountTypeId: string } | null;
  } | null;
};

/** The campaigns and tier wallets this pipeline's stages feed built in. */
export const usePipelineLoyaltyBuiltIn = (pipelineId: string) => {
  const { data } = useQuery<{ salesStages: TStageLoyalty[] }>(
    SALES_STAGE_LOYALTY_POINTS,
    {
      variables: { pipelineId },
      skip: !pipelineId,
      fetchPolicy: 'cache-and-network',
    },
  );
  const stages = data?.salesStages || [];

  return loyaltyBuiltInConfig({
    earnCampaignIds: stages.flatMap(
      ({ loyaltyPoints }) =>
        loyaltyPoints?.earns?.map(({ campaignId }) => campaignId) || [],
    ),
    tierWalletIds: stages.flatMap(({ loyaltyPoints }) =>
      loyaltyPoints?.tier ? [loyaltyPoints.tier.accountTypeId] : [],
    ),
  });
};
