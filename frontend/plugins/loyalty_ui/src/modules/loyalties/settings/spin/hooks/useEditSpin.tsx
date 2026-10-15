import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  UpdateSpinCampaignMutation,
  UpdateSpinCampaignMutationVariables,
} from '~/gql/graphql';
import { QUERY_SPIN_CAMPAIGNS } from '../add-spin-campaign/graphql/queries/getCampaignsQuery';
import { UPDATE_SPIN_CAMPAIGN } from '../graphql/mutations/spinEditStatusMutations';

type SpinEditVariables = Omit<UpdateSpinCampaignMutationVariables, 'id'> & {
  _id: string;
};

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

  const spinEdit = async (
    options: Omit<
      MutationHookOptions<
        UpdateSpinCampaignMutation,
        UpdateSpinCampaignMutationVariables
      >,
      'variables'
    > & { variables: SpinEditVariables },
  ) => {
    const { _id, ...variables } = options.variables;

    return editSpin({
      variables: {
        ...variables,
        id: _id,
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
