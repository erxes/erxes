import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QUERY_DONATE_CAMPAIGNS } from '../add-donation-campaign/graphql/queries/getCampaignsQuery';
import { UPDATE_DONATE_CAMPAIGN } from '../graphql/mutations/donationEditStatusMutations';

export function useDonationStatusEdit() {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();

  const [editDonation, { loading, error }] = useMutation(
    UPDATE_DONATE_CAMPAIGN,
    {
      refetchQueries: [
        {
          query: QUERY_DONATE_CAMPAIGNS,
        },
      ],
    },
  );

  const editStatus = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editDonation({
      variables: {
        id: variables._id,
        status: variables.status,
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('donation-status-updated'),
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
