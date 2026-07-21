import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QUERY_SPIN_CAMPAIGNS } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { UPDATE_SPIN_CAMPAIGN } from '../graphql/mutations/spinEditStatusMutations';

export function useSpinStatusEdit() {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();

  const [editSpin, { loading, error }] = useMutation(UPDATE_SPIN_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_SPIN_CAMPAIGNS,
      },
    ],
  });

  const editStatus = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editSpin({
      variables: {
        _id: variables._id,
        status: variables.status,
      },
      onCompleted: (data) => {
        toast({
          title: t('success', 'Success'),
          description: t('spin-status-updated', 'Spin status updated successfully'),
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (err) => {
        toast({
          title: t('error', 'Error'),
          description: err.message,
          variant: 'destructive',
        });
        options?.onError?.(err);
      },
    });
  };

  return { editStatus, loading, error };
}
