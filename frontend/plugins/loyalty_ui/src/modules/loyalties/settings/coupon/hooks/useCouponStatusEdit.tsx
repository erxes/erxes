import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { UPDATE_COUPON_CAMPAIGN } from '../graphql/mutations/couponEditStatusMutations';
import { QUERY_COUPON_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';

export function useCouponStatusEdit() {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();

  const [editCoupon, { loading, error }] = useMutation(UPDATE_COUPON_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_COUPON_CAMPAIGNS,
      },
    ],
  });

  const editStatus = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editCoupon({
      variables: {
        _id: variables._id,
        status: variables.status,
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('coupon-status-updated'),
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message,
          variant: 'destructive',
        });
        options?.onError?.(err);
      },
    });
  };

  return { editStatus, loading, error };
}
