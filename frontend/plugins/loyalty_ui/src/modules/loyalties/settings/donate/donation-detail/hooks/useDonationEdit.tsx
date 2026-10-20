import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { UPDATE_DONATE_CAMPAIGN } from '../../graphql/mutations/donationEditStatusMutations';
import { QUERY_DONATE_CAMPAIGNS } from '../../add-donation-campaign/graphql/queries/getCampaignsQuery';

export const useDonationEdit = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();

  const [donationEdit, { loading }] = useMutation(UPDATE_DONATE_CAMPAIGN, {
    refetchQueries: [QUERY_DONATE_CAMPAIGNS],
    onCompleted: () => {
      toast({
        title: t('success'),
        description: t('donation-updated'),
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return { donationEdit, loading };
};
