import { useQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import { SALES_STAGE_LOYALTY_POINTS } from '../graphql/loyaltyRulesQueries';

type TStageLoyaltyPoints = {
  _id: string;
  loyaltyPoints?: {
    earns?: { campaignId: string; ruleType?: string }[];
    refunds?: boolean;
    tier?: { accountTypeId: string; ruleType?: string } | null;
  } | null;
};

/** What the saved rules make of one stage of the pipeline being edited. */
export const useStageLoyaltyPoints = (stageId: string) => {
  const [searchParams] = useSearchParams();
  const pipelineId = searchParams.get('pipelineId');

  const { data } = useQuery<{ salesStages: TStageLoyaltyPoints[] }>(
    SALES_STAGE_LOYALTY_POINTS,
    {
      variables: { pipelineId },
      skip: !pipelineId,
      fetchPolicy: 'cache-and-network',
    },
  );

  const points = data?.salesStages?.find(
    ({ _id }) => _id === stageId,
  )?.loyaltyPoints;

  return {
    earns: points?.earns || [],
    refunds: !!points?.refunds,
    tier: points?.tier || null,
  };
};
