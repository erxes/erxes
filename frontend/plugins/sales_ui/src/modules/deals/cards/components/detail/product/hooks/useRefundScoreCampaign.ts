import { MutationHookOptions, useMutation } from '@apollo/client';
import { REFUND_SCORE_CAMPAIGN_MUTATION } from '../graphql/mutations/RefundScoreCampaignMutation';

export const useRefundScoreCampaign = (options?: MutationHookOptions) => {
  const [_refundScoreCampaign, { loading }] = useMutation(
    REFUND_SCORE_CAMPAIGN_MUTATION,
    options,
  );
  const mutate = (mutationOptions: MutationHookOptions) => {
    return _refundScoreCampaign({
      ...options,
      ...mutationOptions,
    });
  };
  return {
    refundScoreCampaign: mutate,
    loading,
  };
};
