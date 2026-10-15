import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  CreateDonateCampaignMutation,
  CreateDonateCampaignMutationVariables,
} from '~/gql/graphql';
import { DONATIONS_CURSOR_SESSION_KEY } from '../constants/donationsCursorSessionKey';
import { CREATE_DONATE_CAMPAIGN } from '../graphql/mutations/DonationMutations';
import { QUERY_DONATE_CAMPAIGNS } from '../add-donation-campaign/graphql/queries/getCampaignsQuery';
import { DONATIONS_PER_PAGE } from './useDonations';

export const useAddDonation = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: DONATIONS_CURSOR_SESSION_KEY,
  });
  const [addDonation, { loading, error }] = useMutation(
    CREATE_DONATE_CAMPAIGN,
    {
      refetchQueries: [
        {
          query: QUERY_DONATE_CAMPAIGNS,
          variables: { limit: DONATIONS_PER_PAGE, cursor },
        },
      ],
    },
  );

  const donationAdd = async (
    options: MutationHookOptions<
      CreateDonateCampaignMutation,
      CreateDonateCampaignMutationVariables
    >,
  ) => {
    return addDonation({
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('donation-campaign-created'),
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
    });
  };

  return {
    donationAdd,
    loading,
    error,
  };
};
