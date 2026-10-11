import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { ADJUST_INVENTORY_RUN } from '../graphql/adjustInventoryChange';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ADJUST_INVENTORY_DETAIL_QUERY,
  ADJUST_INVENTORY_DETAILS_QUERY,
} from '../graphql/adjustInventoryQueries';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';

export const useAdjustInventoryRun = (
  adjustId: string,
  options?: GraphqlMutationOptions<typeof ADJUST_INVENTORY_RUN>,
) => {
  const { t } = useTranslation('accounting');
  const [_runMutation, { loading }] = useMutation(
    ADJUST_INVENTORY_RUN,
    options,
  );

  const runAdjust = (
    options?: GraphqlMutationOptions<typeof ADJUST_INVENTORY_RUN>,
  ) => {
    return _runMutation({
      ...options,
      variables: {
        adjustId,
        ...options?.variables,
      },
      onError: (error: ApolloError) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('inventory-adjust-running-successfully'),
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: [
        {
          query: ADJUST_INVENTORY_DETAIL_QUERY,
          variables: {
            _id: adjustId,
          },
        },
        {
          query: ADJUST_INVENTORY_DETAILS_QUERY,
          variables: {
            _id: adjustId,
            page: 1,
            perPage: ACC_TRS__PER_PAGE,
          },
        },
      ],
      awaitRefetchQueries: true,
    });
  };

  return {
    runAdjust,
    loading,
  };
};
