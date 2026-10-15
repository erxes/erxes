import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  UpdateDonateCampaignMutation,
  UpdateDonateCampaignMutationVariables,
} from '~/gql/graphql';
import { UPDATE_DONATE_CAMPAIGN } from '../graphql/mutations/donationEditStatusMutations';
import { QUERY_DONATE_CAMPAIGNS } from '../add-donation-campaign/graphql/queries/getCampaignsQuery';

type StatusVariables = Pick<
  UpdateDonateCampaignMutationVariables,
  '_id' | 'status'
>;

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

  const editStatus = async (
    options: Omit<
      MutationHookOptions<
        UpdateDonateCampaignMutation,
        UpdateDonateCampaignMutationVariables
      >,
      'variables'
    > & { variables: StatusVariables },
  ) => {
    const { variables } = options;

    return editDonation({
      variables: {
        _id: variables._id,
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
