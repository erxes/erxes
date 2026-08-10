import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { UPDATE_SCORE_CAMPAIGN } from '../graphql/mutations/editLoyaltyScoreMutation';

export const useLoyaltyScoreEdit = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const [editStatus, { loading }] = useMutation(UPDATE_SCORE_CAMPAIGN);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    editStatus({
      ...options,
      variables,
      onCompleted: () => toast({ title: t('score-campaign-updated'), variant: 'success' }),
      onError(error) {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: ['GetScoreCampaigns'],
    });
  };
  return { editStatus: mutate, loading };
};
