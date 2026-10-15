import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  PosCoversEditMutation,
  PosCoversEditMutationVariables,
} from '~/gql/graphql';
import { POS_COVER_EDIT_MUTATION } from '../graphql/mutation/posCoverEditMutation';

export const usePosCoversEdit = (
  options?: MutationFunctionOptions<
    PosCoversEditMutation,
    PosCoversEditMutationVariables
  >,
) => {
  const { toast } = useToast();
  const { t } = useTranslation('sales');
  const [posCoversEdit, { loading, error }] = useMutation(
    POS_COVER_EDIT_MUTATION,
    {
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      ...options,
    },
  );
  return { posCoversEdit, loading, error };
};
