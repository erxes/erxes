import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QUERY_SPIN_CAMPAIGNS } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { UPDATE_SPIN_CAMPAIGN } from '../graphql/mutations/editSpinMutation';

export function useEditSpin() {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();

  const [editSpin, { loading, error }] = useMutation(UPDATE_SPIN_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_SPIN_CAMPAIGNS,
      },
    ],
  });

  const spinEdit = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editSpin({
      variables: {
        id: variables._id,
        title: variables.title,
        buyScore: variables.buyScore,
        startDate: variables.startDate,
        endDate: variables.endDate,
        status: variables.status,
        type: variables.type,
        awards: variables.awards,
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('spin-campaign-updated'),
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

  return { spinEdit, loading, error };
}
