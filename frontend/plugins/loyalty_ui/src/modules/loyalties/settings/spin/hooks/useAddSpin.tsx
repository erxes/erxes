import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  CreateSpinCampaignMutation,
  CreateSpinCampaignMutationVariables,
} from '~/gql/graphql';
import { SPINS_CURSOR_SESSION_KEY } from '../constants/spinsCursorSessionKey';
import { CREATE_SPIN_CAMPAIGN } from '../graphql/mutations/SpinMutations';
import { QUERY_SPIN_CAMPAIGNS } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { SPINS_PER_PAGE } from './useSpins';

export const useAddSpin = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: SPINS_CURSOR_SESSION_KEY,
  });
  const [addSpin, { loading, error }] = useMutation(CREATE_SPIN_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_SPIN_CAMPAIGNS,
        variables: { limit: SPINS_PER_PAGE, cursor },
      },
    ],
  });

  const spinAdd = async (
    options: MutationHookOptions<
      CreateSpinCampaignMutation,
      CreateSpinCampaignMutationVariables
    >,
  ) => {
    return addSpin({
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('spin-campaign-created'),
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
    spinAdd,
    loading,
    error,
  };
};
