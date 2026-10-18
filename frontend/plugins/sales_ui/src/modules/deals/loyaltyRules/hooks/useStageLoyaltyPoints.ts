import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { SALES_STAGE_LOYALTY_POINTS } from '../graphql/loyaltyRulesQueries';

/** What the saved rules make of one stage of the pipeline being edited. */
export const useStageLoyaltyPoints = (stageId: string) => {
  const [searchParams] = useSearchParams();
  const pipelineId = searchParams.get('pipelineId');

  const { data } = useQuery(SALES_STAGE_LOYALTY_POINTS, {
    variables: pipelineId ? { pipelineId } : undefined,
    skip: !pipelineId,
    fetchPolicy: 'cache-and-network',
  });

  const points = data?.salesStages
    ?.filter(isDefined)
    .find(({ _id }) => _id === stageId)?.loyaltyPoints;

  return {
    earns: points?.earns?.filter(isDefined) || [],
    refunds: !!points?.refunds,
    tier: points?.tier || null,
  };
};
