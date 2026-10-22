import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { SALES_STAGE_LOYALTY_POINTS } from '../graphql/loyaltyRulesQueries';
import { loyaltyBuiltInConfig } from '../loyaltyBuiltIn';

/** The campaigns and tier wallets this pipeline's stages feed built in. */
export const usePipelineLoyaltyBuiltIn = (pipelineId: string) => {
  const { data } = useQuery(SALES_STAGE_LOYALTY_POINTS, {
    variables: { pipelineId },
    skip: !pipelineId,
    fetchPolicy: 'cache-and-network',
  });
  const stages = data?.salesStages?.filter(isDefined) || [];

  return loyaltyBuiltInConfig({
    earnCampaignIds: stages.flatMap(
      ({ loyaltyPoints }) =>
        loyaltyPoints?.earns
          ?.filter(isDefined)
          .map(({ campaignId }) => campaignId)
          .filter(isDefined) || [],
    ),
    tierWalletIds: stages.flatMap(({ loyaltyPoints }) =>
      loyaltyPoints?.tier?.accountTypeId
        ? [loyaltyPoints.tier.accountTypeId]
        : [],
    ),
  });
};
