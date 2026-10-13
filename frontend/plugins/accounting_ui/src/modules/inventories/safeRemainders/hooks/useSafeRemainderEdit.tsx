import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { SAFE_REMAINDER_EDIT } from '../graphql/safeRemainderChange';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  SAFE_REMAINDER_DETAIL_QUERY,
  SAFE_REMAINDER_DETAILS_QUERY,
} from '../graphql/safeRemainderQueries';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';

export const useSafeRemainderEdit = (
  _id: string,
  options?: GraphqlMutationOptions<typeof SAFE_REMAINDER_EDIT>,
) => {
  const { t } = useTranslation('accounting');
  const [submitMutation, { loading }] = useMutation(
    SAFE_REMAINDER_EDIT,
    options,
  );

  const submitSafeRemainder = (
    options?: GraphqlMutationOptions<typeof SAFE_REMAINDER_EDIT, '_id'>,
  ) => {
    return submitMutation({
      ...options,
      variables: {
        _id,
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
          description: t('safe-remainder-updated'),
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: [
        {
          query: SAFE_REMAINDER_DETAIL_QUERY,
          variables: {
            _id,
          },
        },
        {
          query: SAFE_REMAINDER_DETAILS_QUERY,
          variables: {
            remainderId: _id,
            page: 1,
            perPage: ACC_TRS__PER_PAGE,
          },
        },
      ],
      awaitRefetchQueries: true,
    });
  };

  return {
    submitSafeRemainder,
    loading,
  };
};
